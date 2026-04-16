/** Explainable low / medium / high bands for UI */
export type ScoreBand = "madal" | "keskmine" | "kõrge";

export function bandFromScore(score0to100: number): ScoreBand {
  if (score0to100 < 36) return "madal";
  if (score0to100 < 68) return "keskmine";
  return "kõrge";
}

export type ScoredSignal = {
  score0to100: number;
  band: ScoreBand;
  /** Short explanation for tooltips / reports */
  rationaleEt: string;
};
