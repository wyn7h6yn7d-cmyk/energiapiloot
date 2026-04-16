import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import { fetchJson } from "@/lib/api/utils/http";
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
 * Live day-ahead prices for the Baltic region.
 *
 * Default implementation uses Elering Dashboard "NPS price" feed (public, no auth):
 * - GET https://dashboard.elering.ee/api/nps/price?start=...&end=...
 * Response:
 *   { success: true, data: { ee: [{ timestamp: number, price: number }, ...] } }
 *
 * We keep this behind the "NordPoolAdapter" name for backward compatibility.
 */
async function liveDayAhead(
  env: ApiEnv,
  input: { area: MarketArea; fromDate: string; toDate: string }
): Promise<MarketPriceTimeseries> {
  // Elering uses lower-case area keys for Baltics (ee/lv/lt/fi). For unsupported areas,
  // the caller should supply a different provider or keep cached values.
  const areaKey = input.area.toLowerCase();
  const supported = new Set(["ee", "lv", "lt", "fi"]);
  if (!supported.has(areaKey)) {
    throw new ApiError(`Hinnainfo pole selle piirkonna jaoks toetatud: ${input.area}`, {
      code: "CONFIG",
    });
  }

  const base = (env.NORD_POOL_BASE_URL || "https://dashboard.elering.ee").replace(/\/+$/, "");

  const startIso = `${input.fromDate}T00:00:00Z`;
  const endIso = `${input.toDate}T23:59:59.999Z`;
  const url = `${base}/api/nps/price?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`;

  const payload = await fetchJson<{
    success?: boolean;
    data?: Record<string, Array<{ timestamp: number; price: number }>>;
  }>(url);

  if (!payload?.data || typeof payload.data !== "object") {
    throw new ApiError("Elering NPS vastus oli ootamatu (data puudub).", { code: "UPSTREAM" });
  }

  const rows = payload.data[areaKey];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ApiError("Elering NPS: hinnad puuduvad valitud vahemikus.", { code: "UPSTREAM" });
  }

  const points = rows
    .filter((r) => r && typeof r.timestamp === "number" && typeof r.price === "number")
    .map((r) => ({
      ts: new Date(r.timestamp * 1000).toISOString(),
      value: r.price,
      unit: "eur_per_mwh" as const,
    }));

  return {
    area: input.area,
    contractType: "day_ahead",
    currency: "EUR",
    points,
    source: "nord_pool",
  };
}

export function createNordPoolAdapter(env: ApiEnv): NordPoolAdapter {
  const mock = mockDayAhead;
  return {
    async getDayAheadPrices(input) {
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
      if (env.ENERGIAPILOOT_API_MODE === "hybrid") {
        try {
          const data = await liveDayAhead(env, input);
          return { ok: true, data: { ...data, source: "nord_pool" } };
        } catch (e) {
          return {
            ok: false,
            error: e instanceof ApiError ? e : new ApiError("Hinnainfo päring ebaõnnestus", {}),
          };
        }
      }

      // mock (demo-only)
      return { ok: true, data: mock(input.area, 7) };
    },
  };
}
