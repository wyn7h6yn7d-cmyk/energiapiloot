import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import type { CompanyLookupResult } from "@/lib/domain/models";

export type BusinessRegistryAdapter = {
  lookup(query: string): Promise<AdapterResult<CompanyLookupResult[]>>;
};

function mockLookup(q: string): CompanyLookupResult[] {
  const s = q.trim();
  if (s.length < 2) return [];
  return [
    {
      registryCode: "12345678",
      name: `Demo OÜ (${s})`,
      legalAddress: "Tallinn, Eesti (mock)",
      status: "active",
      provider: "mock",
    },
  ];
}

export function createBusinessRegistryAdapter(env: ApiEnv): BusinessRegistryAdapter {
  return {
    async lookup(query) {
      if (env.BUSINESS_REGISTRY_PROVIDER === "mock" || env.ENERGIAPILOOT_API_MODE === "mock") {
        return { ok: true, data: mockLookup(query) };
      }
      if (!env.BUSINESS_REGISTRY_BASE_URL) {
        return {
          ok: false,
          error: new ApiError("BUSINESS_REGISTRY_BASE_URL puudub", { code: "CONFIG" }),
        };
      }
      return {
        ok: false,
        error: new ApiError("RIK/äriregister live adapter pole veel ühendatud.", {
          code: "UPSTREAM",
        }),
      };
    },
  };
}
