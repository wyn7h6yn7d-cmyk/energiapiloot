export type MajorDeviceKey =
  | "ev"
  | "boiler"
  | "heat_pump"
  | "cooling"
  | "commercial_refrigeration"
  | "machinery";

export type ConsumptionProfileInputs = {
  monthlyKwh: number;
  avgAllInEurPerKwh: number;
  dayShare: number; // 0..1 share of kWh during day hours
  weekendShare: number; // 0..1 share of kWh on weekend days
  baseLoadW: number;
  devices: Record<MajorDeviceKey, boolean>;
  peakHourDependency: number; // 0..1 how much user is exposed to peak hours pricing
};

export type ConsumptionPatternPoint = { hour: string; kwh: number };

export type CostDriver = {
  key: string;
  label: string;
  kwhMonthly: number;
  eurMonthly: number;
  note: string;
};

export type AnomalyFlag = {
  severity: "info" | "warn" | "high";
  title: string;
  description: string;
};

export type SavingsOpportunity = {
  id: string;
  title: string;
  estMonthlyEur: number;
  confidence: "kõrge" | "keskmine" | "madal";
  rationale: string;
};

export type PlainRecommendation = {
  title: string;
  bullets: string[];
};

export type ConsumptionInsights = {
  pattern: ConsumptionPatternPoint[];
  drivers: CostDriver[];
  /** Lühike selgitus, kuidas draiverid seostuvad kogukuluga */
  driversExplainerEt: string;
  anomalies: AnomalyFlag[];
  opportunities: SavingsOpportunity[];
  /** Ühiselt kõigile säästuhinnangutele */
  opportunitiesDisclaimerEt: string;
  recommendations: PlainRecommendation;
  kpis: {
    baseLoadShare: number; // 0..1
    estMonthlyBaseKwh: number;
    estMonthlyCostEur: number;
    peakDependencyScore: number; // 0..100
  };
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function sigmoid01(x: number) {
  return 1 / (1 + Math.exp(-x));
}

const DEVICE_KWH_MONTH: Record<MajorDeviceKey, number> = {
  ev: 150,
  boiler: 120,
  heat_pump: 320,
  cooling: 90,
  commercial_refrigeration: 260,
  machinery: 380,
};

const DEVICE_LABEL_SHORT: Record<MajorDeviceKey, string> = {
  ev: "Elektriauto",
  boiler: "Boiler",
  heat_pump: "Soojuspump",
  cooling: "Jahutus",
  commercial_refrigeration: "Külmutus (äri)",
  machinery: "Masinad",
};

/**
 * Jaotab kuu kWh baasi ja “ülejäägi” vahel, seejärel ülejäägi aktiivsete seadmete mallide järgi.
 * Kui mallide summa ületab ülejäägi, skaleeritakse — draiverite kWh summa = alati monthlyKwh.
 */
function partitionMonthlyKwh(
  monthlyKwh: number,
  baseLoadW: number,
  devices: Record<MajorDeviceKey, boolean>
): {
  baseKwh: number;
  deviceKwh: Partial<Record<MajorDeviceKey, number>>;
  otherKwh: number;
  devicesScaled: boolean;
} {
  const rawBase = (baseLoadW / 1000) * 24 * 30;
  const baseKwh = Math.min(Math.max(0, rawBase), Math.max(0, monthlyKwh));
  const pool = Math.max(0, monthlyKwh - baseKwh);

  const active = (Object.keys(devices) as MajorDeviceKey[]).filter((k) => devices[k]);
  const templateSum = active.reduce((s, k) => s + DEVICE_KWH_MONTH[k], 0);

  const deviceKwh: Partial<Record<MajorDeviceKey, number>> = {};
  let devicesScaled = false;

  if (pool <= 0 || active.length === 0) {
    return { baseKwh, deviceKwh, otherKwh: pool, devicesScaled: false };
  }

  if (templateSum <= pool) {
    for (const k of active) {
      deviceKwh[k] = DEVICE_KWH_MONTH[k];
    }
    const used = templateSum;
    return { baseKwh, deviceKwh, otherKwh: round2(pool - used), devicesScaled: false };
  }

  const scale = pool / templateSum;
  devicesScaled = true;
  for (const k of active) {
    deviceKwh[k] = round2(DEVICE_KWH_MONTH[k] * scale);
  }
  const used = active.reduce((s, k) => s + (deviceKwh[k] ?? 0), 0);
  return { baseKwh, deviceKwh, otherKwh: round2(Math.max(0, pool - used)), devicesScaled };
}

export function buildConsumptionInsights(raw: ConsumptionProfileInputs): ConsumptionInsights {
  const monthlyKwh = Math.max(0, raw.monthlyKwh);
  const avgAllIn = Math.max(0.01, raw.avgAllInEurPerKwh);

  const dayShare = clamp(raw.dayShare, 0.2, 0.9);
  const weekendShare = clamp(raw.weekendShare, 0.15, 0.6);
  const baseLoadW = Math.max(0, raw.baseLoadW);

  const { baseKwh, deviceKwh, otherKwh, devicesScaled } = partitionMonthlyKwh(monthlyKwh, baseLoadW, raw.devices);

  const discretionaryKwh = Math.max(0, monthlyKwh - baseKwh);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayHours = new Set<number>([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

  const basePerHour = monthlyKwh > 0 ? baseKwh / 30 / 24 : 0;

  const peakShape = (h: number) => {
    const morning = Math.exp(-Math.pow((h - 8) / 2.4, 2));
    const evening = Math.exp(-Math.pow((h - 19) / 2.8, 2));
    return 0.45 * morning + 0.55 * evening;
  };

  const weights = hours.map((h) => {
    const inDay = dayHours.has(h);
    const bucketBias = inDay ? dayShare : 1 - dayShare;
    const shape = 0.6 + peakShape(h);
    const evBias = raw.devices.ev ? (inDay ? 0.85 : 1.25) : 1;
    const coolingBias = raw.devices.cooling ? (inDay ? 1.18 : 0.92) : 1;
    const heatPumpBias = raw.devices.heat_pump ? (inDay ? 1.04 : 0.98) : 1;
    const boilerBias = raw.devices.boiler ? (inDay ? 1.05 : 0.98) : 1;
    const fridgeBias = raw.devices.commercial_refrigeration ? 1.02 : 1;
    const machineBias = raw.devices.machinery ? (inDay ? 1.12 : 0.88) : 1;

    return bucketBias * shape * evBias * coolingBias * heatPumpBias * boilerBias * fridgeBias * machineBias;
  });

  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  const discretionaryPerDay = discretionaryKwh / 30;

  const pattern: ConsumptionPatternPoint[] = hours.map((h, idx) => {
    const discHour = (weights[idx]! / wSum) * discretionaryPerDay;
    return { hour: `${String(h).padStart(2, "0")}:00`, kwh: round2(basePerHour + discHour) };
  });

  const devicePeakBias =
    (raw.devices.cooling ? 0.12 : 0) +
    (raw.devices.machinery ? 0.18 : 0) +
    (raw.devices.heat_pump ? 0.1 : 0) -
    (raw.devices.ev ? 0.08 : 0);
  const peakDep = clamp(raw.peakHourDependency, 0, 1);
  const peakDependencyScore = Math.round(
    clamp(100 * sigmoid01((dayShare - 0.5) * 3.1 + (peakDep - 0.5) * 3.0 + devicePeakBias), 0, 100)
  );

  const baseLoadShare = monthlyKwh > 0 ? clamp(baseKwh / monthlyKwh, 0, 1) : 0;
  const estMonthlyCostEur = round2(monthlyKwh * avgAllIn);

  const drivers: CostDriver[] = [];
  if (baseKwh > 0.05) {
    drivers.push({
      key: "base",
      label: "Baas-koormus (24/7)",
      kwhMonthly: round1(baseKwh),
      eurMonthly: round2(baseKwh * avgAllIn),
      note: "Pidev võimsus (W × aeg). Ülejäänud kuu maht jaotub tunniplaani ja seadmete eelduste järgi.",
    });
  }

  for (const k of Object.keys(deviceKwh) as MajorDeviceKey[]) {
    const kwh = deviceKwh[k];
    if (kwh !== undefined && kwh > 0.05) {
      drivers.push({
        key: k,
        label: DEVICE_LABEL_SHORT[k],
        kwhMonthly: round1(kwh),
        eurMonthly: round2(kwh * avgAllIn),
        note: devicesScaled
          ? "Osa kuu ülejäägist (mallid ületasid vaba mahtu — skaleeritud)."
          : "Osa kuu ülejäägist vastavalt tüüpilisele mallile.",
      });
    }
  }

  if (otherKwh > 0.05) {
    drivers.push({
      key: "rest",
      label: "Muu / jaotamata",
      kwhMonthly: round1(otherKwh),
      eurMonthly: round2(otherKwh * avgAllIn),
      note: "Kõik, mis ei mahtunud baasi ega valitud seadmete mallidesse.",
    });
  }

  drivers.sort((a, b) => b.kwhMonthly - a.kwhMonthly);

  const sumKwh = drivers.reduce((s, d) => s + d.kwhMonthly, 0);
  const sumEur = drivers.reduce((s, d) => s + d.eurMonthly, 0);
  const kwhOk = monthlyKwh <= 0 || Math.abs(sumKwh - monthlyKwh) < 0.15;
  const eurOk = monthlyKwh <= 0 || Math.abs(sumEur - estMonthlyCostEur) < 0.05;

  let driversExplainerEt =
    "Draiverid jaotavad sinu sisestatud kuu kWh baasi, valitud seadmete tüüpiliste osakaalude ja ülejäägi vahel. Need on sama kogutarbimise eri read — eurod on kWh × keskmine hind (ei ole eraldi lisakulusid).";
  if (devicesScaled) {
    driversExplainerEt +=
      " Kuna seadmete mallid kokku ületasid vaba kuumahtu, on seadmete read proportsionaalselt vähendatud, et kWh summa ei ületaks kuu tarbimist.";
  }
  if (!kwhOk || !eurOk) {
    driversExplainerEt += " (Ümardus: väike lahknevus on lubatud.)";
  }

  const anomalies: AnomalyFlag[] = [];
  if (baseLoadShare >= 0.42) {
    anomalies.push({
      severity: "high",
      title: "Kahtlaselt kõrge baas-koormus",
      description:
        "Suur osa tarbimisest on pidev 24/7 tarbimine. See viitab valmidusrežiimidele, varjatud tarbijatele või seadmete pidevale tööle.",
    });
  } else if (baseLoadShare >= 0.32) {
    anomalies.push({
      severity: "warn",
      title: "Kõrgemapoolne baas-koormus",
      description:
        "Baas-koormus on märgatav. Tihti leidub siit kiireid võite (taimerid, seadmete seadistused, lekkeotsing).",
    });
  } else {
    anomalies.push({
      severity: "info",
      title: "Baas-koormus on mõistlik",
      description:
        "Pidev tarbimine ei paista olevat peamine probleem. Säästu leiab pigem ajastamisest ja suurematest tarbijatest.",
    });
  }

  if (peakDependencyScore >= 70) {
    anomalies.push({
      severity: "warn",
      title: "Sõltuvus tipp-tundidest on kõrge",
      description:
        "Tarbimine koondub mudelis kallimatesse tundidesse. Ajastamine võib anda märgatavat säästu, eriti börsilepingu puhul.",
    });
  }

  /** Üksiku meetme ülempiir (ei ületa ~15% arvest) — vähendab ülepõimumise illusiooni */
  const oppCap = estMonthlyCostEur * 0.15;

  const opportunities: SavingsOpportunity[] = [];
  if (baseLoadShare >= 0.32) {
    const raw = estMonthlyCostEur * Math.min(0.1, baseLoadShare * 0.14);
    opportunities.push({
      id: "o_base",
      title: "Vähenda baas-koormust (24/7 tarbimine)",
      estMonthlyEur: round2(clamp(Math.max(4, raw), 0, oppCap)),
      confidence: "keskmine",
      rationale: "Taimerid, valmidusrežiimid ja lekked — tüüpiline “üks suund”, mitte garantii kogu summast.",
    });
  }
  if (peakDependencyScore >= 70) {
    opportunities.push({
      id: "o_peak",
      title: "Nihuta tarbimist odavamatesse tundidesse",
      estMonthlyEur: round2(clamp(Math.max(3, estMonthlyCostEur * 0.06), 0, oppCap)),
      confidence: "kõrge",
      rationale: "Kehtib eriti börsi või dünaamilise hinnaga; ei välista kattuvust teiste ajastusnõuannetega.",
    });
  }
  if (raw.devices.boiler) {
    opportunities.push({
      id: "o_boiler",
      title: "Boileri ajastus + temperatuuristrateegia",
      estMonthlyEur: round2(clamp(Math.max(2.5, estMonthlyCostEur * 0.035), 0, oppCap * 0.9)),
      confidence: "keskmine",
      rationale: "Kattub osaliselt üldise tipu-nihkega — ära liida eurod paksuks.",
    });
  }
  if (raw.devices.ev) {
    opportunities.push({
      id: "o_ev",
      title: "EV laadimine odavates tundides",
      estMonthlyEur: round2(clamp(Math.max(2, estMonthlyCostEur * 0.028), 0, oppCap * 0.9)),
      confidence: "kõrge",
      rationale: "Sama ajastusloogika mis tipu-nihkel; tegelik kokkuhoid sõltub lepingust.",
    });
  }

  const topOpp = opportunities.sort((a, b) => b.estMonthlyEur - a.estMonthlyEur).slice(0, 4);

  const opportunitiesDisclaimerEt =
    "Iga säästurida on eraldi “kui keskendud peamiselt sellele” hinnang. Neid ei summeerita — tegevused kattuvad (nt tipu-nihk + EV + boiler).";

  const bullets: string[] = [];
  bullets.push(
    `Hinnanguline kuukulu: ${round2(estMonthlyCostEur)} € (${monthlyKwh} kWh × ${avgAllIn.toFixed(3)} €/kWh).`
  );
  bullets.push(`Baas-koormus: ~${Math.round(baseKwh)} kWh/kuu (${Math.round(baseLoadShare * 100)}% kuust).`);
  bullets.push(`Tipu-sõltuvus: ${peakDependencyScore}/100 — mida kõrgem, seda rohkem võid võita ajastusest (sõltub hinnast).`);
  if (topOpp.length) {
    bullets.push(`Prioriteedid ülevaates: ${topOpp.map((o) => o.title.toLowerCase()).slice(0, 2).join(" · ")}.`);
  }

  const recommendations: PlainRecommendation = {
    title: "Mida teha järgmisena",
    bullets,
  };

  return {
    pattern,
    drivers,
    driversExplainerEt,
    anomalies,
    opportunities: topOpp,
    opportunitiesDisclaimerEt,
    recommendations,
    kpis: {
      baseLoadShare,
      estMonthlyBaseKwh: round2(baseKwh),
      estMonthlyCostEur,
      peakDependencyScore,
    },
  };
}
