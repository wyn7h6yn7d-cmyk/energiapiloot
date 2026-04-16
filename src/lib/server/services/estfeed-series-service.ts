import { getAdapters } from "@/lib/api/adapters/registry";
import { globalMemoryCache } from "@/lib/api/cache/memory-cache";
import type { ConsumptionTimeseries } from "@/lib/domain/models";

export async function getCachedUserConsumptionSeries(input: {
  userId: string;
  siteId: string;
  meteringPointId?: string;
  days?: number;
  resolution?: "pt15m" | "pt60m";
}): Promise<ConsumptionTimeseries> {
  const { env, estfeed } = getAdapters();
  const days = input.days ?? 7;
  const resolution = input.resolution ?? "pt60m";
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  const key = `estfeed:cons:${input.userId}:${input.siteId}:${input.meteringPointId ?? "default"}:${resolution}:${from.toISOString().slice(0, 10)}:${days}`;

  return globalMemoryCache.getOrSet(key, env.CACHE_ESTFEED_SERIES_TTL_SEC, async () => {
    const r = await estfeed.getConsumptionSeries({
      userId: input.userId,
      siteId: input.siteId,
      meteringPointId: input.meteringPointId,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
      resolution,
    });
    if (!r.ok) throw r.error;
    return r.data;
  });
}
