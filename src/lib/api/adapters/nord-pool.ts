import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import type { MarketArea, MarketPriceTimeseries } from "@/lib/domain/models";

export type NordPoolAdapter = {
  getDayAheadPrices(input: {
    area: MarketArea;
    fromDate: string;
    toDate: string;
  }): Promise<AdapterResult<MarketPriceTimeseries>>;
};

function mockDayAhead(area: MarketArea, days: number): MarketPriceTimeseries {
  const points = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 0; d < days; d++) {
    for (let h = 0; h < 24; h++) {
      const ts = new Date(start.getTime() + (d * 24 + h) * 3600 * 1000).toISOString();
      const base = 85 + Math.sin((d + h) / 5) * 18;
      points.push({ ts, value: Math.max(20, base), unit: "eur_per_mwh" as const });
    }
  }
  return {
    area,
    contractType: "day_ahead",
    currency: "EUR",
    points,
    source: "mock",
  };
}

/**
 * Live Nord Pool Data Portal — endpoint shapes vary by product/version.
 * Configure full URL via NORD_POOL_BASE_URL; extend parser when you have a stable contract.
 */
async function liveDayAhead(
  _env: ApiEnv,
  _input: { area: MarketArea; fromDate: string; toDate: string }
): Promise<MarketPriceTimeseries> {
  void _env;
  void _input;
  throw new ApiError(
    "Nord Pool live: lisa päris endpoint + vastuse normaliseerimine (Zod) vastavalt Nord Pool Data Portal lepingule.",
    { code: "CONFIG" }
  );
}

export function createNordPoolAdapter(env: ApiEnv): NordPoolAdapter {
  const mock = mockDayAhead;
  return {
    async getDayAheadPrices(input) {
      if (env.ENERGIAPILOOT_API_MODE === "mock") {
        return { ok: true, data: mock(input.area, 7) };
      }
      if (env.ENERGIAPILOOT_API_MODE === "live") {
        try {
          const data = await liveDayAhead(env, input);
          return { ok: true, data: { ...data, source: "nord_pool" } };
        } catch (e) {
          return {
            ok: false,
            error: e instanceof ApiError ? e : new ApiError("Nord Pool live ebaõnnestus", {}),
          };
        }
      }
      try {
        const data = await liveDayAhead(env, input);
        return { ok: true, data: { ...data, source: "nord_pool" } };
      } catch {
        return { ok: true, data: mock(input.area, 7) };
      }
    },
  };
}
