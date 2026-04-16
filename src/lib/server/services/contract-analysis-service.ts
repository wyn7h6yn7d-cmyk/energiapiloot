import type { ContractMarketHints } from "@/lib/integrations/contract-market-hints";
import { summarizeMarketPrices, getCachedDayAheadPrices } from "@/lib/server/services/nord-pool-service";

export type { ContractMarketHints };

export async function getContractAnalysisMarketHints(): Promise<ContractMarketHints> {
  const { series } = await getCachedDayAheadPrices({ days: 7 });
  const stats = summarizeMarketPrices(series);
  const spread = stats.maxEurPerMwh - stats.minEurPerMwh;
  const suggestedSpotVolatility = Math.min(
    1,
    Math.max(0, stats.avgEurPerMwh > 0 ? spread / (2 * stats.avgEurPerMwh) : 0.35)
  );

  return {
    avgDayAheadEurPerMwh: stats.avgEurPerMwh,
    impliedSpotEnergyEurPerKwh: stats.avgEurPerMwh / 1000,
    suggestedSpotVolatility,
    priceSource: series.source === "nord_pool" ? "nord_pool" : "mock",
    noteEt:
      series.source === "mock"
        ? "Turuhinnad on demo režiimis (mock). Live režiimis tuleb Nord Pool parser täita."
        : `Turuhinnad: Nord Pool päev-ahead keskmine ~${Math.round(stats.avgEurPerMwh)} €/MWh.`,
  };
}
