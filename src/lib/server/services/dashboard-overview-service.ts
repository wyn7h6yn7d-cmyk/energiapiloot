import { getAdapters } from "@/lib/api/adapters/registry";
import type { DataSourceMeta, TimeseriesPoint } from "@/lib/domain/models";
import type { OverviewMock } from "@/lib/dashboard/overview-mock";
import { buildOverviewMock } from "@/lib/dashboard/overview-mock";
import type { Profile } from "@/lib/supabase/profile";
import type { SiteRow } from "@/lib/supabase/site";

import {
  mapProfileContractToOverviewType,
  profileAssetsToOverviewFlags,
} from "@/lib/server/repositories/user-energy-context";
import { getCachedUserConsumptionSeries } from "@/lib/server/services/estfeed-series-service";
import { getCachedDayAheadPrices, summarizeMarketPrices } from "@/lib/server/services/nord-pool-service";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function eur(n: number) {
  return { eur: round2(n) };
}

function aggregateDailyFromHourlyKwh(points: TimeseriesPoint[]): { day: string; kwh: number }[] {
  const byDay = new Map<string, number>();
  for (const p of points) {
    const day = p.ts.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + p.value);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([iso, kwh]) => ({
      day: new Date(`${iso}T12:00:00`)
        .toLocaleDateString("et-EE", { weekday: "short" })
        .slice(0, 1)
        .toUpperCase(),
      kwh: round2(kwh),
    }));
}

function estMonthlyKwhFromConsumption(points: TimeseriesPoint[], windowDays: number) {
  const total = points.reduce((a, p) => a + p.value, 0);
  if (!windowDays) return 420;
  return Math.round((total / windowDays) * 30);
}

function volatilityRiskLabel(stats: ReturnType<typeof summarizeMarketPrices>): "madal" | "keskmine" | "kõrge" {
  const spread = stats.maxEurPerMwh - stats.minEurPerMwh;
  const rel = stats.avgEurPerMwh > 0 ? spread / stats.avgEurPerMwh : 0;
  if (rel < 0.35) return "madal";
  if (rel < 0.65) return "keskmine";
  return "kõrge";
}

export type DashboardOverviewBundle = {
  overview: OverviewMock;
  meta: {
    sources: DataSourceMeta[];
    marketNote?: string;
    consumptionNote?: string;
    /** Signals for decision engine (no extra fetches) */
    engineSignals: {
      consumptionSeriesSource: "estfeed" | "mock" | "manual";
      hasMeteredConsumption: boolean;
      spotVolatility01: number;
    };
  };
};

export async function getDashboardOverviewData(input: {
  userId: string;
  profile: Profile | null;
  site: SiteRow;
}): Promise<DashboardOverviewBundle> {
  const sources: DataSourceMeta[] = [];
  const base = buildOverviewMock();
  const { estfeed, env } = getAdapters();

  const contractType = mapProfileContractToOverviewType(input.profile?.contract_type ?? null);
  const assets = profileAssetsToOverviewFlags(input.profile);

  let marketNote: string | undefined;
  let consumptionNote: string | undefined;

  const { series: prices, meta: priceMeta } = await getCachedDayAheadPrices({ days: 7 });
  sources.push({
    provider: "nord_pool",
    mode: prices.source === "mock" ? "mock" : "live",
    fetchedAt: new Date().toISOString(),
  });

  const stats = summarizeMarketPrices(prices);
  const spotEnergyEurPerKwh = stats.avgEurPerMwh / 1000;
  marketNote =
    prices.source === "mock"
      ? "Turuhinnad: demo (mock). Seadista ENERGIAPILOOT_API_MODE=live + Nord Pool parser."
      : `Turuhinnad: päev-ahead keskmine ~${round2(stats.avgEurPerMwh)} €/MWh (${priceMeta.cacheKey}).`;

  let consumption = await getCachedUserConsumptionSeries({
    userId: input.userId,
    siteId: input.site.id,
    days: 7,
    resolution: "pt60m",
  });
  sources.push({
    provider: "estfeed",
    mode: consumption.source === "mock" ? "mock" : "live",
    fetchedAt: new Date().toISOString(),
  });
  consumptionNote =
    consumption.source === "mock"
      ? "Tarbimine: demo (mock). Ühendus Estfeed/Datahub tuleb OAuth-iga."
      : "Tarbimine: andmejaamast (normaliseeritud).";

  const status = await estfeed.getConnectionStatus(input.userId);
  if (input.profile?.data_connection === "estfeed_pending" && status.ok && status.data.state === "disconnected") {
    consumptionNote = `${consumptionNote ?? ""} Kasutaja märkis Estfeed ühenduse soovi — OAuth veel vajalik.`.trim();
  }

  const windowDays = 7;
  const estMonthlyKwh = estMonthlyKwhFromConsumption(consumption.points, windowDays);
  const dailyKwh = aggregateDailyFromHourlyKwh(consumption.points);
  const dailyKwhSafe = dailyKwh.length ? dailyKwh : base.charts.dailyKwh;

  const contract = {
    ...base.contract,
    type: contractType,
    provider: input.profile?.object_name?.trim() || base.contract.provider,
    energyPriceEurPerKwh:
      contractType === "spot" ? round2(Math.max(0.04, spotEnergyEurPerKwh)) : base.contract.energyPriceEurPerKwh,
    riskLabel: volatilityRiskLabel(stats),
  };

  const avgAllIn =
    (contract.energyPriceEurPerKwh + contract.networkFeeEurPerKwh) * (1 + contract.vatRate);
  const weeklyKwh = dailyKwhSafe.reduce((a, d) => a + d.kwh, 0);
  const estMonthlyKwhFinal = estMonthlyKwh > 0 ? estMonthlyKwh : Math.round(weeklyKwh * (365 / 7 / 12));
  const estMonthlyCost = contract.baseFeeEurPerMonth + estMonthlyKwhFinal * avgAllIn;

  const priceTrend =
    stats.previousDayAvgEurPerMwh > 0
      ? (stats.latestEurPerMwh - stats.previousDayAvgEurPerMwh) / stats.previousDayAvgEurPerMwh
      : 0;
  const dailyCost = dailyKwhSafe.map(({ day, kwh }, i) => {
    const swing = 1 + Math.sin(i / 1.2) * 0.05 + priceTrend * 0.08;
    return { day, eur: round2(kwh * avgAllIn * swing) };
  });

  const spreadEurMwh = stats.maxEurPerMwh - stats.minEurPerMwh;
  const spotVolatility01 =
    stats.avgEurPerMwh > 0
      ? Math.min(1, Math.max(0, spreadEurMwh / (2 * stats.avgEurPerMwh)))
      : 0.35;
  const savings = [
    {
      id: "s_market",
      label: "Ajasta tarbimist (hinnavahe)",
      estMonthly: eur(Math.max(4, (spreadEurMwh / 1000) * estMonthlyKwhFinal * 0.08)),
      confidence: "keskmine" as const,
    },
    {
      id: "s_contract",
      label: "Lepingu optimeerimine (spot vs fikseeritud)",
      estMonthly: eur(Math.max(6, estMonthlyCost * 0.03)),
      confidence: "madal" as const,
    },
    {
      id: "s_solar",
      label: "Päikese stsenaarium (PVGIS)",
      estMonthly: eur(Math.max(8, estMonthlyKwhFinal * avgAllIn * 0.06)),
      confidence: "madal" as const,
    },
  ];

  const conn = await estfeed.listMeteringPoints(input.userId);
  const upcoming = [
    {
      id: "u_price",
      title: "Turuhinna trend (7 päeva)",
      etaLabel: "Uuendatud",
      description: `Keskmine ~${round2(stats.avgEurPerMwh)} €/MWh • vahemik ${round2(stats.minEurPerMwh)}–${round2(
        stats.maxEurPerMwh
      )} €/MWh.`,
    },
    {
      id: "u_mp",
      title: "Mõõtepunktid",
      etaLabel: conn.ok ? `${conn.data.length} tk` : "—",
      description: conn.ok
        ? conn.data.map((m) => m.label).join(", ")
        : "Ühenduse kontroll ebaõnnestus (kasutame fallback’i).",
    },
  ];

  const { data: scenarios } = await (async () => {
    try {
      const { createSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = await createSupabaseServerClient();
      return await supabase
        .from("saved_scenarios")
        .select("id,name,simulation_type,updated_at,config")
        .eq("site_id", input.site.id)
        .order("updated_at", { ascending: false })
        .limit(2);
    } catch {
      return { data: null as null };
    }
  })();

  const latestSimulations =
    scenarios?.map((s: { id: string; name: string; simulation_type: string; updated_at: string }) => ({
      id: s.id,
      title: `${s.name} • ${s.simulation_type}`,
      createdAtLabel: new Date(s.updated_at).toLocaleString("et-EE"),
      resultLabel: "Vaata simulatsioonides",
      estMonthlyImpact: eur(0),
    })) ?? base.latestSimulations;

  const energyEur = estMonthlyKwhFinal * contract.energyPriceEurPerKwh;
  const networkEur = estMonthlyKwhFinal * contract.networkFeeEurPerKwh;
  const vatEur = (energyEur + networkEur) * contract.vatRate;

  void env;

  return {
    overview: {
      kpis: {
        estMonthlyCost: eur(estMonthlyCost),
        estMonthlyKwh: estMonthlyKwhFinal,
        estAvgPriceEurPerKwh: round2(avgAllIn),
        estMonthlySavingsPotential: eur(savings.reduce((a, s) => a + s.estMonthly.eur, 0)),
      },
      contract,
      savings,
      recommendations: base.recommendations,
      latestSimulations,
      assets,
      upcoming,
      charts: {
        dailyCost,
        dailyKwh: dailyKwhSafe,
        priceBreakdown: [
          { name: "Energia", value: round2(energyEur) },
          { name: "Võrk", value: round2(networkEur) },
          { name: "KM", value: round2(vatEur) },
          { name: "Kuutasu", value: round2(contract.baseFeeEurPerMonth) },
        ],
      },
    },
    meta: {
      sources,
      marketNote,
      consumptionNote,
      engineSignals: {
        consumptionSeriesSource: consumption.source,
        hasMeteredConsumption: consumption.source !== "mock",
        spotVolatility01,
      },
    },
  };
}
