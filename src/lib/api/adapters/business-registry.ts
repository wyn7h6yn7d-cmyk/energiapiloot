import type { AdapterResult } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ApiEnv } from "@/lib/api/env";
import { fetchJson } from "@/lib/api/utils/http";
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
      const q = query.trim();
      if (q.length < 2) return { ok: true, data: [] };

      if (env.ENERGIAPILOOT_API_MODE === "mock" || env.BUSINESS_REGISTRY_PROVIDER === "mock") {
        return { ok: true, data: mockLookup(q) };
      }

      // Public autocomplete service (no contract required):
      // https://ariregister.rik.ee/est/api/autocomplete?q=nimi
      const base = (env.BUSINESS_REGISTRY_BASE_URL || "https://ariregister.rik.ee").replace(/\/+$/, "");
      const url = `${base}/est/api/autocomplete?q=${encodeURIComponent(q)}`;

      try {
        const payload = await fetchJson<{
          status?: string;
          data?: Array<{
            reg_code?: number | string;
            name?: string;
            legal_address?: string;
            status?: string;
            url?: string;
          }>;
        }>(url);

        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const data: CompanyLookupResult[] = rows.slice(0, 10).map((r) => ({
          registryCode: r?.reg_code ? String(r.reg_code) : "",
          name: typeof r?.name === "string" ? r.name : "",
          legalAddress: typeof r?.legal_address === "string" ? r.legal_address : "",
          status: r?.status === "R" ? "active" : "unknown",
          provider: "rik",
        }));

        return { ok: true, data: data.filter((x) => x.registryCode && x.name) };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof ApiError ? e : new ApiError("Äriregistri päring ebaõnnestus", { code: "UPSTREAM" }),
        };
      }
    },
  };
}
