import type { ConsumptionInsights, ConsumptionProfileInputs } from "@/lib/consumption/insights";
import { buildConsumptionInsights } from "@/lib/consumption/insights";
import { bandFromScore, type ScoredSignal } from "@/lib/domain/scoring/types";
import type { DataQualityAssessment } from "@/lib/domain/scoring/confidence";
import { clamp, round2 } from "@/lib/domain/utils/math";

export type BaselineLoadClass = "low" | "typical" | "elevated" | "high_alert";

export type ConsumptionIntelligence = {
  profile: ConsumptionInsights;
  baselineClass: BaselineLoadClass;
  flexibilityScore: ScoredSignal;
  /** Cost drivers sorted with share of bill */
  driverHighlights: { key: string; label: string; shareOfBill: number; noteEt: string }[];
  /** Honest framing when data is not metered */
  framingNoteEt: string;
};

function baselineClassFromShare(share: number): BaselineLoadClass {
  if (share >= 0.45) return "high_alert";
  if (share >= 0.34) return "elevated";
  if (share >= 0.22) return "typical";
  return "low";
}

function flexibilityFromProfile(
  raw: ConsumptionProfileInputs,
  peakDependencyScore: number
): ScoredSignal {
  let score = 48;
  if (raw.devices.ev) score += 14;
  if (raw.devices.boiler) score += 8;
  if (raw.devices.cooling) score += 5;
  if (raw.devices.machinery) score -= 12;
  if (raw.devices.commercial_refrigeration) score -= 8;
  score -= (peakDependencyScore - 50) * 0.35;
  score += (0.55 - raw.dayShare) * 18;
  const s = clamp(Math.round(score), 0, 100);

  let rationaleEt = "";
  if (s >= 65) {
    rationaleEt =
      "Sul on märkimisväärne võimalus nihutada tarbimist (EV, boiler, jahutus) — see vähendab börsi riski ilma suure riistvara lisamiseta.";
  } else if (s <= 38) {
    rationaleEt =
      "Paindlikkus on piiratud (masinad, külm ahel või kõrge tipu-sõltuvus) — lepingu riski maandamine võib olla mõistlikum kui “jäta kõik börsile”.";
  } else {
    rationaleEt =
      "Paindlikkus on keskmine: mõistlik kombinatsioon on väike ajastus + lepingu riski kontroll.";
  }
  return { score0to100: s, band: bandFromScore(s), rationaleEt };
}

export function buildConsumptionIntelligence(
  raw: ConsumptionProfileInputs,
  data: DataQualityAssessment,
  objectType: string
): ConsumptionIntelligence {
  const profile = buildConsumptionInsights(raw);
  const baselineClass = baselineClassFromShare(profile.kpis.baseLoadShare);
  const flex = flexibilityFromProfile(raw, profile.kpis.peakDependencyScore);

  const totalCost = Math.max(0.01, profile.kpis.estMonthlyCostEur);
  const driverHighlights = profile.drivers.slice(0, 5).map((d) => ({
    key: d.key,
    label: d.label,
    shareOfBill: round2(d.eurMonthly / totalCost),
    noteEt: d.note,
  }));

  let framingNoteEt = profile.recommendations.bullets.join(" ");
  if (data.strength !== "metered") {
    framingNoteEt =
      `${data.summaryEt} ${framingNoteEt}`.trim();
  }
  if (objectType === "apartment") {
    framingNoteEt += " Korteri puhul on baas-koormus sageli madalam, kuid ühised süsteemid võivad peita “pidevat” tarbimist.";
  }

  return {
    profile,
    baselineClass,
    flexibilityScore: flex,
    driverHighlights,
    framingNoteEt,
  };
}
