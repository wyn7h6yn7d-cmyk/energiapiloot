import { ChartCard } from "@/components/charts/chart-card";
import { ConsumptionInsightsModule } from "@/components/dashboard/consumption/consumption-insights";
import {
  ContractComparison,
  EnergyAssetsSummary,
  KpiCard,
  LatestSimulations,
  RecommendationCards,
  SavingsOpportunities,
  UpcomingInsights,
} from "@/components/dashboard/overview/overview-blocks";
import { MiniCostTrend, MiniKwhBars } from "@/components/dashboard/overview/overview-charts";
import { buildOverviewMock } from "@/lib/dashboard/overview-mock";

export default function DashboardHomePage() {
  const data = buildOverviewMock();

  return (
    <div className="grid gap-8">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground/60">Ülevaade</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
            Hetkeseis ja järgmised parimad sammud.
          </h1>
          <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
            See vaade ühendab kuluhinnangu, lepingu kokkuvõtte, säästu võimalused ja
            soovitused. Andmed on praegu realistlik mock, et UI oleks kohe valmis.
          </p>
        </div>
      </div>

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
          hint="Summa 3 parimast võimalusest (mock)."
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
          label="Soovitusi"
          value={`${data.recommendations.length}`}
          hint="Top prioriteedid on esile tõstetud."
          trend="Täna"
          variant="neutral"
        />
      </div>

      {/* Charts + contract */}
      <div className="grid gap-4 md:grid-cols-12">
        <ChartCard
          title="Kuukulu trend (7 päeva)"
          description="Päevane kulu (mock) — annab kiiresti suuna."
          className="md:col-span-6"
        >
          <MiniCostTrend data={data.charts.dailyCost} />
        </ChartCard>
        <ChartCard
          title="Tarbimine (7 päeva)"
          description="kWh päevas (mock) — baasjoon enne optimeerimist."
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
          <RecommendationCards items={data.recommendations} />
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
          <p className="text-xs font-medium tracking-wide text-foreground/60">
            Tarbimise insight
          </p>
          <p className="mt-2 max-w-3xl text-sm text-foreground/65">
            Kui sul pole veel mõõteandmeid, saad siiski eeldustega tuvastada
            peamised kulu draiverid ja kiire säästu kohad.
          </p>
        </div>
        <ConsumptionInsightsModule />
      </div>
    </div>
  );
}

