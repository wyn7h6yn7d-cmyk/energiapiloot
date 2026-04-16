export type SolarIntegrationHints = {
  annualProductionKwh: number;
  demoPeakPowerKwp: number;
  lat: number;
  lng: number;
  source: "pvgis" | "mock";
};
