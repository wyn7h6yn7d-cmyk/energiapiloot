import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import { fetchJson } from "@/lib/api/utils/http";
import { pvgisPVcalcSchema } from "@/lib/api/schemas/pvgis";
import type { SolarProductionEstimate } from "@/lib/domain/models";

export type PvgisAdapter = {
  estimateSolar(input: {
    lat: number;
    lng: number;
    peakPowerKwp: number;
    tiltDeg: number;
    azimuthDeg: number;
    lossPercent: number;
  }): Promise<AdapterResult<SolarProductionEstimate>>;
};

function mockEstimate(input: {
  lat: number;
  lng: number;
  peakPowerKwp: number;
  tiltDeg: number;
  azimuthDeg: number;
  lossPercent: number;
}): SolarProductionEstimate {
  const annual = input.peakPowerKwp * 950 * (1 - input.lossPercent / 100);
  const monthlyKwh = Array.from({ length: 12 }, (_, m) => ({
    month: m + 1,
    kwh: (annual / 12) * (0.75 + 0.25 * Math.sin((m - 2) / 2)),
  }));
  return {
    peakPowerKwp: input.peakPowerKwp,
    tiltDeg: input.tiltDeg,
    azimuthDeg: input.azimuthDeg,
    annualProductionKwh: Math.round(annual),
    monthlyKwh: monthlyKwh.map((x) => ({ month: x.month, kwh: Math.round(x.kwh) })),
    lossPercent: input.lossPercent,
    source: "mock",
  };
}

async function liveEstimate(
  env: ApiEnv,
  input: {
    lat: number;
    lng: number;
    peakPowerKwp: number;
    tiltDeg: number;
    azimuthDeg: number;
    lossPercent: number;
  }
): Promise<SolarProductionEstimate> {
  const u = new URL("/PVcalc", env.PVGIS_BASE_URL);
  u.searchParams.set("lat", String(input.lat));
  u.searchParams.set("lon", String(input.lng));
  u.searchParams.set("peakpower", String(input.peakPowerKwp));
  u.searchParams.set("loss", String(input.lossPercent));
  u.searchParams.set("angle", String(input.tiltDeg));
  u.searchParams.set("aspect", String(input.azimuthDeg));
  u.searchParams.set("outputformat", "json");
  const raw = await fetchJson<unknown>(u.toString(), { method: "GET" });
  const parsed = pvgisPVcalcSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError("PVGIS vastus ei vasta skeemale", { code: "VALIDATION" });
  }
  const E_y = parsed.data.outputs?.totals?.E_y;
  const E_m = parsed.data.outputs?.totals?.E_m;
  if (E_y == null) {
    throw new ApiError("PVGIS: puudub outputs.totals.E_y", { code: "VALIDATION" });
  }
  const monthlyKwh = (E_m ?? []).map((kwh, i) => ({ month: i + 1, kwh: Math.round(kwh) }));
  return {
    peakPowerKwp: input.peakPowerKwp,
    tiltDeg: input.tiltDeg,
    azimuthDeg: input.azimuthDeg,
    annualProductionKwh: Math.round(E_y),
    monthlyKwh: monthlyKwh.length ? monthlyKwh : [],
    lossPercent: input.lossPercent,
    source: "pvgis",
  };
}

export function createPvgisAdapter(env: ApiEnv): PvgisAdapter {
  return {
    async estimateSolar(input) {
      if (env.ENERGIAPILOOT_API_MODE === "mock") {
        return { ok: true, data: mockEstimate(input) };
      }
      try {
        const data = await liveEstimate(env, input);
        return { ok: true, data };
      } catch (e) {
        if (env.ENERGIAPILOOT_API_MODE === "live") {
          return {
            ok: false,
            error: e instanceof ApiError ? e : new ApiError("PVGIS error", {}),
          };
        }
        return { ok: true, data: mockEstimate(input) };
      }
    },
  };
}
