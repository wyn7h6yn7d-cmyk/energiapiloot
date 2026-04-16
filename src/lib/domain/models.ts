/**
 * Energiapiloot-native domain models.
 * Feature modules should depend on these shapes, not raw provider payloads.
 */

export type ISODate = string;
export type ISODateTime = string;

/** Baltic / EU market areas we normalize to */
export type MarketArea = "EE" | "LV" | "LT" | "FI" | "SE1" | "SE2" | "SE3" | "SE4" | "NO1" | "SYS";

export type EnergySite = {
  id: string;
  name: string;
  objectType: string;
  country?: string | null;
  timezone?: string | null;
  address?: AddressResult | null;
  coordinates?: { lat: number; lng: number } | null;
};

export type AddressResult = {
  id: string;
  label: string;
  countryCode: string;
  /** WGS84 */
  coordinates?: { lat: number; lng: number };
  /** Provider-specific raw id for re-fetch */
  sourceRef?: string;
  provider: "mock" | "maaamet" | "inads" | "unknown";
};

export type TimeseriesPoint = {
  ts: ISODateTime;
  value: number;
  unit: "kwh" | "eur_per_mwh" | "eur_per_kwh" | "deg_c" | "w_m2" | "percent";
};

export type ConsumptionTimeseries = {
  siteId: string;
  meteringPointId?: string;
  resolution: "pt15m" | "pt60m";
  points: TimeseriesPoint[];
  unit: "kwh";
  source: "estfeed" | "mock" | "manual";
};

export type ProductionTimeseries = {
  siteId: string;
  resolution: "pt15m" | "pt60m";
  points: TimeseriesPoint[];
  unit: "kwh";
  source: "estfeed" | "mock" | "manual";
};

export type MarketPriceTimeseries = {
  area: MarketArea;
  contractType: "day_ahead" | "intraday" | "unknown";
  currency: "EUR";
  points: TimeseriesPoint[];
  source: "nord_pool" | "mock" | "entsoe";
};

export type WeatherSnapshot = {
  fetchedAt: ISODateTime;
  lat: number;
  lng: number;
  temperatureC: number;
  /** Shortwave radiation, W/m² (instant or mean — documented per provider) */
  shortwaveRadiationWm2?: number;
  cloudCoverPercent?: number;
  source: "open_meteo" | "mock";
};

export type WeatherForecast = {
  hourly: TimeseriesPoint[];
  dailyHighLowC?: { date: ISODate; high: number; low: number }[];
  source: "open_meteo" | "mock";
};

export type SolarProductionEstimate = {
  peakPowerKwp: number;
  tiltDeg: number;
  azimuthDeg: number;
  annualProductionKwh: number;
  monthlyKwh: { month: number; kwh: number }[];
  lossPercent: number;
  source: "pvgis" | "mock";
};

export type ContractAnalysisInput = {
  siteId?: string;
  monthlyKwh: number;
  contractType: "spot" | "fixed" | "hybrid" | "unknown";
  fixedEnergyEurPerKwh?: number;
  networkEurPerKwh: number;
  baseFeeEurPerMonth: number;
  vatRate: number;
  peakShare?: number;
  peakPriceMultiplier?: number;
};

export type ContractAnalysisOutput = {
  estMonthlyEnergyCostEur: number;
  estMonthlyTotalEur: number;
  riskScore0to100: number;
  bestFitContract: "spot" | "fixed" | "hybrid";
  summaryEt: string;
  comparisonSeries: { label: string; monthlyEur: number }[];
};

export type InvestmentSimulationInput = {
  type: "solar" | "battery" | "ev_charger" | "heat_pump" | "peak_shaving";
  site?: EnergySite | null;
  /** For solar / PVGIS */
  peakPowerKwp?: number;
  tiltDeg?: number;
  azimuthDeg?: number;
  /** For heat pump — weather-informed */
  weather?: WeatherSnapshot | null;
  /** Economic context */
  avgSpotEurPerKwh?: number;
  upfrontEur: number;
};

export type InvestmentSimulationOutput = {
  type: InvestmentSimulationInput["type"];
  annualSavingsEur: number;
  monthlySavingsEur: number;
  paybackYears: number;
  assumptionsEt: string[];
  monthlyProductionKwh?: number[];
};

export type RecommendationInputContext = {
  profile: {
    userType: "household" | "business";
    contractType: string;
    assets: string[];
    goal: string;
    siteAddress?: AddressResult | null;
  };
  consumption?: ConsumptionTimeseries | null;
  market?: MarketPriceTimeseries | null;
  weather?: WeatherSnapshot | null;
  solarEstimate?: SolarProductionEstimate | null;
  contractAnalysis?: ContractAnalysisOutput | null;
};

export type RecommendationCard = {
  id: string;
  title: string;
  whyItMatters: string;
  estimatedImpactEurPerMonth: number;
  confidence: "madal" | "keskmine" | "kõrge";
  nextStep: string;
  kind: string;
};

export type CompanyLookupResult = {
  registryCode: string;
  name: string;
  legalAddress?: string | null;
  status?: "active" | "unknown";
  provider: "mock" | "rik" | "unknown";
};

export type EstfeedConnectionStatus = {
  state: "disconnected" | "pending" | "connected" | "error";
  message?: string;
};

export type DataSourceMeta = {
  provider: string;
  mode: "mock" | "live" | "cached";
  fetchedAt?: ISODateTime;
};
