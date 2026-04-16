import { bandFromScore, type ScoredSignal } from "@/lib/domain/scoring/types";
import { clamp, round2 } from "@/lib/domain/utils/math";
import type { SimulationType } from "@/lib/simulations/types";

export type InvestmentVerdict = "do_now" | "evaluate_further" | "wait";

export type InvestmentEvaluation = {
  type: SimulationType;
  name: string;
  monthlySavingsEur: number;
  annualSavingsEur: number;
  paybackYears: number | null;
  strategicFit: ScoredSignal;
  readiness: ScoredSignal;
  /** Higher = more sensitive to wrong assumptions */
  assumptionDependency: ScoredSignal;
  verdict: InvestmentVerdict;
  monthlySavingsLowHigh: { low: number; high: number };
  summaryEt: string;
  cautionEt?: string;
};

function fitSolar(input: {
  payback: number | null;
  selfConsumption: number;
  dayShare: number;
  hasSolarAsset: boolean;
}): number {
  let s = 52;
  if (input.payback !== null && input.payback < 9) s += 22;
  else if (input.payback !== null && input.payback < 12) s += 12;
  else if (input.payback !== null && input.payback > 16) s -= 18;
  s += (input.selfConsumption - 0.35) * 55;
  s += (input.dayShare - 0.5) * 28;
  if (input.hasSolarAsset) s -= 25;
  return clamp(Math.round(s), 0, 100);
}

function fitBattery(input: {
  payback: number | null;
  spotVol01: number;
  solarFit: number;
  peakDep: number;
}): number {
  let s = 45;
  s += input.spotVol01 * 28;
  s += clamp(input.solarFit - 50, -20, 25) * 0.4;
  s += (input.peakDep - 50) * 0.15;
  if (input.payback !== null && input.payback > 14) s -= 22;
  if (input.payback !== null && input.payback < 10) s += 14;
  return clamp(Math.round(s), 0, 100);
}

function fitEvCharger(input: { hasEv: boolean; payback: number | null }): number {
  if (!input.hasEv) return clamp(28 + (input.payback !== null && input.payback < 8 ? 10 : 0), 0, 100);
  let s = 58;
  if (input.payback !== null && input.payback < 7) s += 18;
  if (input.payback !== null && input.payback > 12) s -= 15;
  return clamp(s, 0, 100);
}

function fitHeatPump(input: {
  hasHeatPumpAsset: boolean;
  payback: number | null;
  heatingHeavy: boolean;
}): number {
  let s = 46;
  if (input.hasHeatPumpAsset) s -= 30;
  if (input.heatingHeavy) s += 18;
  if (input.payback !== null && input.payback < 9) s += 16;
  if (input.payback !== null && input.payback > 14) s -= 12;
  return clamp(Math.round(s), 0, 100);
}

function fitPeakShave(input: { isBusiness: boolean; machinery: boolean; peakDep: number }): number {
  let s = 40;
  if (input.isBusiness) s += 12;
  if (input.machinery) s += 16;
  s += (input.peakDep - 50) * 0.25;
  return clamp(Math.round(s), 0, 100);
}

function verdictFrom(
  fit: number,
  payback: number | null,
  annualSavings: number
): InvestmentVerdict {
  if (annualSavings < 45 || fit < 34) return "wait";
  if (payback !== null && payback > 13) return "evaluate_further";
  if (payback !== null && payback < 9 && fit >= 58) return "do_now";
  return "evaluate_further";
}

function assumptionDependency(type: SimulationType, payback: number | null): ScoredSignal {
  const base =
    type === "solar" ? 72 : type === "battery" ? 78 : type === "heat_pump" ? 74 : 62;
  const pb = payback ?? 12;
  const score = clamp(Math.round(base + (pb > 11 ? 8 : 0)), 0, 100);
  return {
    score0to100: score,
    band: bandFromScore(score),
    rationaleEt:
      score >= 68
        ? "Tulemus sõltub tugevalt 2–3 sisendist (hind, oma-tarbimine, COP, tsüklid) — väike muutus nihutab tasuvust märgatavalt."
        : "Sisendid on stabiilsemad, kuid tasub siiski kontrollida võtme-eeldusi.",
  };
}

function readinessScore(input: {
  data: "metered" | "modeled" | "weak";
  hasSiteCoords: boolean;
}): ScoredSignal {
  let s = 55;
  if (input.data === "metered") s += 22;
  if (input.data === "weak") s -= 18;
  if (input.hasSiteCoords) s += 6;
  const score = clamp(s, 0, 100);
  return {
    score0to100: score,
    band: bandFromScore(score),
    rationaleEt:
      score >= 68
        ? "Projekti ettevalmistus on mõistlik: andmed ja asukoht on piisavalt paigas, et minna pakkumiste faasi."
        : "Enne otsust tasub täita mõõdud / täpne tarbimine — muidu jääb tasuvus laia vahemikku.",
  };
}

export function evaluateInvestmentScenario(input: {
  type: SimulationType;
  name: string;
  monthlySavingsEur: number;
  annualSavingsEur: number;
  paybackYears: number | null;
  config: Record<string, unknown>;
  context: {
    userType: "household" | "business";
    peakDependency0to100: number;
    dayShare: number;
    spotVolatility01: number;
    hasSolarAsset: boolean;
    hasHeatPumpAsset: boolean;
    hasEvAsset: boolean;
    machinery: boolean;
    dataStrength: "metered" | "modeled" | "weak";
    hasSiteCoords: boolean;
    solarFitHint?: number;
  };
}): InvestmentEvaluation {
  const payback = input.paybackYears;
  const annual = Math.max(0, input.annualSavingsEur);
  const monthly = Math.max(0, input.monthlySavingsEur);

  const self =
    typeof input.config.selfConsumptionShare === "number"
      ? input.config.selfConsumptionShare
      : typeof input.config.selfConsumptionShare === "string"
        ? Number(input.config.selfConsumptionShare)
        : 0.38;

  let strategic0 = 50;
  let summaryEt = "";
  let cautionEt: string | undefined;

  const solarFitForBattery =
    input.context.solarFitHint ??
    (input.type === "solar"
      ? fitSolar({
          payback,
          selfConsumption: clamp(self, 0, 1),
          dayShare: input.context.dayShare,
          hasSolarAsset: input.context.hasSolarAsset,
        })
      : 50);

  if (input.type === "solar") {
    strategic0 = fitSolar({
      payback,
      selfConsumption: clamp(self, 0, 1),
      dayShare: input.context.dayShare,
      hasSolarAsset: input.context.hasSolarAsset,
    });
    summaryEt =
      strategic0 >= 62
        ? "Päikesel on sinu profiilil päris tugev strateegiline mõju — eriti kui päevane tarbimine ja oma-tarbimine klapivad."
        : strategic0 <= 40
          ? "Päikese tasuvus jääb selle mudeli järgi tagasihoidlikuks — tasub küsida ka väiksemat süsteemi või keskenduda enne ajastusele."
          : "Päike on mõistlik kandidaat, kuid tasuvus sõltub varjudest, suunast ja oma-tarbimisest — väärib täiendavat pakkumist.";
    if (input.context.hasSolarAsset) {
      cautionEt = "Sul on juba päikesesüsteem märgitud — uue päikese stsenaarium võib olla duplikaat.";
    }
  } else if (input.type === "battery") {
    strategic0 = fitBattery({
      payback,
      spotVol01: input.context.spotVolatility01,
      solarFit: solarFitForBattery,
      peakDep: input.context.peakDependency0to100,
    });
    summaryEt =
      strategic0 >= 60
        ? "Aku toob kõige rohkem kasu, kui on börsi volatiilsus ja/või päikese ülejääk — sinu profiilis on see päris plausiivne."
        : "Aku tasuvus näeb praegu nõrgana välja — tihti tasub kõigepealt päike/ajastus ära teha ja siis uuesti arvutada.";
    if (solarFitForBattery < 45 && strategic0 < 55) {
      cautionEt =
        "Kui päikese sobitus on nõrk, jääb akul sageli puudu “tasuta energiast”, mida salvestada.";
    }
  } else if (input.type === "ev_charger") {
    strategic0 = fitEvCharger({ hasEv: input.context.hasEvAsset, payback });
    summaryEt = input.context.hasEvAsset
      ? "Kodu laadija tasub kõige rohkem siis, kui paned laadimise odavatesse tundidesse."
      : "Ilma elektriautota on laadija investeering sageli ennatlik — hinda seda kui ettevalmistust või äri klientidele.";
  } else if (input.type === "heat_pump") {
    const heatingHeavy =
      input.context.hasHeatPumpAsset ||
      (typeof input.config.annualHeatKwh === "number" && input.config.annualHeatKwh > 2500) ||
      input.context.peakDependency0to100 > 55;
    strategic0 = fitHeatPump({
      hasHeatPumpAsset: input.context.hasHeatPumpAsset,
      payback,
      heatingHeavy,
    });
    summaryEt =
      strategic0 >= 58
        ? "Soojuspump võib olla suurim energiamuudatus — eriti kui küttevajadus on kõrge ja praegune süsteem kallis."
        : "Soojuspumba tasuvus sõltub COP-ist ja küttekulust — praeguste eeldustega on see pigem “uurida edasi”, mitte automaatne “jah”.";
  } else {
    strategic0 = fitPeakShave({
      isBusiness: input.context.userType === "business",
      machinery: input.context.machinery,
      peakDep: input.context.peakDependency0to100,
    });
    summaryEt =
      input.context.userType === "business"
        ? "Tipu vähendamine mõjutab võrgumakse ja lepinguid — äris tasub kaardistada 15-min profiil."
        : "Kodumajapidamises on tipu “shaving” harvem automaatne ROI — pigem ärimudelite teema.";
  }

  const strategic: ScoredSignal = {
    score0to100: strategic0,
    band: bandFromScore(strategic0),
    rationaleEt: summaryEt,
  };

  const readiness = readinessScore({
    data: input.context.dataStrength,
    hasSiteCoords: input.context.hasSiteCoords,
  });

  const assumption = assumptionDependency(input.type, payback);
  const verdict = verdictFrom(strategic0, payback, annual);

  const sens = 0.25 + assumption.score0to100 / 400;
  const low = round2(monthly * (1 - sens));
  const high = round2(monthly * (1 + sens));

  if (verdict === "wait") {
    summaryEt =
      strategic0 < 40
        ? `${summaryEt} Praeguste eeldustega ei looks me seda prioriteetselt ette.`
        : `${summaryEt} Tasuvus on liiga nõrk või ebakindel, et seda kohe “teha” soovitada.`;
  }

  return {
    type: input.type,
    name: input.name,
    monthlySavingsEur: monthly,
    annualSavingsEur: annual,
    paybackYears: payback,
    strategicFit: strategic,
    readiness,
    assumptionDependency: assumption,
    verdict,
    monthlySavingsLowHigh: { low, high },
    summaryEt,
    cautionEt,
  };
}
