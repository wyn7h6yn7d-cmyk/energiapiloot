import { getAdapters } from "@/lib/api/adapters/registry";
import { globalMemoryCache } from "@/lib/api/cache/memory-cache";
import type { SolarIntegrationHints } from "@/lib/integrations/solar-hints";
import type { Profile } from "@/lib/supabase/profile";
import type { SiteRow } from "@/lib/supabase/site";

import { profileToEnergySite } from "@/lib/server/repositories/user-energy-context";

export type { SolarIntegrationHints };

/**
 * Lightweight PVGIS estimate for pre-filling simulation assumptions (server-only).
 */
export async function getSolarIntegrationHints(input: {
  userId: string;
  profile: Profile | null;
  site: SiteRow;
}): Promise<SolarIntegrationHints> {
  const { env, pvgis } = getAdapters();
  const s = profileToEnergySite(input.profile, input.site);
  const lat = s.coordinates?.lat ?? 59.437;
  const lng = s.coordinates?.lng ?? 24.7536;
  const demoPeakPowerKwp = 6;
  const key = `pvgis:hint:${input.userId}:${lat.toFixed(3)}:${lng.toFixed(3)}:${demoPeakPowerKwp}`;

  const estimate = await globalMemoryCache.getOrSet(key, env.CACHE_PVGIS_TTL_SEC, async () => {
    const r = await pvgis.estimateSolar({
      lat,
      lng,
      peakPowerKwp: demoPeakPowerKwp,
      tiltDeg: 30,
      azimuthDeg: 0,
      lossPercent: 14,
    });
    if (!r.ok) throw r.error;
    return r.data;
  });

  return {
    annualProductionKwh: estimate.annualProductionKwh,
    demoPeakPowerKwp,
    lat,
    lng,
    source: estimate.source,
  };
}
