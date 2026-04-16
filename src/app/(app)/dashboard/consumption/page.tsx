import { redirect } from "next/navigation";

import { listScenariosAction } from "@/app/(app)/dashboard/simulations/actions";
import { ConsumptionInsightsModule } from "@/components/dashboard/consumption/consumption-insights";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { getDecisionEngineOutputForUser } from "@/lib/server/services/decision-engine-service";
import { getDashboardOverviewData } from "@/lib/server/services/dashboard-overview-service";
import { getMyProfile } from "@/lib/supabase/profile";
import { getOrCreateMyPrimarySite } from "@/lib/supabase/site";

const baselineLabelEt: Record<string, string> = {
  low: "Madal baas",
  typical: "Tavaline",
  elevated: "Kõrgem kui tavaliselt",
  high_alert: "Vajab tähelepanu",
};

export default async function ConsumptionInsightsPage() {
  const { user, profile } = await getMyProfile();
  if (!user) redirect("/");

  const site = await getOrCreateMyPrimarySite();
  const bundle = await getDashboardOverviewData({ userId: user.id, profile, site });
  const scenarios = await listScenariosAction();
  const decision = await getDecisionEngineOutputForUser({
    userId: user.id,
    profile,
    site,
    scenarios,
    overviewBundle: bundle,
  });

  const { overview, meta } = bundle;
  const c = decision.consumption;

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-xs font-medium tracking-wide text-foreground/60">Tarbimine</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
          Muster, riskid ja paindlikkus ühes vaates.
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Näed nii graafilist profiili kui soovituste mootori leide: baas-koormus, tipu-sõltuvus, paindlikkus
          ja otsekohene tekst ka siis, kui mõõdud puuduvad.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <Panel className="md:col-span-4">
          <PanelHeader>
            <div>
              <PanelTitle>Signaalid</PanelTitle>
              <PanelDescription>Mudeli järgi (mitte ainult graafik).</PanelDescription>
            </div>
          </PanelHeader>
          <div className="space-y-3 px-6 pb-6">
            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs text-foreground/55">Baas-koormus</p>
              <p className="mt-2 text-sm font-semibold">
                {baselineLabelEt[c.baselineClass] ?? c.baselineClass}
              </p>
              <p className="mt-1 text-xs text-foreground/55">
                {Math.round(c.profile.kpis.baseLoadShare * 100)}% kogu tarbimisest (hinnanguline baas)
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs text-foreground/55">Tipu-sõltuvus</p>
              <p className="mt-2 font-mono text-lg font-semibold">
                {c.profile.kpis.peakDependencyScore}/100
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs text-foreground/55">Paindlikkus</p>
              <p className="mt-2 font-mono text-lg font-semibold">
                {c.flexibilityScore.score0to100}/100
              </p>
              <p className="mt-1 text-xs text-foreground/55">{c.flexibilityScore.rationaleEt}</p>
            </div>
            <Badge variant="neutral">Andmed: {decision.dataQuality.completeness0to100}/100</Badge>
          </div>
        </Panel>

        <div className="md:col-span-8">
          <ConsumptionInsightsModule
            serverBootstrap={{
              monthlyKwh: overview.kpis.estMonthlyKwh,
              avgAllIn: overview.kpis.estAvgPriceEurPerKwh,
              footnote: `${meta.consumptionNote ?? ""} ${c.framingNoteEt}`.trim(),
            }}
          />
        </div>
      </div>
    </div>
  );
}
