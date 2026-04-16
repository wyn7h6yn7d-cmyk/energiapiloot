export type ContractType = "fixed" | "spot" | "hybrid";

export type ConsumptionPattern = {
  /**
   * Share of monthly consumption that happens in higher-priced peak hours.
   * 0.35 means 35% of kWh are in peak.
   */
  peakShare: number;
  /**
   * Price multiplier for peak hours vs off-peak average.
   * 1.25 means peak hours are ~25% more expensive than base average.
   */
  peakPriceMultiplier: number;
};

export type ContractInputs = {
  providerName: string;
  type: ContractType;
  baseFeeEurPerMonth: number;
  // Energy component (before VAT) — for spot this is mean estimate.
  energyPriceEurPerKwh: number;
  // Network + other regulated component (before VAT), kept separate for clarity.
  networkFeeEurPerKwh: number;
  vatRate: number; // e.g. 0.22
};

export type AnalysisInputs = {
  monthlyKwh: number;
  pattern: ConsumptionPattern;
  current: ContractInputs;
  assumptions: {
    spotVolatility: number; // 0..1 (higher => more spread)
    hybridSpotShare: number; // 0..1 (share priced like spot)
  };
};

export type ScenarioResult = {
  label: string;
  type: ContractType;
  estMonthlyCostEur: number;
  bestCaseEur: number;
  worstCaseEur: number;
  riskScore: number; // 0..100
};

export type ContractRecommendation = {
  bestFit: ContractType;
  title: string;
  summary: string;
  why: string[];
  /** Alternative row chosen by the model (risk vs € tradeoff). */
  recommendedScenario: ScenarioResult;
  /** Lowest est. monthly cost among alternatives (pure €). */
  cheapestScenario: ScenarioResult;
  /** current.estMonthlyCostEur − recommendedScenario.estMonthlyCostEur (+ = soovitus odavam). */
  deltaVsCurrentEur: number;
  /** current.estMonthlyCostEur − cheapestScenario.estMonthlyCostEur, floored at 0 (max € upside). */
  maxSavingsVsCurrentEur: number;
  /** When true, bestFit follows “lower risk” path (high peak share), not only lowest €. */
  riskWeightedChoice: boolean;
};

export type ContractAnalysis = {
  scenarios: ScenarioResult[];
  current: ScenarioResult;
  recommendation: ContractRecommendation;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function allInUnitPriceEurPerKwh(inputs: ContractInputs) {
  return (inputs.energyPriceEurPerKwh + inputs.networkFeeEurPerKwh) * (1 + inputs.vatRate);
}

function energyUnitAllIn(inputs: ContractInputs) {
  return inputs.energyPriceEurPerKwh * (1 + inputs.vatRate);
}

function networkUnitAllIn(inputs: ContractInputs) {
  return inputs.networkFeeEurPerKwh * (1 + inputs.vatRate);
}

function costWithPattern({
  monthlyKwh,
  baseAllInUnitEurPerKwh,
  baseFeeEurPerMonth,
  pattern,
}: {
  monthlyKwh: number;
  baseAllInUnitEurPerKwh: number;
  baseFeeEurPerMonth: number;
  pattern: ConsumptionPattern;
}) {
  const peakShare = clamp(pattern.peakShare, 0, 1);
  const peakMult = Math.max(1, pattern.peakPriceMultiplier);
  const offPeakShare = 1 - peakShare;

  // Weighted unit price given peak vs off-peak split.
  // Off-peak is normalized to 1.0, peak is peakMult. Normalize so average remains base.
  const weight = offPeakShare * 1 + peakShare * peakMult;
  const offPeakUnit = baseAllInUnitEurPerKwh / weight;
  const peakUnit = offPeakUnit * peakMult;

  const kwhPeak = monthlyKwh * peakShare;
  const kwhOff = monthlyKwh - kwhPeak;
  return baseFeeEurPerMonth + kwhOff * offPeakUnit + kwhPeak * peakUnit;
}

function riskScore({
  type,
  peakShare,
  spotVolatility,
  hybridSpotShare,
}: {
  type: ContractType;
  peakShare: number;
  spotVolatility: number;
  hybridSpotShare: number;
}) {
  const peak = clamp(peakShare, 0, 1);
  const vol = clamp(spotVolatility, 0, 1);
  const hybrid = clamp(hybridSpotShare, 0, 1);

  // MVP model:
  // - fixed: low risk baseline
  // - spot: depends on volatility + how much of consumption is in peak
  // - hybrid: blended
  const base =
    type === "fixed" ? 14 : type === "hybrid" ? 24 : 34;
  const peakFactor = 28 * peak;
  const volFactor = 40 * vol;
  const hybridBlend = type === "hybrid" ? 0.35 + 0.65 * hybrid : type === "spot" ? 1 : 0;

  const raw = base + (peakFactor + volFactor) * hybridBlend;
  return Math.round(clamp(raw, 0, 100));
}

function scenarioFromContract({
  label,
  type,
  monthlyKwh,
  pattern,
  contract,
  spotVolatility,
  hybridSpotShare,
}: {
  label: string;
  type: ContractType;
  monthlyKwh: number;
  pattern: ConsumptionPattern;
  contract: ContractInputs;
  spotVolatility: number;
  hybridSpotShare: number;
}): ScenarioResult {
  const baseAllInUnit = allInUnitPriceEurPerKwh(contract);
  const baseCost = costWithPattern({
    monthlyKwh,
    baseAllInUnitEurPerKwh: baseAllInUnit,
    baseFeeEurPerMonth: contract.baseFeeEurPerMonth,
    pattern,
  });

  // best/worst are controlled by volatility; fixed is tighter.
  const vol = clamp(spotVolatility, 0, 1);
  const typeVol = type === "fixed" ? 0.12 : type === "hybrid" ? 0.35 : 0.6;
  const spread = (0.06 + 0.22 * vol) * typeVol;

  const best = baseCost * (1 - spread);
  const worst = baseCost * (1 + spread * 1.25);

  return {
    label,
    type,
    estMonthlyCostEur: round2(baseCost),
    bestCaseEur: round2(best),
    worstCaseEur: round2(worst),
    riskScore: riskScore({
      type,
      peakShare: pattern.peakShare,
      spotVolatility,
      hybridSpotShare,
    }),
  };
}

function recommend(alternatives: ScenarioResult[], current: ScenarioResult, inputs: AnalysisInputs): ContractRecommendation {
  const byCost = [...alternatives].sort((a, b) => a.estMonthlyCostEur - b.estMonthlyCostEur);
  const byRisk = [...alternatives].sort((a, b) => a.riskScore - b.riskScore);
  const cheap = byCost[0]!;
  const safe = byRisk[0]!;

  const riskSensitive = inputs.pattern.peakShare >= 0.42;
  const riskWeightedChoice = riskSensitive;
  const bestFit = riskSensitive ? safe.type : cheap.type;
  const recommendedScenario = alternatives.find((s) => s.type === bestFit) ?? cheap;
  const cheapestScenario = cheap;

  const deltaVsCurrentEur = round2(current.estMonthlyCostEur - recommendedScenario.estMonthlyCostEur);
  const maxSavingsVsCurrentEur = round2(Math.max(0, current.estMonthlyCostEur - cheapestScenario.estMonthlyCostEur));

  const deltaText =
    Math.abs(deltaVsCurrentEur) < 0.5
      ? "sarnase hinnatasemega"
      : deltaVsCurrentEur > 0
        ? `umbes ${round2(Math.abs(deltaVsCurrentEur))} € / kuu odavam`
        : `umbes ${round2(Math.abs(deltaVsCurrentEur))} € / kuu kallim`;

  const why: string[] = [];
  if (bestFit === "fixed") {
    why.push("Väiksem hinnariski tase ja stabiilsem eelarve.");
  }
  if (bestFit === "spot") {
    why.push("Võimalus saada kasu odavatest tundidest, kui ajastad tarbimist.");
  }
  if (bestFit === "hybrid") {
    why.push("Tasakaal: osa hinnast fikseeritud, osa järgib turgu.");
  }
  why.push(`Sinu mustri järgi tipp-tundide osakaal: ${Math.round(inputs.pattern.peakShare * 100)}%.`);

  if (riskWeightedChoice && cheapestScenario.type !== bestFit) {
    why.push(
      `Odavaim hinnangulik kuukulu on mudelis „${cheapestScenario.label}“ (umbes ${maxSavingsVsCurrentEur.toFixed(2)} € / kuu vähem kui praegu, kui see peaks paika pidama). Kuna tipp-osakaal on suur, kaalub mudel siiski madalamat riski.`
    );
  }

  const approx = "Kõik on lihtsustatud võrdlus: energiahinnad alternatiividel on mudeli koeffitsiendid, mitte pakkumised.";

  return {
    bestFit,
    title:
      bestFit === "fixed"
        ? "Parim sobivus: fikseeritud (stabiilsus)"
        : bestFit === "spot"
          ? "Parim sobivus: börs (optimeerimise potentsiaal)"
          : "Parim sobivus: hübriid (tasakaal)",
    summary: `Soovituslik variant („${recommendedScenario.label}“) on ${deltaText} kui sinu praegune sisestus. ${approx}`,
    why,
    recommendedScenario,
    cheapestScenario,
    deltaVsCurrentEur,
    maxSavingsVsCurrentEur,
    riskWeightedChoice,
  };
}

export function analyzeContracts(inputs: AnalysisInputs): ContractAnalysis {
  const current = scenarioFromContract({
    label: "Praegune",
    type: inputs.current.type,
    monthlyKwh: inputs.monthlyKwh,
    pattern: inputs.pattern,
    contract: inputs.current,
    spotVolatility: inputs.assumptions.spotVolatility,
    hybridSpotShare: inputs.assumptions.hybridSpotShare,
  });

  // Alternative scenarios: adjust only energy component while keeping regulated/network part.
  const altFixed: ContractInputs = {
    ...inputs.current,
    type: "fixed",
    providerName: "Alternatiiv • fikseeritud",
    // Fixed often slightly higher mean but lower spread.
    energyPriceEurPerKwh: round2(energyUnitAllIn(inputs.current) / (1 + inputs.current.vatRate) * 1.06),
  };
  const altSpot: ContractInputs = {
    ...inputs.current,
    type: "spot",
    providerName: "Alternatiiv • börs",
    // Spot mean can be slightly lower but more spread.
    energyPriceEurPerKwh: round2(energyUnitAllIn(inputs.current) / (1 + inputs.current.vatRate) * 0.96),
  };
  const altHybrid: ContractInputs = {
    ...inputs.current,
    type: "hybrid",
    providerName: "Alternatiiv • hübriid",
    energyPriceEurPerKwh: round2(energyUnitAllIn(inputs.current) / (1 + inputs.current.vatRate) * 1.01),
  };

  const scenarios: ScenarioResult[] = [
    current,
    scenarioFromContract({
      label: "Fikseeritud",
      type: "fixed",
      monthlyKwh: inputs.monthlyKwh,
      pattern: inputs.pattern,
      contract: { ...altFixed, networkFeeEurPerKwh: inputs.current.networkFeeEurPerKwh },
      spotVolatility: inputs.assumptions.spotVolatility,
      hybridSpotShare: inputs.assumptions.hybridSpotShare,
    }),
    scenarioFromContract({
      label: "Börsihind",
      type: "spot",
      monthlyKwh: inputs.monthlyKwh,
      pattern: inputs.pattern,
      contract: { ...altSpot, networkFeeEurPerKwh: inputs.current.networkFeeEurPerKwh },
      spotVolatility: inputs.assumptions.spotVolatility,
      hybridSpotShare: inputs.assumptions.hybridSpotShare,
    }),
    scenarioFromContract({
      label: "Hübriid",
      type: "hybrid",
      monthlyKwh: inputs.monthlyKwh,
      pattern: inputs.pattern,
      contract: { ...altHybrid, networkFeeEurPerKwh: inputs.current.networkFeeEurPerKwh },
      spotVolatility: inputs.assumptions.spotVolatility,
      hybridSpotShare: inputs.assumptions.hybridSpotShare,
    }),
  ];

  const alts = scenarios.filter((s) => s.label !== "Praegune");
  const rec = recommend(alts, current, inputs);
  return {
    scenarios,
    current,
    recommendation: rec,
  };
}

