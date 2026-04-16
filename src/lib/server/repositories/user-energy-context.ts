import { z } from "zod";

import type { AddressResult, EnergySite, MarketArea } from "@/lib/domain/models";
import type { Profile } from "@/lib/supabase/profile";
import type { SiteRow } from "@/lib/supabase/site";

const addressResultSchema = z.object({
  id: z.string(),
  label: z.string(),
  countryCode: z.string(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  sourceRef: z.string().optional(),
  provider: z.enum(["mock", "maaamet", "inads", "unknown"]),
});

export function parseSiteAddressJson(raw: unknown): AddressResult | null {
  const parsed = addressResultSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function profileToEnergySite(profile: Profile | null, site: SiteRow): EnergySite {
  const addr = profile?.site_address ? parseSiteAddressJson(profile.site_address) : null;
  return {
    id: site.id,
    name: site.name,
    objectType: site.object_type,
    country: "EE",
    timezone: "Europe/Tallinn",
    address: addr,
    coordinates: addr?.coordinates ?? null,
  };
}

export function defaultMarketAreaFromEnv(fallback: MarketArea = "EE"): MarketArea {
  const v = process.env.NORD_POOL_DEFAULT_AREA ?? fallback;
  const allowed: MarketArea[] = ["EE", "LV", "LT", "FI", "SE1", "SE2", "SE3", "SE4", "NO1", "SYS"];
  return (allowed.includes(v as MarketArea) ? v : fallback) as MarketArea;
}

export function profileAssetsToOverviewFlags(profile: Profile | null): {
  solar: boolean;
  battery: boolean;
  ev: boolean;
  heatPump: boolean;
} {
  const assets = profile?.assets ?? [];
  const has = (k: string) => assets.includes(k as never);
  return {
    solar: has("solar"),
    battery: has("battery"),
    ev: has("ev"),
    heatPump: has("heat_pump"),
  };
}

export function mapProfileContractToOverviewType(
  t: Profile["contract_type"]
): "spot" | "fixed" | "hybrid" {
  if (t === "fixed" || t === "hybrid" || t === "spot") return t;
  return "spot";
}
