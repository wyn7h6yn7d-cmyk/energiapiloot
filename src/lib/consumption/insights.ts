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
  anomalies: AnomalyFlag[];
  opportunities: SavingsOpportunity[];
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

export function buildConsumptionInsights(raw: ConsumptionProfileInputs): ConsumptionInsights {
  const monthlyKwh = Math.max(0, raw.monthlyKwh);
  const avgAllIn = Math.max(0.01, raw.avgAllInEurPerKwh);

  const dayShare = clamp(raw.dayShare, 0.2, 0.9);
  const weekendShare = clamp(raw.weekendShare, 0.15, 0.6);
  const baseLoadW = Math.max(0, raw.baseLoadW);

  const baseKwh = (baseLoadW / 1000) * 24 * 30;
  const deviceKwh = (Object.keys(raw.devices) as MajorDeviceKey[])
    .filter((k) => raw.devices[k])
    .reduce((acc, k) => acc + DEVICE_KWH_MONTH[k], 0);

  const remainderKwh = Math.max(0, monthlyKwh - baseKwh - deviceKwh);

  // Build a simple 24h pattern.
  // We split into day/night buckets and add two gentle peaks (morning/evening).
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayHours = new Set<number>([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  const basePerHour = baseKwh / 30 / 24;

  const peakShape = (h: number) => {
    const morning = Math.exp(-Math.pow((h - 8) / 2.4, 2));
    const evening = Math.exp(-Math.pow((h - 19) / 2.8, 2));
    return 0.45 * morning + 0.55 * evening;
  };

  const weights = hours.map((h) => {
    const inDay = dayHours.has(h);
    const bucketBias = inDay ? dayShare : 1 - dayShare;
    const shape = 0.6 + peakShape(h);
    // Devices: EV tends to night, boiler mixed, cooling day, refrigeration/base constant, machinery weekday day.
    const evBias = raw.devices.ev ? (inDay ? 0.85 : 1.25) : 1;
    const coolingBias = raw.devices.cooling ? (inDay ? 1.18 : 0.92) : 1;
    const heatPumpBias = raw.devices.heat_pump ? (inDay ? 1.04 : 0.98) : 1;
    const boilerBias = raw.devices.boiler ? (inDay ? 1.05 : 0.98) : 1;
    const fridgeBias = raw.devices.commercial_refrigeration ? 1.02 : 1;
    const machineBias = raw.devices.machinery ? (inDay ? 1.12 : 0.88) : 1;

    return bucketBias * shape * evBias * coolingBias * heatPumpBias * boilerBias * fridgeBias * machineBias;
  });

  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  const remainderPerDay = remainderKwh / 30;

  const pattern: ConsumptionPatternPoint[] = hours.map((h, idx) => {
    const remainderHour = (weights[idx] / wSum) * remainderPerDay;
    return { hour: `${String(h).padStart(2, "0")}:00`, kwh: round2(basePerHour + remainderHour) };
  });

  // Peak dependency score (0..100): driven by dayShare + explicit slider + devices that bias into peak.
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
  const estMonthlyCostEur = monthlyKwh * avgAllIn;

  const drivers: CostDriver[] = [
    {
      key: "base",
      label: "Baas-koormus",
      kwhMonthly: round1(baseKwh),
      eurMonthly: round2(baseKwh * avgAllIn),
      note: "Pidev tarbimine 24/7 (külmikud, serverid, valmidusrežiimid).",
    },
    ...(Object.keys(raw.devices) as MajorDeviceKey[])
      .filter((k) => raw.devices[k])
      .map((k) => ({
        key: k,
        label:
          k === "ev"
            ? "Elektriauto"
            : k === "boiler"
              ? "Boiler"
              : k === "heat_pump"
                ? "Soojuspump"
                : k === "cooling"
                  ? "Jahutus"
                  : k === "commercial_refrigeration"
                    ? "Külmutus (äri)"
                    : "Masinad",
        kwhMonthly: DEVICE_KWH_MONTH[k],
        eurMonthly: round2(DEVICE_KWH_MONTH[k] * avgAllIn),
        note: "Hinnanguline panus (MVP).",
      })),
    {
      key: "rest",
      label: "Muu tarbimine",
      kwhMonthly: round1(remainderKwh),
      eurMonthly: round2(remainderKwh * avgAllIn),
      note: "Valgustus, köök, elektroonika, väiksemad tarbijad.",
    },
  ]
    .filter((d) => d.kwhMonthly > 0.1)
    .sort((a, b) => b.kwhMonthly - a.kwhMonthly);

  const anomalies: AnomalyFlag[] = [];
  if (baseLoadShare >= 0.42) {
    anomalies.push({
      severity: "high",
      title: "Kahtlaselt kõrge baas-koormus",
      description:
        "Su suur osa tarbimisest on pidev 24/7 tarbimine. See viitab valmidusrežiimidele, varjatud tarbijatele või seadmete pidevale tööle.",
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
        "Sinu tarbimine koondub kallimatesse tundidesse. Ajastamine võib anda märgatava säästu, eriti börsilepingu puhul.",
    });
  }

  const opportunities: SavingsOpportunity[] = [];
  if (baseLoadShare >= 0.32) {
    const est = Math.max(4, estMonthlyCostEur * Math.min(0.12, baseLoadShare * 0.18));
    opportunities.push({
      id: "o_base",
      title: "Vähenda baas-koormust (24/7 tarbimine)",
      estMonthlyEur: round2(est),
      confidence: "keskmine",
      rationale: "Taimerid, valmidusrežiimid, lekked ja pidevad tarbijad annavad tihti kiire võidu.",
    });
  }
  if (peakDependencyScore >= 70) {
    const est = Math.max(3, estMonthlyCostEur * 0.07);
    opportunities.push({
      id: "o_peak",
      title: "Nihuta tarbimist odavamatesse tundidesse",
      estMonthlyEur: round2(est),
      confidence: "kõrge",
      rationale: "Boiler/EV/jahutus ajastatuna vähendab tiputundide mõju.",
    });
  }
  if (raw.devices.boiler) {
    opportunities.push({
      id: "o_boiler",
      title: "Boileri ajastus + temperatuuristrateegia",
      estMonthlyEur: round2(Math.max(2.5, estMonthlyCostEur * 0.04)),
      confidence: "keskmine",
      rationale: "Tööta öösel/odavamal ajal, hoia soojusvaru ja väldi tippe.",
    });
  }
  if (raw.devices.ev) {
    opportunities.push({
      id: "o_ev",
      title: "EV laadimise reegel (odavad tunnid)",
      estMonthlyEur: round2(Math.max(2, estMonthlyCostEur * 0.03)),
      confidence: "kõrge",
      rationale: "Laadimine on ajastatav ja annab sageli kindla säästu.",
    });
  }

  const topOpp = opportunities
    .sort((a, b) => b.estMonthlyEur - a.estMonthlyEur)
    .slice(0, 4);

  const bullets: string[] = [];
  bullets.push(`Sinu hinnanguline kuukulu: ${round2(estMonthlyCostEur)} € (eeldus: ${avgAllIn.toFixed(3)} €/kWh).`);
  bullets.push(`Baas-koormus: ~${Math.round(baseKwh)} kWh/kuu (${Math.round(baseLoadShare * 100)}% tarbimisest).`);
  bullets.push(`Tipu-sõltuvus: ${peakDependencyScore}/100 (mida kõrgem, seda rohkem aitab ajastus).`);
  if (topOpp.length) bullets.push(`Parimad säästu kohad: ${topOpp.map((o) => o.title.toLowerCase()).slice(0, 2).join(" + ")}.`);

  const recommendations: PlainRecommendation = {
    title: "Mida teha järgmisena",
    bullets,
  };

  return {
    pattern,
    drivers,
    anomalies,
    opportunities: topOpp,
    recommendations,
    kpis: {
      baseLoadShare,
      estMonthlyBaseKwh: round2(baseKwh),
      estMonthlyCostEur: round2(estMonthlyCostEur),
      peakDependencyScore,
    },
  };
}

