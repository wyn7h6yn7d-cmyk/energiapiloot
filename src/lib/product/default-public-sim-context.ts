import type { SimulationInvestmentContext } from "@/lib/product/simulation-investment-context";

/** Neutral guest context for public simulators (no profile). */
export const DEFAULT_PUBLIC_SIMULATION_CONTEXT: SimulationInvestmentContext = {
  userType: "household",
  peakDependency0to100: 52,
  dayShare: 0.58,
  spotVolatility01: 0.48,
  hasSolarAsset: false,
  hasHeatPumpAsset: false,
  hasEvAsset: false,
  machinery: false,
  dataStrength: "modeled",
  hasSiteCoords: false,
};
