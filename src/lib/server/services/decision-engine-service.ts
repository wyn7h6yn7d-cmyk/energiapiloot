import type { AnalysisInputs } from "@/lib/contracts/model";
import { buildConsumptionInsights, type ConsumptionProfileInputs } from "@/lib/consumption/insights";
import { assessDataQuality } from "@/lib/domain/scoring/confidence";
import { runDecisionEngine } from "@/lib/domain/recommendations/engine";
import type { DecisionEngineOutput } from "@/lib/domain/recommendations/types";
import {
  parseSiteAddressJson,
  profileAssetsToOverviewFlags,
} from "@/lib/server/repositories/user-energy-context";
import { getContractAnalysisMarketHints } from "@/lib/server/services/contract-analysis-service";
import { getDashboardOverviewData } from "@/lib/server/services/dashboard-overview-service";
import type { DashboardOverviewBundle } from "@/lib/server/services/dashboard-overview-service";
import type { Profile } from "@/lib/supabase/profile";
import type { SiteRow } from "@/lib/supabase/site";
import { SIM_DEFINITIONS } from "@/lib/simulations/definitions";
import type { ScenarioDTO } from "@/app/(app)/dashboard/simulations/actions";
import type { SimulationInvestmentContext } from "@/lib/product/simulation-investment-context";

export type { SimulationInvestmentContext };

function mapDataStrength(dq: ReturnType<typeof assessDataQuality>): SimulationInvestmentContext["dataStrength"] {
  if (dq.strength === "metered") return "metered";
  if (dq.strength === "modeled_profile") return "modeled";
  return "weak";
}

export async function getSimulationInvestmentContextForUser(input: {
  userId: string;
  profile: Profile | null;
  site: SiteRow;
  overviewBundle?: DashboardOverviewBundle;
}): Promise<SimulationInvestmentContext> {
  const bundle = input.overviewBundle
    ? input.overviewBundle
    : await getDashboardOverviewData({
        userId: input.userId,
        profile: input.profile,
        site: input.site,
      });
  const { overview, meta } = bundle;
  const flags = profileAssetsToOverviewFlags(input.profile);
  const peakHourDep =
    overview.contract.riskLabel === "kõrge" ? 0.62 : overview.contract.riskLabel === "madal" ? 0.38 : 0.52;

  const consumptionRaw: ConsumptionProfileInputs = {
    monthlyKwh: overview.kpis.estMonthlyKwh,
    avgAllInEurPerKwh: overview.kpis.estAvgPriceEurPerKwh,
    dayShare: 0.58,
    weekendShare: 0.26,
    baseLoadW: input.profile?.object_type === "apartment" ? 180 : 220,
    devices: {
      ev: flags.ev,
      boiler: true,
      heat_pump: flags.heatPump,
      cooling: false,
      commercial_refrigeration: input.profile?.user_type === "business",
      machinery:
        input.profile?.user_type === "business" &&
        (input.profile?.object_type === "warehouse" || input.profile?.object_type === "shop"),
    },
    peakHourDependency: peakHourDep,
  };
  const usage = buildConsumptionInsights(consumptionRaw);

  const dq = assessDataQuality({
    hasMeteredConsumption: meta.engineSignals.hasMeteredConsumption,
    meteringPending: input.profile?.data_connection === "estfeed_pending",
    monthlyKwhModeled: !meta.engineSignals.hasMeteredConsumption,
  });

  const coords = input.profile?.site_address ? parseSiteAddressJson(input.profile.site_address) : null;

  return {
    userType: input.profile?.user_type === "business" ? "business" : "household",
    peakDependency0to100: usage.kpis.peakDependencyScore,
    dayShare: consumptionRaw.dayShare,
    spotVolatility01: meta.engineSignals.spotVolatility01,
    hasSolarAsset: flags.solar,
    hasHeatPumpAsset: flags.heatPump,
    hasEvAsset: flags.ev,
    machinery:
      input.profile?.user_type === "business" &&
      (input.profile?.object_type === "warehouse" ||
        input.profile?.object_type === "shop" ||
        input.profile?.object_type === "office"),
    dataStrength: mapDataStrength(dq),
    hasSiteCoords: Boolean(coords?.coordinates),
  };
}

export async function getDecisionEngineOutputForUser(input: {
  userId: string;
  profile: Profile | null;
  site: SiteRow;
  scenarios: ScenarioDTO[];
  overviewBundle?: DashboardOverviewBundle;
}): Promise<DecisionEngineOutput> {
  const [bundle, marketHints] = await Promise.all([
    input.overviewBundle
      ? Promise.resolve(input.overviewBundle)
      : getDashboardOverviewData({
          userId: input.userId,
          profile: input.profile,
          site: input.site,
        }),
    getContractAnalysisMarketHints(),
  ]);

  const { overview, meta } = bundle;
  const flags = profileAssetsToOverviewFlags(input.profile);
  const peakHourDep =
    overview.contract.riskLabel === "kõrge" ? 0.62 : overview.contract.riskLabel === "madal" ? 0.38 : 0.52;

  const consumptionRaw: ConsumptionProfileInputs = {
    monthlyKwh: overview.kpis.estMonthlyKwh,
    avgAllInEurPerKwh: overview.kpis.estAvgPriceEurPerKwh,
    dayShare: 0.58,
    weekendShare: 0.26,
    baseLoadW: input.profile?.object_type === "apartment" ? 180 : 220,
    devices: {
      ev: flags.ev,
      boiler: true,
      heat_pump: flags.heatPump,
      cooling: false,
      commercial_refrigeration: input.profile?.user_type === "business",
      machinery:
        input.profile?.user_type === "business" &&
        (input.profile?.object_type === "warehouse" || input.profile?.object_type === "shop"),
    },
    peakHourDependency: peakHourDep,
  };

  const contractAnalysisInputs: AnalysisInputs = {
    monthlyKwh: overview.kpis.estMonthlyKwh,
    pattern: { peakShare: 0.38, peakPriceMultiplier: 1.28 },
    current: {
      providerName: overview.contract.provider,
      type: overview.contract.type,
      baseFeeEurPerMonth: overview.contract.baseFeeEurPerMonth,
      energyPriceEurPerKwh:
        overview.contract.type === "spot"
          ? Math.max(overview.contract.energyPriceEurPerKwh, marketHints.impliedSpotEnergyEurPerKwh)
          : overview.contract.energyPriceEurPerKwh,
      networkFeeEurPerKwh: overview.contract.networkFeeEurPerKwh,
      vatRate: overview.contract.vatRate,
    },
    assumptions: {
      spotVolatility: marketHints.suggestedSpotVolatility,
      hybridSpotShare: 0.55,
    },
  };

  const scenarios = input.scenarios.map((s) => {
    const res = SIM_DEFINITIONS[s.simulation_type].calculate((s.config ?? {}) as never);
    return {
      type: s.simulation_type,
      name: s.name,
      monthlySavingsEur: res.monthlySavingsEur,
      annualSavingsEur: res.annualSavingsEur,
      paybackYears: res.paybackYears,
      config: s.config ?? {},
    };
  });

  const coords = input.profile?.site_address ? parseSiteAddressJson(input.profile.site_address) : null;

  return runDecisionEngine({
    userType: input.profile?.user_type === "business" ? "business" : "household",
    objectType: input.profile?.object_type ?? "other",
    contractAnalysisInputs,
    consumptionRaw,
    dataSignals: {
      hasMeteredConsumption: meta.engineSignals.hasMeteredConsumption,
      meteringPending: input.profile?.data_connection === "estfeed_pending",
    },
    assets: {
      solar: flags.solar,
      battery: flags.battery,
      ev: flags.ev,
      heatPump: flags.heatPump,
    },
    machinery:
      input.profile?.user_type === "business" &&
      (input.profile?.object_type === "warehouse" ||
        input.profile?.object_type === "shop" ||
        input.profile?.object_type === "office"),
    hasSiteCoords: Boolean(coords?.coordinates),
    marketVolatility01: meta.engineSignals.spotVolatility01,
    scenarios,
  });
}
