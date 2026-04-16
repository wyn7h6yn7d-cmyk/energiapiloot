import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import type { AddressResult } from "@/lib/domain/models";

export type AddressAdapter = {
  search(query: string): Promise<AdapterResult<AddressResult[]>>;
};

function mockSearch(q: string): AddressResult[] {
  const query = q.trim();
  if (query.length < 2) return [];
  return [
    {
      id: "mock-tallinn-1",
      label: `Tallinn, ${query} (demo)`,
      countryCode: "EE",
      coordinates: { lat: 59.437, lng: 24.7536 },
      provider: "mock",
    },
    {
      id: "mock-tartu-1",
      label: `Tartu, ${query} (demo)`,
      countryCode: "EE",
      coordinates: { lat: 58.378, lng: 26.729 },
      provider: "mock",
    },
  ];
}

export function createAddressAdapter(env: ApiEnv): AddressAdapter {
  return {
    async search(query) {
      if (env.ADDRESS_API_PROVIDER === "mock" || env.ENERGIAPILOOT_API_MODE === "mock") {
        return { ok: true, data: mockSearch(query) };
      }
      if (!env.ADDRESS_API_BASE_URL) {
        return {
          ok: false,
          error: new ApiError("ADDRESS_API_BASE_URL puudub", { code: "CONFIG" }),
        };
      }
      return {
        ok: false,
        error: new ApiError(
          "Maa-amet / In-ADS live adapter: lisa WFS/REST parser ja normaliseerimine.",
          { code: "UPSTREAM" }
        ),
      };
    },
  };
}
