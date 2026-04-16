import { analyzeContracts } from "@/lib/contracts/model";
import { buildConsumptionInsights } from "@/lib/consumption/insights";
import type { RecommendationContext } from "@/lib/recommendations/types";
import type { Profile } from "@/lib/supabase/profile";
import type { SiteRow } from "@/lib/supabase/site";
import { SIM_DEFINITIONS } from "@/lib/simulations/definitions";
import type { ScenarioDTO } from "@/app/(app)/dashboard/simulations/actions";

import { profileAssetsToOverviewFlags } from "@/lib/server/repositories/user-energy-context";
import { getDashboardOverviewData } from "@/lib/server/services/dashboard-overview-service";
import { getContractAnalysisMarketHints } from "@/lib/server/services/contract-analysis-service";

export async function buildRecommendationContextForUser(input: {
  userId: string;
  profile: Profile | null;
  site: SiteRow;
  scenarios: ScenarioDTO[];
}): Promise<RecommendationContext> {
  const [{ overview }, marketHints] = await Promise.all([
    getDashboardOverviewData({
      userId: input.userId,
      profile: input.profile,
      site: input.site,
    }),
    getContractAnalysisMarketHints(),
  ]);

  const flags = profileAssetsToOverviewFlags(input.profile);
  const usage = buildConsumptionInsights({
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
      machinery: input.profile?.user_type === "business",
    },
    peakHourDependency: overview.contract.riskLabel === "kõrge" ? 0.62 : 0.52,
  });

  const contractAnalysis = analyzeContracts({
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
  });

  return {
    profile: {
      userType: input.profile?.user_type === "business" ? "business" : "household",
    },
    contract: {
      type: contractAnalysis.current.type,
      riskScore: contractAnalysis.current.riskScore,
      bestFit: contractAnalysis.recommendation.bestFit,
      estMonthlyCostEur: contractAnalysis.current.estMonthlyCostEur,
    },
    usage: {
      estMonthlyCostEur: usage.kpis.estMonthlyCostEur,
      baseLoadShare: usage.kpis.baseLoadShare,
      peakDependencyScore: usage.kpis.peakDependencyScore,
      opportunities: usage.opportunities.map((o) => ({
        title: o.title,
        estMonthlyEur: o.estMonthlyEur,
        confidence: o.confidence,
      })),
      devices: {
        ev: flags.ev,
        boiler: true,
        heatPump: flags.heatPump,
      },
    },
    simulations: {
      scenarios: input.scenarios.map((s) => {
        const res = SIM_DEFINITIONS[s.simulation_type].calculate(s.config as never);
        return {
          type: s.simulation_type,
          name: s.name,
          monthlySavingsEur: res.monthlySavingsEur,
          paybackYears: res.paybackYears,
        };
      }),
    },
  };
}
