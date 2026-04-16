import type { ContractAnalysis, ContractType } from "@/lib/contracts/model";
import { bandFromScore, type ScoredSignal } from "@/lib/domain/scoring/types";
import { clamp, round2 } from "@/lib/domain/utils/math";

export type ContractIntelligence = {
  analysis: ContractAnalysis;
  /** How exposed the user is to price swings under current contract (0..100) */
  volatilityExposure: ScoredSignal;
  /** How well current contract type fits usage + flexibility (0..100, higher = better fit) */
  contractFitScore: ScoredSignal;
  /** Estimated monthly savings if switching to model’s best alternative vs current bill */
  savingsOpportunityEurPerMonth: number;
  /** True when alternatives are within a few euros — don’t oversell */
  isMarginalDifference: boolean;
  /** Plain-language executive summary */
  summaryEt: string;
  /** For bar charts: scenarios vs current */
  chartRows: { key: string; label: string; monthlyEur: number; risk0to100: number }[];
};

function volatilityExposureFromCurrent(
  type: ContractType,
  riskScore: number,
  marketVol01: number
): ScoredSignal {
  const typeBoost = type === "spot" ? 18 : type === "hybrid" ? 8 : 0;
  const score = clamp(Math.round(riskScore * 0.55 + marketVol01 * 100 * 0.35 + typeBoost), 0, 100);
  let rationaleEt =
    type === "spot"
      ? "Börsilepinguga kannad hinnakõikumise riski — eriti kui tarbimine langeb kallimatesse tundidesse."
      : type === "hybrid"
        ? "Hübriidis on osa riskist maandatud, kuid börsi osa võib siiski kõikuda."
        : "Fikseeritud lepinguga on hinnariski tase tavaliselt madalam, kuid vähem ruumi optimeerimiseks.";
  if (score >= 68) {
    rationaleEt += " Sinu profiilil on volatiilsuse mõju suhteliselt suur.";
  }
  return { score0to100: score, band: bandFromScore(score), rationaleEt };
}

function contractFitScore(
  currentType: ContractType,
  bestFit: ContractType,
  peakDependency0to100: number,
  flexibility0to100: number
): ScoredSignal {
  const mismatch = currentType !== bestFit ? -22 : 12;
  const peak = clamp(peakDependency0to100, 0, 100);
  const flex = clamp(flexibility0to100, 0, 100);

  // Spot suits flexible, off-peak-heavy users; fixed suits inflexible + peak-heavy.
  let fit = 58;
  if (currentType === "spot") {
    fit += (flex - 50) * 0.35 - (peak - 50) * 0.28;
  } else if (currentType === "fixed") {
    fit += (peak - 50) * 0.22 - (flex - 50) * 0.12;
  } else {
    fit += 4 - Math.abs(peak -55) * 0.15;
  }
  fit += mismatch;

  const score = clamp(Math.round(fit), 0, 100);
  let rationaleEt = "";
  if (currentType === "spot" && peak > 65 && flex < 45) {
    rationaleEt =
      "Suur osa tarbimisest langeb kallimatesse tundidesse ja sul on vähe paindlikkust — puhas börsihind võib olla ebamugav.";
  } else if (currentType === "fixed" && flex > 58 && peak < 48) {
    rationaleEt =
      "Sul on päris palju paindlikkust ja vähem tipu-survet — börs või hübriid võib anda optimeerimisruumi bez liigse riskita (sõltub pakkumistest).";
  } else if (currentType !== bestFit) {
    rationaleEt = `Mudeli järgi sobib sinu mustrile veidi paremini ${bestFit === "spot" ? "börs" : bestFit === "fixed" ? "fikseeritud" : "hübriid"} leping — vaata numbreid ja riski enne otsust.`;
  } else {
    rationaleEt = "Praegune lepingutüüp on mudeli järgi suhteliselt kooskõlas sinu mustriga — vahe teiste variantidega võib olla väike.";
  }

  return { score0to100: score, band: bandFromScore(score), rationaleEt };
}

export function buildContractIntelligence(
  analysis: ContractAnalysis,
  context: {
    peakDependency0to100: number;
    flexibility0to100: number;
    marketVolatility01: number;
    userType: "household" | "business";
  }
): ContractIntelligence {
  const current = analysis.current;
  const rec = analysis.recommendation;

  /** Sama number mis kokkuvõtte „soovitus vs praegune“ (ei ületa nulli — “võit” mõttes). */
  const savingsVsRecommendation = round2(Math.max(0, rec.deltaVsCurrentEur));
  const marginal =
    rec.maxSavingsVsCurrentEur < 4 && Math.abs(rec.deltaVsCurrentEur) < 4;

  const volatilityExposure = volatilityExposureFromCurrent(
    current.type,
    current.riskScore,
    context.marketVolatility01
  );
  const fit = contractFitScore(
    current.type,
    rec.bestFit,
    context.peakDependency0to100,
    context.flexibility0to100
  );

  let summaryEt = "";
  if (marginal) {
    summaryEt =
      "Lepingu tüüpide vahel ei ole selle mudeli järgi suurt kuu kulu vahet — otsustajaks jäävad risk, mugavus ja pakkumise detailid, mitte üks number.";
  } else if (rec.deltaVsCurrentEur > 0.5) {
    const labelEt =
      rec.bestFit === "spot" ? "börsi" : rec.bestFit === "fixed" ? "fikseeritud" : "hübriid";
    summaryEt = `Soovitus (${labelEt}) annab mudeli järgi umbes ${rec.deltaVsCurrentEur.toFixed(2)} € / kuu madalama hinnanguliku kulu kui sinu praegune sisestus.`;
    if (rec.riskWeightedChoice && rec.cheapestScenario.type !== rec.bestFit && rec.maxSavingsVsCurrentEur > rec.deltaVsCurrentEur + 0.5) {
      summaryEt += ` Odavaim alternatiiv mudelis on „${rec.cheapestScenario.label}“ (kuni ~${rec.maxSavingsVsCurrentEur.toFixed(2)} € / kuu), kuid suure tipp-osakaalu korral eelistab mudel madalamat riski.`;
    }
  } else if (rec.deltaVsCurrentEur < -0.5) {
    summaryEt = `Soovituslik lepingutüüp on mudeli järgi umbes ${Math.abs(rec.deltaVsCurrentEur).toFixed(2)} € / kuu kallim kui praegune sisestus — see võib olla mõistlik, kui eesmärk on vähendada hinnakõikumise riski.`;
  } else if (current.type !== rec.bestFit) {
    summaryEt = `Praegune ja soovitus erinevad, kuid kuukulu jääb mudeli järgi lähedale — vaata riski ja pakkumise detaile.`;
  } else {
    summaryEt =
      "Praegune tüüp on mudeli järgi päris hea sobivus; vaata ikkagi, kas hinnariski tase sobib sinu eelarvega.";
  }

  summaryEt += " Numbrivahed on hinnangulised (lihtsustatud energiahinna kordajad).";

  if (context.userType === "business") {
    summaryEt += " Äri puhul tasub lisaks võrrelda võrgutasusid ja võimsustippe.";
  }

  const chartRows = analysis.scenarios.map((s) => ({
    key: s.label,
    label: s.label,
    monthlyEur: s.estMonthlyCostEur,
    risk0to100: s.riskScore,
  }));

  return {
    analysis,
    volatilityExposure,
    contractFitScore: fit,
    savingsOpportunityEurPerMonth: savingsVsRecommendation,
    isMarginalDifference: marginal,
    summaryEt,
    chartRows,
  };
}
