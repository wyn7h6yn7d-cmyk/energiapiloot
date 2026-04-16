import type { AnalysisInputs } from "@/lib/contracts/model";
import { buildContractIntelligence } from "@/lib/domain/contracts/intelligence";
import { buildConsumptionIntelligence } from "@/lib/domain/consumption/intelligence";
import { evaluateInvestmentScenario } from "@/lib/domain/investments/intelligence";
import {
  assessDataQuality,
  dampenConfidence,
  dampenImpactEur,
  explainConfidencePrefix,
} from "@/lib/domain/scoring/confidence";
import {
  explainContractHeadline,
  explainInvestmentVerdictPlain,
  explainPeakHoursPlain,
  formatSavingsRange,
} from "@/lib/domain/recommendations/explanations";
import type { DecisionEngineOutput, ProductRecommendation } from "@/lib/domain/recommendations/types";
import type { ConsumptionProfileInputs } from "@/lib/consumption/insights";
import { clamp, round2 } from "@/lib/domain/utils/math";
import type { SimulationType } from "@/lib/simulations/types";

export type DecisionEngineScenario = {
  type: SimulationType;
  name: string;
  monthlySavingsEur: number;
  annualSavingsEur: number;
  paybackYears: number | null;
  config: Record<string, unknown>;
};

export type DecisionEngineInput = {
  userType: "household" | "business";
  objectType: string;
  contractAnalysisInputs: AnalysisInputs;
  consumptionRaw: ConsumptionProfileInputs;
  dataSignals: {
    hasMeteredConsumption: boolean;
    meteringPending: boolean;
  };
  assets: {
    solar: boolean;
    battery: boolean;
    ev: boolean;
    heatPump: boolean;
  };
  machinery: boolean;
  hasSiteCoords: boolean;
  marketVolatility01: number;
  scenarios: DecisionEngineScenario[];
};

function effortFromPriority(p: number): ProductRecommendation["effort"] {
  if (p >= 78) return "suur";
  if (p >= 52) return "keskmine";
  return "väike";
}

function mapDataStrength(
  dq: ReturnType<typeof assessDataQuality>
): "metered" | "modeled" | "weak" {
  if (dq.strength === "metered") return "metered";
  if (dq.strength === "modeled_profile") return "modeled";
  return "weak";
}

export function runDecisionEngine(input: DecisionEngineInput): DecisionEngineOutput {
  const dataQuality = assessDataQuality({
    hasMeteredConsumption: input.dataSignals.hasMeteredConsumption,
    meteringPending: input.dataSignals.meteringPending,
    monthlyKwhModeled: !input.dataSignals.hasMeteredConsumption,
  });

  const consumption = buildConsumptionIntelligence(
    input.consumptionRaw,
    dataQuality,
    input.objectType
  );

  const contract = buildContractIntelligence(input.contractAnalysisInputs, {
    peakDependency0to100: consumption.profile.kpis.peakDependencyScore,
    flexibility0to100: consumption.flexibilityScore.score0to100,
    marketVolatility01: input.marketVolatility01,
    userType: input.userType,
  });

  const solarScenario = input.scenarios.filter((s) => s.type === "solar").sort((a, b) => {
    const pa = a.paybackYears ?? 99;
    const pb = b.paybackYears ?? 99;
    return pa - pb;
  })[0];

  const solarFitHint = solarScenario
    ? clamp(
        52 +
          (solarScenario.paybackYears !== null && solarScenario.paybackYears < 10 ? 18 : 0) -
          (solarScenario.paybackYears !== null && solarScenario.paybackYears > 14 ? 20 : 0),
        0,
        100
      )
    : undefined;

  const ds = mapDataStrength(dataQuality);

  const investments = input.scenarios.map((s) =>
    evaluateInvestmentScenario({
      type: s.type,
      name: s.name,
      monthlySavingsEur: s.monthlySavingsEur,
      annualSavingsEur: s.annualSavingsEur,
      paybackYears: s.paybackYears,
      config: s.config,
      context: {
        userType: input.userType,
        peakDependency0to100: consumption.profile.kpis.peakDependencyScore,
        dayShare: input.consumptionRaw.dayShare,
        spotVolatility01: input.marketVolatility01,
        hasSolarAsset: input.assets.solar,
        hasHeatPumpAsset: input.assets.heatPump,
        hasEvAsset: input.assets.ev,
        machinery: input.machinery,
        dataStrength: ds,
        hasSiteCoords: input.hasSiteCoords,
        solarFitHint,
      },
    })
  );

  const recs: ProductRecommendation[] = [];
  const peak = consumption.profile.kpis.peakDependencyScore;
  const flex = consumption.flexibilityScore.score0to100;
  const usageCost = consumption.profile.kpis.estMonthlyCostEur;
  const currentType = contract.analysis.current.type;
  const bestFit = contract.analysis.recommendation.bestFit;

  const push = (r: Omit<ProductRecommendation, "rank">) => {
    recs.push({ ...r, rank: 0 });
  };

  if (dataQuality.strength === "assumptions_only") {
    push({
      id: "rec_connect_data",
      category: "monitoring",
      title: "Enne suuri otsuseid: täienda tarbimise täpsust",
      summary:
        "Ilma intervallandmeteta jäävad investeeringu ja lepingu hinnangud laiemaks kui vaja — see on aus, aga mitte lõplik.",
      explanation: dataQuality.summaryEt,
      whyItMatters:
        "Energiapiloot saab anda kõige kindlamaid soovitusi siis, kui näeme reaalset profiili (Datahub või mõõtur).",
      estimatedImpactEurPerMonth: 0,
      timeHorizonEt: "1–3 nädalat (ühenduse seadistamine)",
      confidence: "kõrge",
      confidenceNote: explainConfidencePrefix(dataQuality),
      effort: "väike",
      priority0to100: Math.round(86 * dataQuality.priorityDampening),
      nextStepLabel: "Ava seaded / ühenda andmed",
      nextStepHref: "/dashboard/settings",
      signals: [
        { label: "Andmekvaliteet", value: `${dataQuality.completeness0to100}/100` },
        { label: "Staatus", value: "eeldused" },
      ],
      whyNowVsLaterEt:
        "Kui ühendad mõõduandmed nüüd, väldid olukorda, kus investeering otsustatakse liiga laia vahemiku pealt.",
    });
  }

  if (!contract.isMarginalDifference && currentType !== bestFit && contract.savingsOpportunityEurPerMonth >= 4) {
    const impact = dampenImpactEur(contract.savingsOpportunityEurPerMonth * 0.65, dataQuality);
    const conf = dampenConfidence(
      contract.analysis.current.riskScore >= 62 ? "keskmine" : "madal",
      dataQuality
    );
    push({
      id: "rec_contract_fit",
      category: "contract",
      title: explainContractHeadline(contract),
      summary: contract.summaryEt,
      explanation: `${contract.contractFitScore.rationaleEt} ${contract.volatilityExposure.rationaleEt}`,
      whyItMatters:
        "Vale lepingutüüp võib kalliks minna just siis, kui tarbimine ei klapi hinnastruktuuriga — mitte ainult kui “kWh hind” tundub kõrge.",
      estimatedImpactEurPerMonth: round2(impact),
      timeHorizonEt: "2–8 nädalat (pakkumised)",
      confidence: conf,
      confidenceNote: explainConfidencePrefix(dataQuality),
      effort: "keskmine",
      priority0to100: Math.round(
        clamp(58 + contract.savingsOpportunityEurPerMonth * 1.8 + (peak > 62 ? 8 : 0), 40, 92) *
          dataQuality.priorityDampening
      ),
      nextStepLabel: "Võrdle lepinguid",
      nextStepHref: "/dashboard/contracts",
      signals: [
        { label: "Hinnanguline võit", value: `~${contract.savingsOpportunityEurPerMonth.toFixed(1)} €/kuu (gross)` },
        { label: "Praegune vs parim", value: `${currentType} → ${bestFit}` },
        { label: "Lepingu sobivus", value: `${contract.contractFitScore.score0to100}/100` },
      ],
      whyNowVsLaterEt:
        "Kui leping annab kiiret ja suhteliselt kindlat võitu, tasub see enne kalleid riistvara otsuseid ära kaardistada.",
    });
  }

  if (currentType === "spot" && peak >= 64 && flex < 46) {
    const impact = dampenImpactEur(Math.max(5, usageCost * 0.055), dataQuality);
    push({
      id: "rec_spot_risk",
      category: "contract",
      title: "Börsileping võib olla sinu jaoks liiga terav",
      summary: explainPeakHoursPlain(peak),
      explanation: `${explainPeakHoursPlain(peak)} Kui paindlikkus on madal, ei saa sa hinda “ajastusega” piisavalt pehmendada.`,
      whyItMatters:
        "Kui suur osa elektrist kulub kallitel tundidel ja sa ei saa tarbimist nihutada, maksad börsi negatiivseid momente harvemini tagasi.",
      estimatedImpactEurPerMonth: round2(impact),
      timeHorizonEt: "2–6 nädalat",
      confidence: dampenConfidence("keskmine", dataQuality),
      confidenceNote: explainConfidencePrefix(dataQuality),
      effort: "väike",
      priority0to100: Math.round(
        clamp(64 + (peak - 65) * 0.35, 55, 88) * dataQuality.priorityDampening
      ),
      nextStepLabel: "Vaata hübriid / fikseeritud",
      nextStepHref: "/dashboard/contracts",
      signals: [
        { label: "Tipu-sõltuvus", value: `${peak}/100` },
        { label: "Paindlikkus", value: `${flex}/100` },
      ],
      whyNowVsLaterEt: "See on eelarveriski maandamine — seda tasub teha enne, kui börsi kõikumine jõuab arvetesse.",
    });
  }

  if (currentType === "fixed" && flex >= 58 && peak <= 48 && input.marketVolatility01 >= 0.38) {
    const impact = dampenImpactEur(Math.max(3, usageCost * 0.035), dataQuality);
    push({
      id: "rec_spot_opportunity",
      category: "contract",
      title: "Sul võib olla ruumi börsi optimeerimiseks",
      summary:
        "Kui su tarbimist saab odavatesse tundidesse nihutada, võib börs või hübriid anda säästu ilma sama riskitasemeta kui tipu-nõrgal majapidamisel.",
      explanation: consumption.flexibilityScore.rationaleEt,
      whyItMatters:
        "Fikseeritud leping on stabiilne, kuid võib jätta raha lauale, kui turg on vahel odav ja sina suudad kohanduda.",
      estimatedImpactEurPerMonth: round2(impact),
      timeHorizonEt: "2–8 nädalat",
      confidence: dampenConfidence("madal", dataQuality),
      confidenceNote: explainConfidencePrefix(dataQuality),
      effort: "keskmine",
      priority0to100: Math.round(48 * dataQuality.priorityDampening),
      nextStepLabel: "Simuleeri lepinguid",
      nextStepHref: "/dashboard/contracts",
      signals: [
        { label: "Paindlikkus", value: `${flex}/100` },
        { label: "Turu volatiilsus (eeldus)", value: `${Math.round(input.marketVolatility01 * 100)}%` },
      ],
    });
  }

  if (peak >= 58 && (currentType === "spot" || currentType === "hybrid")) {
    const impact = dampenImpactEur(Math.max(4, usageCost * 0.065), dataQuality);
    push({
      id: "rec_shift_load",
      category: "behavior",
      title: "Ajasta suured tarbijad odavamatesse tundidesse",
      summary: explainPeakHoursPlain(peak),
      explanation:
        "Boiler, soojuspump, jahutus ja EV on kõige tavalisemad kohad, kus paar reeglit annavad kohe tulemust.",
      whyItMatters:
        "See on sageli kõige odavam “investeering”: vähem kapitali kui päikesel, aga mõju näed juba järgmisel kuul.",
      estimatedImpactEurPerMonth: round2(impact),
      timeHorizonEt: "1–4 nädalat",
      confidence: dampenConfidence(peak >= 72 ? "kõrge" : "keskmine", dataQuality),
      confidenceNote: explainConfidencePrefix(dataQuality),
      effort: "väike",
      priority0to100: Math.round(
        clamp(52 + (peak - 58) * 0.55 + (flex > 52 ? 10 : 0), 44, 86) * dataQuality.priorityDampening
      ),
      nextStepLabel: "Täpsusta tarbimise profiil",
      nextStepHref: "/dashboard/consumption",
      signals: [
        { label: "Tipu-sõltuvus", value: `${peak}/100` },
        { label: "Paindlikkus", value: `${flex}/100` },
      ],
      whyNowVsLaterEt: "Kui teed selle enne lepingu vahetust, näed ka uue lepingu tõelist potentsiaali.",
    });
  }

  if (peak >= 62 && flex >= 44) {
    push({
      id: "rec_automation",
      category: "automation",
      title: "Pane ajastus ja automaatika tööle (mitte ainult “jälgimine”)",
      summary:
        "Kui sul on paindlikkust, tasub see viia reegliteks: taimerid, laadimisaknad, võimalusel nutikas juhtimine.",
      explanation:
        "Automaatika vähendab unustamist — just see unustamine viib tagasi kallitesse tundidesse.",
      whyItMatters: "Ilma automaatikata on hea plaan nädalaks, mitte kuudeks.",
      estimatedImpactEurPerMonth: dampenImpactEur(Math.max(2.5, usageCost * 0.03), dataQuality),
      timeHorizonEt: "2–6 nädalat",
      confidence: dampenConfidence("keskmine", dataQuality),
      effort: "keskmine",
      priority0to100: Math.round(46 * dataQuality.priorityDampening),
      nextStepLabel: "Vaata tarbimise ülevaadet",
      nextStepHref: "/dashboard",
      signals: [{ label: "Paindlikkus", value: `${flex}/100` }],
    });
  }

  if (consumption.baselineClass === "elevated" || consumption.baselineClass === "high_alert") {
    const impact = dampenImpactEur(
      Math.max(5, usageCost * Math.min(0.14, consumption.profile.kpis.baseLoadShare * 0.2)),
      dataQuality
    );
    push({
      id: "rec_baseline",
      category: "investigation",
      title:
        consumption.baselineClass === "high_alert"
          ? "Öine / pidev tarbimine on ebatavalt kõrge — kontrolli lekkeid ja valmidust"
          : "Baas-tarbimine on kõrge: leia varjatud pidevatarbijad",
      summary:
        "Kui suur osa elektrist kulub “ilma tegevusteta”, maksad ka siis, kui arvad, et midagi ei käi.",
      explanation: consumption.profile.anomalies.find((a) => a.title.includes("baas"))?.description ?? "",
      whyItMatters:
        "Paljud majapidamised leiavad siit kiireima säästu ilma lepingut vahetamata — eriti serverid, pump, valmidusrežiimid.",
      estimatedImpactEurPerMonth: round2(impact),
      timeHorizonEt: "1 nädal",
      confidence: dampenConfidence(
        consumption.baselineClass === "high_alert" ? "kõrge" : "keskmine",
        dataQuality
      ),
      confidenceNote: explainConfidencePrefix(dataQuality),
      effort: "väike",
      priority0to100: Math.round(
        clamp(58 + consumption.profile.kpis.baseLoadShare * 40, 48, 84) * dataQuality.priorityDampening
      ),
      nextStepLabel: "Ava tarbimise analüüs",
      nextStepHref: "/dashboard/consumption",
      signals: [
        { label: "Baas osakaal", value: `${Math.round(consumption.profile.kpis.baseLoadShare * 100)}%` },
      ],
    });
  }

  if (input.assets.ev) {
    push({
      id: "rec_ev",
      category: "ev",
      title: "Hoia EV laadimine öös ja odavates akendes",
      summary: "Elektriauto on suur plokk — see on ka kõige lihtsam plokk ajastada.",
      explanation:
        peak >= 60
          ? "Kui laadid tiputundidel, võid ühe seadme kaudu tuua tagasi kogu börsi negatiivse efekti."
          : "Isegi mõõduka tipuga annab laadimisreegel stabiilse säästu.",
      whyItMatters: "EV on nagu “akud ja võimsus ühes” — vale aeg = kallis kWh.",
      estimatedImpactEurPerMonth: dampenImpactEur(Math.max(3, usageCost * 0.034), dataQuality),
      timeHorizonEt: "paari päevaga",
      confidence: dampenConfidence(peak >= 65 ? "kõrge" : "keskmine", dataQuality),
      effort: "väike",
      priority0to100: Math.round((50 + (peak >= 65 ? 12 : 0)) * dataQuality.priorityDampening),
      nextStepLabel: "Täpsusta profiil",
      nextStepHref: "/dashboard/consumption",
      signals: [{ label: "EV", value: "jah" }],
    });
  }

  const solarEval = investments.find((i) => i.type === "solar");
  if (solarEval && solarEval.verdict !== "wait" && !input.assets.solar) {
    const impact = dampenImpactEur(solarEval.monthlySavingsEur, dataQuality);
    push({
      id: "rec_solar",
      category: "solar",
      title:
        solarEval.verdict === "do_now"
          ? "Päike näeb sinu saidil päris tugev välja — väärib projekti"
          : "Päike on mõistlik järgmine samm, aga vajab veel kinnitust",
      summary: solarEval.summaryEt,
      explanation: `${solarEval.summaryEt} ${explainInvestmentVerdictPlain(solarEval.verdict, solarEval.paybackYears)}`,
      whyItMatters:
        "Päike vähendab ostetavat kWh ja võib ühtlasi muuta aku/ajastuse mõju — aga ainult kui tootlus ja oma-tarbimine klappivad.",
      estimatedImpactEurPerMonth: round2(impact),
      impactLowEur: solarEval.monthlySavingsLowHigh.low,
      impactHighEur: solarEval.monthlySavingsLowHigh.high,
      timeHorizonEt: "3–9 kuud (projekt)",
      confidence: dampenConfidence(
        solarEval.verdict === "do_now" ? "keskmine" : "madal",
        dataQuality
      ),
      confidenceNote: `${explainConfidencePrefix(dataQuality)}Vahemik: ${formatSavingsRange(
        solarEval.monthlySavingsLowHigh.low,
        solarEval.monthlySavingsLowHigh.high
      )}.`,
      effort: "suur",
      priority0to100: Math.round(
        (solarEval.strategicFit.score0to100 * 0.72 + (solarEval.verdict === "do_now" ? 14 : 0)) *
          dataQuality.priorityDampening
      ),
      nextStepLabel: "Ava simulatsioonid",
      nextStepHref: "/dashboard/simulations",
      signals: [
        { label: "Strateegiline sobivus", value: `${solarEval.strategicFit.score0to100}/100` },
        { label: "Tasuvus", value: solarEval.paybackYears !== null ? `${solarEval.paybackYears.toFixed(1)} a` : "—" },
        { label: "Valmidus", value: `${solarEval.readiness.score0to100}/100` },
      ],
      whyNowVsLaterEt:
        "Kui päike on tugev, tasub see sageli enne akut — muidu pole akul “mida salvestada”.",
    });
  }

  const batteryEval = investments.find((i) => i.type === "battery");
  const solarWeak = !solarEval || solarEval.strategicFit.score0to100 < 48;
  if (batteryEval && (batteryEval.verdict === "wait" || solarWeak) && batteryEval.paybackYears !== null) {
    push({
      id: "rec_battery_wait",
      category: "battery",
      title: "Aku tasuvus jääb praegu tagasihoidlikuks — ära kiirusta",
      summary: batteryEval.summaryEt,
      explanation: batteryEval.cautionEt ?? batteryEval.summaryEt,
      whyItMatters:
        "Aku tasuvus sõltub hinnavahest ja salvestatavast energiast. Nõrga päikese või nõrga börsi mustriga jääb ROI tihti alla ootuse.",
      estimatedImpactEurPerMonth: 0,
      timeHorizonEt: "6–18 kuud (uuesti hinnata)",
      confidence: dampenConfidence("keskmine", dataQuality),
      effort: "väike",
      priority0to100: Math.round(36 * dataQuality.priorityDampening),
      nextStepLabel: "Uuenda stsenaarium",
      nextStepHref: "/dashboard/simulations",
      signals: [
        { label: "Aku tasuvus", value: `${batteryEval.paybackYears.toFixed(1)} a` },
        { label: "Päikese sobivus", value: solarEval ? `${solarEval.strategicFit.score0to100}/100` : "—" },
      ],
      whyNowVsLaterEt: "Kui päike/ajastus paraneb, muutub aku number tihti oluliselt.",
    });
  }

  const hpEval = investments.find((i) => i.type === "heat_pump");
  if (hpEval && !input.assets.heatPump) {
    if (hpEval.verdict !== "wait" || usageCost >= 95) {
      push({
        id: "rec_hp",
        category: "heating",
        title:
          hpEval.verdict === "do_now"
            ? "Soojuspump võib olla sinu suurim energiamuudatus"
            : "Soojuspump väärib eraldi stsenaariumit (soojus + COP)",
        summary: hpEval.summaryEt,
        explanation: explainInvestmentVerdictPlain(hpEval.verdict, hpEval.paybackYears),
        whyItMatters:
          "Kütte ja sooja vee osakaal võib ületada elektritarbimise “klassikalise” osa — seda ei tohiks jätta juhuslikku tähelepanuta.",
        estimatedImpactEurPerMonth: dampenImpactEur(Math.max(0, hpEval.monthlySavingsEur * 0.85), dataQuality),
        timeHorizonEt: "6–18 kuud",
        confidence: dampenConfidence(
          hpEval.verdict === "do_now" ? "keskmine" : "madal",
          dataQuality
        ),
        effort: "suur",
        priority0to100: Math.round(
          (hpEval.strategicFit.score0to100 * 0.55 + (usageCost > 110 ? 12 : 0)) * dataQuality.priorityDampening
        ),
        nextStepLabel: "Simuleeri soojuspump",
        nextStepHref: "/dashboard/simulations",
        signals: [
          { label: "Sobivus", value: `${hpEval.strategicFit.score0to100}/100` },
          { label: "Kuukulu tase", value: `${round2(usageCost)} €` },
        ],
      });
    }
  }

  if (input.userType === "business" && (input.machinery || peak >= 58)) {
    const ps = investments.find((i) => i.type === "peak_shaving");
    if (ps && ps.strategicFit.score0to100 >= 52) {
      push({
        id: "rec_peak_shave",
        category: "behavior",
        title: "Äris tasub eraldada tipud ja võrgumaksed",
        summary:
          "Kui masinad koonduvad samasse aknasse, võib tipu hind olla kallim kui keskmine kWh ütleb.",
        explanation: ps.summaryEt,
        whyItMatters: "Võrk ja leping võivad mõlemad karistada tippe — eriti väikese äri puhul.",
        estimatedImpactEurPerMonth: dampenImpactEur(Math.max(0, ps.monthlySavingsEur), dataQuality),
        timeHorizonEt: "1–3 kuud",
        confidence: dampenConfidence("keskmine", dataQuality),
        effort: "keskmine",
        priority0to100: Math.round(ps.strategicFit.score0to100 * 0.58 * dataQuality.priorityDampening),
        nextStepLabel: "Peak shaving stsenaarium",
        nextStepHref: "/dashboard/simulations",
        signals: [{ label: "Äri profiil", value: input.machinery ? "masinad" : "tipp-keskmine" }],
      });
    }
  }

  for (const opp of consumption.profile.opportunities) {
    const impact = dampenImpactEur(opp.estMonthlyEur, dataQuality);
    const exists = recs.some((r) => r.title.toLowerCase() === opp.title.toLowerCase());
    if (exists) continue;
    push({
      id: `rec_opp_${opp.id}`,
      category: opp.title.toLowerCase().includes("baas") ? "investigation" : "behavior",
      title: opp.title,
      summary: opp.rationale,
      explanation: opp.rationale,
      whyItMatters: "See tuleb otse sinu tarbimise koostisest — mitte üldisest nõustamisest.",
      estimatedImpactEurPerMonth: round2(impact),
      timeHorizonEt: "2–6 nädalat",
      confidence: dampenConfidence(opp.confidence, dataQuality),
      effort: "väike",
      priority0to100: Math.round(
        clamp(40 + opp.estMonthlyEur * 2.2, 35, 78) * dataQuality.priorityDampening
      ),
      nextStepLabel: "Tarbimise leht",
      nextStepHref: "/dashboard/consumption",
      signals: [{ label: "Usaldus", value: opp.confidence }],
    });
  }

  const uniq = new Map<string, ProductRecommendation>();
  for (const r of recs) {
    if (!uniq.has(r.id)) uniq.set(r.id, r);
  }
  const list = [...uniq.values()].sort((a, b) => b.priority0to100 - a.priority0to100);
  list.forEach((r, i) => {
    r.rank = i + 1;
  });

  const savingsCandidates = list.filter((r) => r.estimatedImpactEurPerMonth > 0);
  const strongestSavings = savingsCandidates.length
    ? savingsCandidates.reduce((a, b) => (a.estimatedImpactEurPerMonth >= b.estimatedImpactEurPerMonth ? a : b))
    : null;

  const invStrong = investments
    .filter((i) => i.verdict === "do_now" || i.verdict === "evaluate_further")
    .sort((a, b) => b.strategicFit.score0to100 - a.strategicFit.score0to100)[0];

  const strongestInvestment = invStrong
    ? { title: invStrong.name, type: invStrong.type, verdict: invStrong.verdict }
    : null;

  const notEnoughData = dataQuality.strength === "assumptions_only" && list.every((r) => r.category === "monitoring");

  return {
    dataQuality,
    contract,
    consumption,
    investments,
    recommendations: list,
    strongestSavings: strongestSavings
      ? {
          title: strongestSavings.title,
          eurPerMonth: strongestSavings.estimatedImpactEurPerMonth,
          category: strongestSavings.category,
        }
      : null,
    strongestInvestment,
    notEnoughData,
  };
}
