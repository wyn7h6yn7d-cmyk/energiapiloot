import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import { fetchJson } from "@/lib/api/utils/http";
import { openMeteoForecastSchema } from "@/lib/api/schemas/open-meteo";
import type { WeatherForecast, WeatherSnapshot } from "@/lib/domain/models";

export type OpenMeteoAdapter = {
  getCurrent(input: { lat: number; lng: number }): Promise<AdapterResult<WeatherSnapshot>>;
  getForecast(input: { lat: number; lng: number }): Promise<AdapterResult<WeatherForecast>>;
};

function mockSnapshot(lat: number, lng: number): WeatherSnapshot {
  return {
    fetchedAt: new Date().toISOString(),
    lat,
    lng,
    temperatureC: 4.2,
    shortwaveRadiationWm2: 120,
    cloudCoverPercent: 55,
    source: "mock",
  };
}

async function liveCurrent(env: ApiEnv, lat: number, lng: number): Promise<WeatherSnapshot> {
  const u = new URL("/forecast", env.OPEN_METEO_BASE_URL);
  u.searchParams.set("latitude", String(lat));
  u.searchParams.set("longitude", String(lng));
  u.searchParams.set(
    "current",
    "temperature_2m,shortwave_radiation,cloud_cover"
  );
  u.searchParams.set("timezone", "auto");
  const raw = await fetchJson<unknown>(u.toString());
  const parsed = openMeteoForecastSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError("Open-Meteo vastus ei vasta skeemale", { code: "VALIDATION" });
  }
  const c = parsed.data.current;
  return {
    fetchedAt: new Date().toISOString(),
    lat,
    lng,
    temperatureC: c?.temperature_2m ?? 0,
    shortwaveRadiationWm2: c?.shortwave_radiation,
    cloudCoverPercent: c?.cloud_cover,
    source: "open_meteo",
  };
}

async function liveForecast(env: ApiEnv, lat: number, lng: number): Promise<WeatherForecast> {
  const u = new URL("/forecast", env.OPEN_METEO_BASE_URL);
  u.searchParams.set("latitude", String(lat));
  u.searchParams.set("longitude", String(lng));
  u.searchParams.set("hourly", "temperature_2m,shortwave_radiation");
  u.searchParams.set("forecast_days", "3");
  u.searchParams.set("timezone", "auto");
  const raw = await fetchJson<unknown>(u.toString());
  const parsed = openMeteoForecastSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.hourly) {
    throw new ApiError("Open-Meteo hourly puudub", { code: "VALIDATION" });
  }
  const h = parsed.data.hourly;
  const points = h.time.map((ts, i) => ({
    ts,
    value: h.temperature_2m?.[i] ?? 0,
    unit: "deg_c" as const,
  }));
  return { hourly: points, source: "open_meteo" };
}

export function createOpenMeteoAdapter(env: ApiEnv): OpenMeteoAdapter {
  return {
    async getCurrent({ lat, lng }) {
      if (env.ENERGIAPILOOT_API_MODE === "mock") {
        return { ok: true, data: mockSnapshot(lat, lng) };
      }
      try {
        const data = await liveCurrent(env, lat, lng);
        return { ok: true, data };
      } catch (e) {
        if (env.ENERGIAPILOOT_API_MODE === "live") {
          return {
            ok: false,
            error: e instanceof ApiError ? e : new ApiError("Open-Meteo error", {}),
          };
        }
        return { ok: true, data: mockSnapshot(lat, lng) };
      }
    },
    async getForecast({ lat, lng }) {
      if (env.ENERGIAPILOOT_API_MODE === "mock") {
        return {
          ok: true,
          data: {
            hourly: Array.from({ length: 24 }, (_, i) => ({
              ts: new Date(Date.now() + i * 3600 * 1000).toISOString(),
              value: 3 + Math.sin(i / 4),
              unit: "deg_c" as const,
            })),
            source: "mock",
          },
        };
      }
      try {
        const data = await liveForecast(env, lat, lng);
        return { ok: true, data };
      } catch (e) {
        if (env.ENERGIAPILOOT_API_MODE === "live") {
          return {
            ok: false,
            error: e instanceof ApiError ? e : new ApiError("Open-Meteo error", {}),
          };
        }
        return {
          ok: true,
          data: {
            hourly: [],
            source: "mock",
          },
        };
      }
    },
  };
}
