export type ContractMarketHints = {
  avgDayAheadEurPerMwh: number;
  impliedSpotEnergyEurPerKwh: number;
  /** 0..1 heuristic from day-ahead spread */
  suggestedSpotVolatility: number;
  priceSource: "nord_pool" | "mock";
  noteEt: string;
};
