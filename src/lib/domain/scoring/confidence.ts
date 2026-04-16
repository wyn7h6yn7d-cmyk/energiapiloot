import { round2 } from "@/lib/domain/utils/math";

export type ConfidenceLabel = "kõrge" | "keskmine" | "madal";

/** How strong is the underlying observation layer */
export type DataStrength = "metered" | "modeled_profile" | "assumptions_only";

export type DataQualityAssessment = {
  strength: DataStrength;
  /** 0..100 — higher means we can speak more firmly */
  completeness0to100: number;
  summaryEt: string;
  /** Multiplier 0.55..1 applied to recommendation priority when data is weak */
  priorityDampening: number;
};

export function assessDataQuality(input: {
  hasMeteredConsumption: boolean;
  meteringPending: boolean;
  monthlyKwhModeled: boolean;
}): DataQualityAssessment {
  if (input.hasMeteredConsumption) {
    return {
      strength: "metered",
      completeness0to100: 88,
      summaryEt:
        "Sul on mõõtepõhine tarbimise joon — soovitused saavad tugineda pärisandmetele (kvaliteet sõltub veel resolutsioonist ja katvusest).",
      priorityDampening: 1,
    };
  }
  if (input.meteringPending) {
    return {
      strength: "modeled_profile",
      completeness0to100: 52,
      summaryEt:
        "Oled märkinud, et soovid Datahub ühendust — seni kasutame profiili eeldusi; täpsed mustrid tulevad pärast ühendust.",
      priorityDampening: 0.88,
    };
  }
  return {
    strength: "assumptions_only",
    completeness0to100: 38,
    summaryEt:
      "Tarbimine põhineb mudelil ja seadistuse eeldustel, mitte arvesti intervallandmetel. Enne suuri investeeringuid tasub täpsustada profiili või ühendada mõõteandmed.",
    priorityDampening: 0.72,
  };
}

export function dampenConfidence(
  base: ConfidenceLabel,
  data: DataQualityAssessment
): ConfidenceLabel {
  if (data.strength === "metered") return base;
  if (base === "madal") return "madal";
  if (data.strength === "assumptions_only") return base === "kõrge" ? "keskmine" : "madal";
  return base === "kõrge" ? "keskmine" : base;
}

export function confidenceNumeric(label: ConfidenceLabel): number {
  if (label === "kõrge") return 0.85;
  if (label === "keskmine") return 0.55;
  return 0.3;
}

/** Blend impact estimate down when we only have assumptions */
export function dampenImpactEur(eur: number, data: DataQualityAssessment): number {
  const f = data.strength === "metered" ? 1 : data.strength === "modeled_profile" ? 0.9 : 0.75;
  return round2(eur * f);
}

export function explainConfidencePrefix(data: DataQualityAssessment): string {
  if (data.strength === "metered") return "";
  if (data.strength === "modeled_profile")
    return "Eelduste põhjal (ühendus tulekul): ";
  return "Madalama kindlusega (puuduvad mõõdud): ";
}
