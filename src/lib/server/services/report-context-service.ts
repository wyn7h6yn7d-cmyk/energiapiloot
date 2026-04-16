import { analyzeContracts } from "@/lib/contracts/model";
import { buildConsumptionInsights } from "@/lib/consumption/insights";
import type { ReportContext } from "@/lib/reports/generate";
import type { Profile } from "@/lib/supabase/profile";
import type { SiteRow } from "@/lib/supabase/site";
import type { SimulationType } from "@/lib/simulations/types";

import { profileAssetsToOverviewFlags } from "@/lib/server/repositories/user-energy-context";
import { getDashboardOverviewData } from "@/lib/server/services/dashboard-overview-service";
import { getContractAnalysisMarketHints } from "@/lib/server/services/contract-analysis-service";

export async function buildIntegratedReportContext(input: {
  userId: string;
  profile: Profile | null;
  site: SiteRow;
  scenarios: {
    id: string;
    simulation_type: SimulationType;
    name: string;
    config: Record<string, unknown>;
  }[];
}): Promise<ReportContext> {
  const [{ overview }, marketHints] = await Promise.all([
    getDashboardOverviewData({ userId: input.userId, profile: input.profile, site: input.site }),
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

  const contract = analyzeContracts({
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
    site: input.site,
    audience: input.profile?.user_type === "business" ? "business" : "household",
    overview,
    contract,
    usage,
    scenarios: input.scenarios,
  };
}
