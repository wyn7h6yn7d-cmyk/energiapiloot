/**
 * Shared shape for investment simulation context (dashboard + public flows).
 */
export type SimulationInvestmentContext = {
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
};
