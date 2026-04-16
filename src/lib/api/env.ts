import { z } from "zod";

/**
 * Central env validation for external APIs.
 * Never import this file from client components — use only in server modules / route handlers.
 */
const apiEnvSchema = z.object({
  /** mock: safe dev; live: attempt real HTTP; hybrid: live with mock fallback on failure */
  ENERGIAPILOOT_API_MODE: z.enum(["mock", "live", "hybrid"]).default("mock"),

  ELERING_ESTFEED_BASE_URL: z.string().optional(),
  ELERING_ESTFEED_TOKEN_URL: z.string().optional(),
  ELERING_ESTFEED_CLIENT_ID: z.string().optional(),
  ELERING_ESTFEED_CLIENT_SECRET: z.string().optional(),

  NORD_POOL_BASE_URL: z
    .string()
    .default("https://dataportal-api.nordpoolgroup.com"),
  NORD_POOL_API_KEY: z.string().optional(),
  /** Default Baltic delivery area for day-ahead queries */
  NORD_POOL_DEFAULT_AREA: z.string().default("EE"),

  PVGIS_BASE_URL: z.string().default("https://re.jrc.ec.europa.eu/api/v5_2"),

  OPEN_METEO_BASE_URL: z.string().default("https://api.open-meteo.com/v1"),

  ADDRESS_API_PROVIDER: z.enum(["mock", "maaamet", "inads"]).default("mock"),
  ADDRESS_API_BASE_URL: z.string().optional(),
  ADDRESS_API_KEY: z.string().optional(),

  BUSINESS_REGISTRY_PROVIDER: z.enum(["mock", "rik"]).default("mock"),
  BUSINESS_REGISTRY_BASE_URL: z.string().optional(),
  BUSINESS_REGISTRY_API_KEY: z.string().optional(),

  CACHE_MARKET_TTL_SEC: z.coerce.number().int().positive().default(300),
  CACHE_WEATHER_TTL_SEC: z.coerce.number().int().positive().default(900),
  CACHE_ADDRESS_TTL_SEC: z.coerce.number().int().positive().default(3600),
  CACHE_PVGIS_TTL_SEC: z.coerce.number().int().positive().default(86400),
  CACHE_COMPANY_TTL_SEC: z.coerce.number().int().positive().default(21600),
  CACHE_ESTFEED_SERIES_TTL_SEC: z.coerce.number().int().positive().default(600),

  HTTP_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  HTTP_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

let cached: ApiEnv | null = null;

export function getApiEnv(): ApiEnv {
  if (cached) return cached;
  const parsed = apiEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid API env", parsed.error.flatten());
    throw new Error("Invalid API environment configuration");
  }
  cached = parsed.data;
  return parsed.data;
}

export function resetApiEnvCacheForTests() {
  cached = null;
}
