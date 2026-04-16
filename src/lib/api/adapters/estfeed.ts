import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import type {
  ConsumptionTimeseries,
  EstfeedConnectionStatus,
  ProductionTimeseries,
} from "@/lib/domain/models";

export type EstfeedAdapter = {
  getConnectionStatus(userId: string): Promise<AdapterResult<EstfeedConnectionStatus>>;
  listMeteringPoints(userId: string): Promise<AdapterResult<{ id: string; label: string }[]>>;
  getConsumptionSeries(input: {
    userId: string;
    siteId: string;
    meteringPointId?: string;
    fromIso: string;
    toIso: string;
    resolution: "pt15m" | "pt60m";
  }): Promise<AdapterResult<ConsumptionTimeseries>>;
  getProductionSeries(input: {
    userId: string;
    siteId: string;
    fromIso: string;
    toIso: string;
    resolution: "pt15m" | "pt60m";
  }): Promise<AdapterResult<ProductionTimeseries>>;
};

function mockConsumption(siteId: string, resolution: "pt15m" | "pt60m"): ConsumptionTimeseries {
  const stepH = resolution === "pt60m" ? 1 : 0.25;
  const points = [];
  const start = Date.now() - 7 * 24 * 3600 * 1000;
  for (let i = 0; i < 7 * 24 / stepH; i++) {
    const ts = new Date(start + i * stepH * 3600 * 1000).toISOString();
    const base = resolution === "pt60m" ? 0.45 : 0.12;
    const wave = Math.sin(i / 6) * 0.08;
    points.push({ ts, value: Math.max(0.05, base + wave), unit: "kwh" as const });
  }
  return {
    siteId,
    resolution,
    points,
    unit: "kwh",
    source: "mock",
  };
}

export function createMockEstfeedAdapter(): EstfeedAdapter {
  return {
    async getConnectionStatus() {
      return {
        ok: true,
        data: { state: "disconnected", message: "Estfeed/Datahub ühendus pole veel seadistatud (mock)." },
      };
    },
    async listMeteringPoints() {
      return { ok: true, data: [{ id: "mp-demo-1", label: "Demo mõõtepunkt (mock)" }] };
    },
    async getConsumptionSeries(input) {
      return { ok: true, data: mockConsumption(input.siteId, input.resolution) };
    },
    async getProductionSeries(input) {
      return {
        ok: true,
        data: {
          siteId: input.siteId,
          resolution: input.resolution,
          points: [],
          unit: "kwh",
          source: "mock",
        },
      };
    },
  };
}

/**
 * Live Estfeed/Datahub — requires credentials + real token flow.
 * TODO: implement OAuth2/client credentials per Elering documentation when keys exist.
 */
export function createLiveEstfeedAdapter(env: ApiEnv): EstfeedAdapter {
  return {
    async getConnectionStatus() {
      if (!env.ELERING_ESTFEED_BASE_URL) {
        return {
          ok: false,
          error: new ApiError("ELERING_ESTFEED_BASE_URL puudub", { code: "CONFIG" }),
        };
      }
      return {
        ok: false,
        error: new ApiError(
          "Estfeed live adapter: token voog pole veel implementeeritud (ootab credentsiaale).",
          { code: "UPSTREAM" }
        ),
      };
    },
    async listMeteringPoints() {
      return {
        ok: false,
        error: new ApiError("Estfeed live: pole implementeeritud.", { code: "UPSTREAM" }),
      };
    },
    async getConsumptionSeries() {
      return {
        ok: false,
        error: new ApiError("Estfeed live: pole implementeeritud.", { code: "UPSTREAM" }),
      };
    },
    async getProductionSeries() {
      return {
        ok: false,
        error: new ApiError("Estfeed live: pole implementeeritud.", { code: "UPSTREAM" }),
      };
    },
  };
}

export function createEstfeedAdapter(env: ApiEnv): EstfeedAdapter {
  const mock = createMockEstfeedAdapter();
  const live = createLiveEstfeedAdapter(env);
  if (env.ENERGIAPILOOT_API_MODE === "mock") return mock;
  if (env.ENERGIAPILOOT_API_MODE === "live") return live;
  // hybrid: try live status; fall back to mock for reads we support
  return {
    async getConnectionStatus(userId) {
      const r = await live.getConnectionStatus(userId);
      if (r.ok) return r;
      return mock.getConnectionStatus(userId);
    },
    async listMeteringPoints(userId) {
      const r = await live.listMeteringPoints(userId);
      if (r.ok) return r;
      return mock.listMeteringPoints(userId);
    },
    async getConsumptionSeries(input) {
      const r = await live.getConsumptionSeries(input);
      if (r.ok) return r;
      return mock.getConsumptionSeries(input);
    },
    async getProductionSeries(input) {
      const r = await live.getProductionSeries(input);
      if (r.ok) return r;
      return mock.getProductionSeries(input);
    },
  };
}
