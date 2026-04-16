"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { buildConsumptionInsights } from "@/lib/consumption/insights";
import { analyzeContracts } from "@/lib/contracts/model";
import { buildOverviewMock } from "@/lib/dashboard/overview-mock";
import { generateRecommendations } from "@/lib/recommendations/engine";
import type { Recommendation, RecommendationContext } from "@/lib/recommendations/types";
import { listScenariosAction } from "@/app/(app)/dashboard/simulations/actions";
import { SIM_DEFINITIONS } from "@/lib/simulations/definitions";
import { getMyEntitlementsAction } from "@/app/(app)/billing/actions";
import type { Entitlements } from "@/lib/billing/plans";
import { PaywallCard } from "@/components/billing/paywall-card";

function fmtEur(n: number) {
  if (n <= 0.01) return "—";
  return `${n.toFixed(2)} € / kuu`;
}

function confBadge(c: Recommendation["confidence"]) {
  if (c === "kõrge") return { label: "Kõrge", variant: "green" as const };
  if (c === "madal") return { label: "Madal", variant: "warm" as const };
  return { label: "Keskmine", variant: "neutral" as const };
}

function kindLabel(k: Recommendation["kind"]) {
  switch (k) {
    case "contract_switch":
      return "Leping";
    case "load_shift":
      return "Ajastus";
    case "base_load_investigate":
      return "Baas";
    case "investment_delay":
      return "Investeering";
    case "investment_prioritize":
      return "Prioriteet";
    case "heat_pump_evaluate":
      return "Soojuspump";
    case "ev_schedule":
      return "EV";
    default:
      return "Soovitus";
  }
}

function nextStepHref(k: Recommendation["kind"]) {
  switch (k) {
    case "contract_switch":
      return "/dashboard/contracts";
    case "investment_prioritize":
    case "investment_delay":
    case "heat_pump_evaluate":
      return "/dashboard/simulations";
    case "base_load_investigate":
    case "load_shift":
    case "ev_schedule":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

export function RecommendationsBoard() {
  const [scenarios, setScenarios] = useState<
    { type: any; name: string; monthlySavingsEur: number; paybackYears: number | null }[]
  >([]);
  const [ent, setEnt] = useState<Entitlements | null>(null);

  useEffect(() => {
    getMyEntitlementsAction().then(setEnt);
    listScenariosAction().then((saved) => {
      setScenarios(
        saved.map((s) => ({
          type: s.simulation_type,
          name: s.name,
          monthlySavingsEur:
            SIM_DEFINITIONS[s.simulation_type].calculate((s.config ?? {}) as any).monthlySavingsEur,
          paybackYears:
            SIM_DEFINITIONS[s.simulation_type].calculate((s.config ?? {}) as any).paybackYears,
        }))
      );
    });
  }, []);

  const ctx: RecommendationContext = useMemo(() => {
    // MVP: build a coherent context from our existing mock data + default insights assumptions.
    const overview = buildOverviewMock();

    const usage = buildConsumptionInsights({
      monthlyKwh: overview.kpis.estMonthlyKwh,
      avgAllInEurPerKwh: overview.kpis.estAvgPriceEurPerKwh,
      dayShare: 0.58,
      weekendShare: 0.26,
      baseLoadW: 220,
      devices: {
        ev: true,
        boiler: true,
        heat_pump: false,
        cooling: false,
        commercial_refrigeration: false,
        machinery: false,
      },
      peakHourDependency: 0.55,
    });

    const contractAnalysis = analyzeContracts({
      monthlyKwh: overview.kpis.estMonthlyKwh,
      pattern: { peakShare: 0.38, peakPriceMultiplier: 1.28 },
      current: {
        providerName: overview.contract.provider,
        type: overview.contract.type,
        baseFeeEurPerMonth: overview.contract.baseFeeEurPerMonth,
        energyPriceEurPerKwh: overview.contract.energyPriceEurPerKwh,
        networkFeeEurPerKwh: overview.contract.networkFeeEurPerKwh,
        vatRate: overview.contract.vatRate,
      },
      assumptions: { spotVolatility: 0.55, hybridSpotShare: 0.55 },
    });

    return {
      profile: { userType: "household" },
      contract: {
        type: contractAnalysis.current.type,
        riskScore: contractAnalysis.current.riskScore,
        bestFit: contractAnalysis.recommendation.bestFit,
        estMonthlyCostEur: contractAnalysis.current.estMonthlyCostEur,
      },
      usage: {
        estMonthlyCostEur: usage.kpis.estMonthlyCostEur,
        baseLoadShare: usage.kpis.baseLoadShare,
        peakDependencyScore: usage.kpis.peakDependencyScore,
        opportunities: usage.opportunities.map((o) => ({
          title: o.title,
          estMonthlyEur: o.estMonthlyEur,
          confidence: o.confidence,
        })),
        devices: {
          ev: true,
          boiler: true,
          heatPump: false,
        },
      },
      simulations: {
        scenarios,
      },
    };
  }, [scenarios]);

  const recs = useMemo(() => generateRecommendations(ctx), [ctx]);
  const visible = useMemo(() => {
    if (!ent) return recs;
    if (ent.advancedRecommendations) return recs;
    // Free: hide investment-related recs; keep top practical ones.
    return recs.filter((r) => !["investment_delay", "investment_prioritize", "heat_pump_evaluate"].includes(r.kind)).slice(0, 4);
  }, [ent, recs]);

  return (
    <div className="grid gap-6">
      {ent && !ent.advancedRecommendations ? (
        <PaywallCard
          title="Täiustatud soovitused on lukus"
          description="Free paketis näitame ainult põhisoovitusi. Uuenda Plus/Pro peale, et saada investeeringu prioriteedid, “delay battery” ja detailsemad järgmised sammud."
          requiredPlan="plus"
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-12">
        <Panel className="md:col-span-7">
          <PanelHeader>
            <div>
              <PanelTitle>Soovituste mootor</PanelTitle>
              <PanelDescription>
                MVP: reeglitel põhinev. Iga soovitus sisaldab põhjendust ja hinnangulist mõju.
              </PanelDescription>
            </div>
            <Badge variant="neutral">Rules v1</Badge>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniKpi label="Soovitusi" value={`${recs.length}`} />
              <MiniKpi
                label="Top mõju"
                value={
                  recs[0]?.estimatedImpactEurPerMonth
                    ? `${recs[0].estimatedImpactEurPerMonth.toFixed(0)} € / kuu`
                    : "—"
                }
              />
              <MiniKpi
                label="Simulatsioone"
                value={`${ctx.simulations?.scenarios?.length ?? 0}`}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href="/dashboard/contracts">
                <Button variant="outline">Täpsusta lepingut</Button>
              </Link>
              <Link href="/dashboard/simulations">
                <Button variant="gradient">Käivita simulatsioon</Button>
              </Link>
            </div>
          </div>
        </Panel>

        <Panel className="md:col-span-5">
          <PanelHeader>
            <div>
              <PanelTitle>Kontekst (praegu mock)</PanelTitle>
              <PanelDescription>Hiljem Supabase tabelid: `contracts`, `sites`, `saved_scenarios`.</PanelDescription>
            </div>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="space-y-2">
              <Row label="Leping" value={ctx.contract?.type ?? "—"} />
              <Row label="Risk" value={ctx.contract?.riskScore ? `${ctx.contract.riskScore}/100` : "—"} />
              <Row label="Baas" value={ctx.usage?.baseLoadShare ? `${Math.round(ctx.usage.baseLoadShare * 100)}%` : "—"} />
              <Row label="Tipud" value={ctx.usage?.peakDependencyScore ? `${ctx.usage.peakDependencyScore}/100` : "—"} />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.slice(0, 8).map((r) => (
          <RecommendationCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ r }: { r: Recommendation }) {
  const c = confBadge(r.confidence);
  return (
    <Panel className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_260px_at_20%_0%,rgba(38,230,255,0.10),transparent_62%),radial-gradient(500px_240px_at_90%_40%,rgba(46,242,181,0.08),transparent_65%)]"
      />
      <div className="relative">
        <PanelHeader>
          <div>
            <PanelTitle>{r.title}</PanelTitle>
            <PanelDescription>{r.whyItMatters}</PanelDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="cyan">{kindLabel(r.kind)}</Badge>
            <Badge variant={c.variant}>{c.label}</Badge>
          </div>
        </PanelHeader>
        <div className="px-6 pb-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniKpi label="Hinnanguline mõju" value={fmtEur(r.estimatedImpactEurPerMonth)} />
            <MiniKpi label="Prioriteet" value={`${r.priorityScore}/100`} />
            <MiniKpi label="Järgmine samm" value="Vaata" />
          </div>

          <div className="mt-4 rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs font-medium tracking-wide text-foreground/60">Next step</p>
            <p className="mt-2 text-sm text-foreground/75">{r.nextStep}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href={nextStepHref(r.kind)}>
                <Button variant="gradient">Ava</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => alert("Salvestamine DB-sse lisandub koos Supabase `recommendations` tabeliga.")}
              >
                Salvesta
              </Button>
            </div>
          </div>

          {r.evidence.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {r.evidence.slice(0, 4).map((e) => (
                <div key={e.label} className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2">
                  <p className="text-xs text-foreground/60">{e.label}</p>
                  <p className="text-xs font-medium text-foreground/80">{e.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
      <p className="text-xs text-foreground/55">{label}</p>
      <p className="mt-2 font-mono text-base font-semibold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2">
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="text-xs font-medium text-foreground/80">{value}</p>
    </div>
  );
}

