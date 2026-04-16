import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import { fetchJson } from "@/lib/api/utils/http";
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
      const q = query.trim();
      if (q.length < 2) return { ok: true, data: [] };

      if (env.ENERGIAPILOOT_API_MODE === "mock" || env.ADDRESS_API_PROVIDER === "mock") {
        return { ok: true, data: mockSearch(q) };
      }

      const base = (env.ADDRESS_API_BASE_URL || "https://inaadress.maaamet.ee/inaadress").replace(/\/+$/, "");

      // In-ADS Gazetteer JSON: /gazetteer?address=...
      const url = `${base}/gazetteer?address=${encodeURIComponent(q)}`;

      try {
        const payload = await fetchJson<{ addresses?: any[] }>(url);
        const rows = Array.isArray(payload?.addresses) ? payload.addresses : [];

        const data: AddressResult[] = rows
          .slice(0, 12)
          .map((r) => {
            const label =
              typeof r?.pikkaadress === "string"
                ? r.pikkaadress
                : typeof r?.taisaadress === "string"
                  ? r.taisaadress
                  : typeof r?.aadresstekst === "string"
                    ? r.aadresstekst
                    : q;

            const id =
              typeof r?.ads_oid === "string"
                ? r.ads_oid
                : typeof r?.adr_id === "string"
                  ? r.adr_id
                  : typeof r?.tunnus === "string"
                    ? r.tunnus
                    : label;

            const lat = Number(r?.viitepunkt_b);
            const lng = Number(r?.viitepunkt_l);
            const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

            return {
              id: `inads:${id}`,
              label,
              countryCode: "EE",
              coordinates: hasCoords ? { lat, lng } : undefined,
              sourceRef: typeof r?.ads_oid === "string" ? r.ads_oid : undefined,
              provider: env.ADDRESS_API_PROVIDER === "maaamet" ? "maaamet" : "inads",
            } satisfies AddressResult;
          })
          .filter((x) => typeof x.label === "string" && x.label.length > 0);

        return { ok: true, data };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof ApiError ? e : new ApiError("Aadressiotsing ebaõnnestus", { code: "UPSTREAM" }),
        };
      }
    },
  };
}
