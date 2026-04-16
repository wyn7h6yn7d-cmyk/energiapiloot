import { getAdapters } from "@/lib/api/adapters/registry";
import { globalMemoryCache } from "@/lib/api/cache/memory-cache";
import type { MarketArea, MarketPriceTimeseries } from "@/lib/domain/models";

import { defaultMarketAreaFromEnv } from "@/lib/server/repositories/user-energy-context";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export type MarketPriceStats = {
  avgEurPerMwh: number;
  minEurPerMwh: number;
  maxEurPerMwh: number;
  latestEurPerMwh: number;
  previousDayAvgEurPerMwh: number;
  pointCount: number;
};

export function summarizeMarketPrices(series: MarketPriceTimeseries): MarketPriceStats {
  const vals = series.points.map((p) => p.value).filter((n) => Number.isFinite(n));
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 0;
  const latest = vals.length ? vals[vals.length - 1] : 0;

  const byDay = new Map<string, number[]>();
  for (const p of series.points) {
    const day = p.ts.slice(0, 10);
    const arr = byDay.get(day) ?? [];
    arr.push(p.value);
    byDay.set(day, arr);
  }
  const days = [...byDay.keys()].sort();
  const lastDay = days[days.length - 1];
  const prevDay = days[days.length - 2];
  const dayAvg = (day: string | undefined) => {
    if (!day) return avg;
    const xs = byDay.get(day) ?? [];
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : avg;
  };

  return {
    avgEurPerMwh: avg,
    minEurPerMwh: min,
    maxEurPerMwh: max,
    latestEurPerMwh: latest,
    previousDayAvgEurPerMwh: dayAvg(prevDay),
    pointCount: vals.length,
  };
}

export async function getCachedDayAheadPrices(input?: {
  area?: MarketArea;
  days?: number;
}): Promise<{ series: MarketPriceTimeseries; meta: { cacheKey: string; ttlSec: number } }> {
  const { env, nordPool } = getAdapters();
  const area = input?.area ?? defaultMarketAreaFromEnv();
  const days = input?.days ?? 7;
  const from = new Date();
  const to = new Date(from.getTime() + (days - 1) * 86400000);
  const key = `nordpool:dayahead:${area}:${isoDate(from)}:${days}`;
  const ttlSec = env.CACHE_MARKET_TTL_SEC;

  const series = await globalMemoryCache.getOrSet(key, ttlSec, async () => {
    const r = await nordPool.getDayAheadPrices({
      area,
      fromDate: isoDate(from),
      toDate: isoDate(to),
    });
    if (!r.ok) throw r.error;
    return r.data;
  });

  return { series, meta: { cacheKey: key, ttlSec } };
}
