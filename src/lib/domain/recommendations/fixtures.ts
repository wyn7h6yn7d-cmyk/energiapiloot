import type { AnalysisInputs, ContractType } from "@/lib/contracts/model";
import { runDecisionEngine } from "@/lib/domain/recommendations/engine";
import type { DecisionEngineInput } from "@/lib/domain/recommendations/engine";
import type { DecisionEngineOutput } from "@/lib/domain/recommendations/types";

function baseContract(monthlyKwh: number, type: ContractType): AnalysisInputs {
  return {
    monthlyKwh,
    pattern: { peakShare: 0.38, peakPriceMultiplier: 1.28 },
    current: {
      providerName: "Demo",
      type,
      baseFeeEurPerMonth: 3.49,
      energyPriceEurPerKwh: 0.118,
      networkFeeEurPerKwh: 0.072,
      vatRate: 0.22,
    },
    assumptions: { spotVolatility: 0.48, hybridSpotShare: 0.55 },
  };
}

const FIXTURES: Record<string, DecisionEngineInput> = {
  apartment_simple: {
    userType: "household",
    objectType: "apartment",
    contractAnalysisInputs: baseContract(220, "fixed"),
    consumptionRaw: {
      monthlyKwh: 220,
      avgAllInEurPerKwh: 0.2,
      dayShare: 0.48,
      weekendShare: 0.28,
      baseLoadW: 140,
      devices: {
        ev: false,
        boiler: true,
        heat_pump: false,
        cooling: false,
        commercial_refrigeration: false,
        machinery: false,
      },
      peakHourDependency: 0.35,
    },
    dataSignals: { hasMeteredConsumption: false, meteringPending: false },
    assets: { solar: false, battery: false, ev: false, heatPump: false },
    machinery: false,
    hasSiteCoords: true,
    marketVolatility01: 0.32,
    scenarios: [],
  },
  house_heat_pump: {
    userType: "household",
    objectType: "house",
    contractAnalysisInputs: baseContract(520, "spot"),
    consumptionRaw: {
      monthlyKwh: 520,
      avgAllInEurPerKwh: 0.2,
      dayShare: 0.55,
      weekendShare: 0.24,
      baseLoadW: 200,
      devices: {
        ev: false,
        boiler: false,
        heat_pump: true,
        cooling: false,
        commercial_refrigeration: false,
        machinery: false,
      },
      peakHourDependency: 0.55,
    },
    dataSignals: { hasMeteredConsumption: true, meteringPending: false },
    assets: { solar: false, battery: false, ev: false, heatPump: true },
    machinery: false,
    hasSiteCoords: true,
    marketVolatility01: 0.44,
    scenarios: [
      {
        type: "heat_pump",
        name: "Soojuspump upgrade",
        monthlySavingsEur: 42,
        annualSavingsEur: 504,
        paybackYears: 9,
        config: { annualHeatKwh: 4200 },
      },
    ],
  },
  household_ev_solar: {
    userType: "household",
    objectType: "house",
    contractAnalysisInputs: baseContract(480, "spot"),
    consumptionRaw: {
      monthlyKwh: 480,
      avgAllInEurPerKwh: 0.21,
      dayShare: 0.62,
      weekendShare: 0.22,
      baseLoadW: 190,
      devices: {
        ev: true,
        boiler: true,
        heat_pump: false,
        cooling: false,
        commercial_refrigeration: false,
        machinery: false,
      },
      peakHourDependency: 0.68,
    },
    dataSignals: { hasMeteredConsumption: false, meteringPending: true },
    assets: { solar: true, battery: false, ev: true, heatPump: false },
    machinery: false,
    hasSiteCoords: true,
    marketVolatility01: 0.52,
    scenarios: [
      {
        type: "solar",
        name: "Päike 8 kW",
        monthlySavingsEur: 38,
        annualSavingsEur: 456,
        paybackYears: 8.2,
        config: { systemKw: 8, selfConsumptionShare: 0.42, annualYieldKwhPerKw: 980 },
      },
      {
        type: "battery",
        name: "Aku 10 kWh",
        monthlySavingsEur: 12,
        annualSavingsEur: 144,
        paybackYears: 16,
        config: { capacityKwh: 10 },
      },
    ],
  },
  retail_business: {
    userType: "business",
    objectType: "shop",
    contractAnalysisInputs: baseContract(1200, "hybrid"),
    consumptionRaw: {
      monthlyKwh: 1200,
      avgAllInEurPerKwh: 0.19,
      dayShare: 0.72,
      weekendShare: 0.35,
      baseLoadW: 380,
      devices: {
        ev: false,
        boiler: false,
        heat_pump: false,
        cooling: true,
        commercial_refrigeration: true,
        machinery: false,
      },
      peakHourDependency: 0.58,
    },
    dataSignals: { hasMeteredConsumption: false, meteringPending: false },
    assets: { solar: false, battery: false, ev: false, heatPump: false },
    machinery: false,
    hasSiteCoords: true,
    marketVolatility01: 0.41,
    scenarios: [
      {
        type: "peak_shaving",
        name: "Tipu vähendus",
        monthlySavingsEur: 55,
        annualSavingsEur: 660,
        paybackYears: 7,
        config: {},
      },
    ],
  },
  workshop: {
    userType: "business",
    objectType: "warehouse",
    contractAnalysisInputs: baseContract(2400, "spot"),
    consumptionRaw: {
      monthlyKwh: 2400,
      avgAllInEurPerKwh: 0.18,
      dayShare: 0.68,
      weekendShare: 0.18,
      baseLoadW: 520,
      devices: {
        ev: false,
        boiler: false,
        heat_pump: false,
        cooling: false,
        commercial_refrigeration: false,
        machinery: true,
      },
      peakHourDependency: 0.72,
    },
    dataSignals: { hasMeteredConsumption: true, meteringPending: false },
    assets: { solar: false, battery: false, ev: false, heatPump: false },
    machinery: true,
    hasSiteCoords: true,
    marketVolatility01: 0.55,
    scenarios: [],
  },
  cafe: {
    userType: "business",
    objectType: "shop",
    contractAnalysisInputs: baseContract(1850, "fixed"),
    consumptionRaw: {
      monthlyKwh: 1850,
      avgAllInEurPerKwh: 0.2,
      dayShare: 0.78,
      weekendShare: 0.4,
      baseLoadW: 450,
      devices: {
        ev: false,
        boiler: true,
        heat_pump: false,
        cooling: true,
        commercial_refrigeration: true,
        machinery: false,
      },
      peakHourDependency: 0.52,
    },
    dataSignals: { hasMeteredConsumption: false, meteringPending: false },
    assets: { solar: false, battery: false, ev: false, heatPump: false },
    machinery: false,
    hasSiteCoords: true,
    marketVolatility01: 0.36,
    scenarios: [
      {
        type: "solar",
        name: "Katuse päike",
        monthlySavingsEur: 22,
        annualSavingsEur: 264,
        paybackYears: 13,
        config: { systemKw: 12, selfConsumptionShare: 0.35 },
      },
    ],
  },
};

export function runFixture(id: keyof typeof FIXTURES): DecisionEngineOutput {
  return runDecisionEngine(FIXTURES[id]);
}

export function listFixtureIds(): (keyof typeof FIXTURES)[] {
  return Object.keys(FIXTURES) as (keyof typeof FIXTURES)[];
}

/** Deterministic snapshots for manual QA — call from dev tools if needed */
export function fixtureSummaryTable(): { id: string; top: string; savings: string }[] {
  return listFixtureIds().map((id) => {
    const o = runFixture(id);
    const top = o.recommendations[0]?.title ?? "—";
    const savings = o.strongestSavings      ? `${o.strongestSavings.eurPerMonth.toFixed(1)} € (${o.strongestSavings.category})`
      : "—";
    return { id: String(id), top, savings };
  });
}
