import { redirect } from "next/navigation";

import { listScenariosAction } from "@/app/(app)/dashboard/simulations/actions";
import { ChartCard } from "@/components/charts/chart-card";
import { ConsumptionInsightsModule } from "@/components/dashboard/consumption/consumption-insights";
import {
  ContractComparison,
  DecisionConfidenceStrip,
  EnergyAssetsSummary,
  KpiCard,
  LatestSimulations,
  ProductRecommendationCards,
  SavingsOpportunities,
  UpcomingInsights,
} from "@/components/dashboard/overview/overview-blocks";
import { MiniCostTrend, MiniKwhBars } from "@/components/dashboard/overview/overview-charts";
import { getDecisionEngineOutputForUser } from "@/lib/server/services/decision-engine-service";
import { getDashboardOverviewData } from "@/lib/server/services/dashboard-overview-service";
import { getMyProfile } from "@/lib/supabase/profile";
import { getOrCreateMyPrimarySite } from "@/lib/supabase/site";

export default async function DashboardHomePage() {
  const { user, profile } = await getMyProfile();
  if (!user) redirect("/");

  const site = await getOrCreateMyPrimarySite();
  const bundle = await getDashboardOverviewData({
    userId: user.id,
    profile,
    site,
  });
  const { overview: data, meta } = bundle;

  const scenarios = await listScenariosAction();
  const decision = await getDecisionEngineOutputForUser({
    userId: user.id,
    profile,
    site,
    scenarios,
    overviewBundle: bundle,
  });

  return (
    <div className="grid gap-8">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground/60">Ülevaade</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
            Hetkeseis ja järgmised parimad sammud.
          </h1>
          <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
            Ühendame turuvihjed, tarbimise eeldused, lepingu mudeli ja sinu salvestatud stsenaariumid üheks
            prioriseeritud soovituste nimekirjaks — koos selgituste ja mõjuhinnangutega.
          </p>
          {meta.marketNote || meta.consumptionNote ? (
            <p className="mt-3 max-w-3xl text-pretty text-xs leading-relaxed text-foreground/55">
              {meta.marketNote ? <span>{meta.marketNote} </span> : null}
              {meta.consumptionNote ? <span>{meta.consumptionNote}</span> : null}
            </p>
          ) : null}
        </div>
      </div>

      <DecisionConfidenceStrip decision={decision} />

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-12">
        <KpiCard
          className="md:col-span-3"
          label="Hinnanguline kuukulu"
          value={`${data.kpis.estMonthlyCost.eur.toFixed(2)} €`}
          hint={`~${data.kpis.estMonthlyKwh} kWh • ${data.kpis.estAvgPriceEurPerKwh.toFixed(3)} €/kWh`}
          trend="Selles kuus"
          variant="cyan"
        />
        <KpiCard
          className="md:col-span-3"
          label="Säästu potentsiaal"
          value={`${data.kpis.estMonthlySavingsPotential.eur.toFixed(2)} €`}
          hint="Turuhinna vahest + lepingu/STS eeldused."
          trend="Võimalik"
          variant="green"
        />
        <KpiCard
          className="md:col-span-3"
          label="Lepingu risk"
          value={data.contract.riskLabel}
          hint={`${data.contract.provider} • ${data.contract.type === "spot" ? "börs" : data.contract.type === "fixed" ? "fikseeritud" : "hübriid"}`}
          trend="Risk"
          variant="warm"
        />
        <KpiCard
          className="md:col-span-3"
          label="Aktiivseid soovitusi"
          value={`${decision.recommendations.length}`}
          hint="Järjestatud mõju ja kindluse järgi."
          trend="Täna"
          variant="neutral"
        />
      </div>

      {/* Charts + contract */}
      <div className="grid gap-4 md:grid-cols-12">
        <ChartCard
          title="Kuukulu trend (7 päeva)"
          description="Päevane kulu — kooskõlas tarbimise ja keskmise all-in hinnaga."
          className="md:col-span-6"
        >
          <MiniCostTrend data={data.charts.dailyCost} />
        </ChartCard>
        <ChartCard
          title="Tarbimine (7 päeva)"
          description="kWh päevas (Estfeed/mock seeria)."
          className="md:col-span-6"
        >
          <MiniKwhBars data={data.charts.dailyKwh} />
        </ChartCard>

        <div className="md:col-span-7">
          <ContractComparison contract={data.contract} estMonthlyKwh={data.kpis.estMonthlyKwh} />
        </div>
        <div className="md:col-span-5">
          <SavingsOpportunities items={data.savings} />
        </div>
      </div>

      {/* Rec cards + simulations */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <ProductRecommendationCards items={decision.recommendations} />
        </div>
        <div className="md:col-span-5">
          <LatestSimulations items={data.latestSimulations} />
        </div>
      </div>

      {/* Assets + upcoming insights */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <EnergyAssetsSummary assets={data.assets} />
        </div>
        <div className="md:col-span-7">
          <UpcomingInsights items={data.upcoming} />
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground/60">Tarbimise ülevaade</p>
          <p className="mt-2 max-w-3xl text-sm text-foreground/65">
            Allpool saad profiili täpsustada. Väärtused tulevad samast kontekstist, mida kasutavad ülevaade ja
            soovitused.
          </p>
        </div>
        <ConsumptionInsightsModule
          serverBootstrap={{
            monthlyKwh: data.kpis.estMonthlyKwh,
            avgAllIn: data.kpis.estAvgPriceEurPerKwh,
            footnote: `${meta.consumptionNote ?? ""} ${decision.consumption.framingNoteEt}`.trim(),
          }}
        />
      </div>
    </div>
  );
}
