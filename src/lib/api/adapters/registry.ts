import { getApiEnv } from "@/lib/api/env";
import { createAddressAdapter } from "@/lib/api/adapters/address";
import { createBusinessRegistryAdapter } from "@/lib/api/adapters/business-registry";
import { createEstfeedAdapter } from "@/lib/api/adapters/estfeed";
import { createNordPoolAdapter } from "@/lib/api/adapters/nord-pool";
import { createOpenMeteoAdapter } from "@/lib/api/adapters/open-meteo";
import { createPvgisAdapter } from "@/lib/api/adapters/pvgis";

export type Adapters = ReturnType<typeof createAdapters>;

let adapters: Adapters | null = null;

export function createAdapters() {
  const env = getApiEnv();
  return {
    env,
    estfeed: createEstfeedAdapter(env),
    nordPool: createNordPoolAdapter(env),
    address: createAddressAdapter(env),
    pvgis: createPvgisAdapter(env),
    openMeteo: createOpenMeteoAdapter(env),
    businessRegistry: createBusinessRegistryAdapter(env),
  };
}

export function getAdapters(): Adapters {
  if (!adapters) adapters = createAdapters();
  return adapters;
}

export function resetAdaptersForTests() {
  adapters = null;
}
