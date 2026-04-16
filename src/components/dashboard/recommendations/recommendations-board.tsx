"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { PaywallCard } from "@/components/billing/paywall-card";
import { getMyEntitlementsAction } from "@/app/(app)/billing/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import type { DecisionEngineOutput, ProductRecommendation } from "@/lib/domain/recommendations/types";
import type { Entitlements } from "@/lib/billing/plans";

function fmtEur(n: number) {
  if (n <= 0.01) return "—";
  return `${n.toFixed(2)} € / kuu`;
}

function confBadge(c: ProductRecommendation["confidence"]) {
  if (c === "kõrge") return { label: "Kõrge", variant: "green" as const };
  if (c === "madal") return { label: "Madal", variant: "warm" as const };
  return { label: "Keskmine", variant: "neutral" as const };
}

function categoryEt(c: ProductRecommendation["category"]) {
  const m: Record<ProductRecommendation["category"], string> = {
    contract: "Leping",
    behavior: "Käitumine",
    investigation: "Uurimine",
    automation: "Automaatika",
    solar: "Päike",
    battery: "Aku",
    ev: "EV",
    heating: "Küte",
    monitoring: "Jälgimine",
  };
  return m[c];
}

function investmentVerdictEt(v: "do_now" | "evaluate_further" | "wait") {
  if (v === "do_now") return "Tugev signaal";
  if (v === "wait") return "Nõrk signaal";
  return "Hinda edasi";
}

const ADVANCED_CATEGORIES = new Set<ProductRecommendation["category"]>(["solar", "battery", "heating"]);

export function RecommendationsBoard({ decision }: { decision: DecisionEngineOutput }) {
  const [ent, setEnt] = useState<Entitlements | null>(null);

  useEffect(() => {
    getMyEntitlementsAction().then(setEnt);
  }, []);

  const visible = useMemo(() => {
    const recs = decision.recommendations;
    if (!ent) return recs;
    if (ent.advancedRecommendations) return recs;
    return recs.filter((r) => !ADVANCED_CATEGORIES.has(r.category)).slice(0, 8);
  }, [ent, decision.recommendations]);

  return (
    <div className="grid gap-6">
      {ent && !ent.advancedRecommendations ? (
        <PaywallCard
          title="Investeeringute detailsoovitused on lukus"
          description="Tasuta paketis kuvame põhisoovitusi: leping, käitumine ja andmete jälgimine. Plus ja Pro paketiga avanevad ka päikese, aku ja kütte prioriteedid."
          requiredPlan="plus"
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-12">
        <Panel className="md:col-span-7">
          <PanelHeader>
            <div>
              <PanelTitle>Soovituste kooste</PanelTitle>
              <PanelDescription>
                Järjestus sõltub mõjust, andmete kindlusest ja reeglistikust. Pärast stsenaariumi salvestamist
                värskenda lehte, et näha uut järjekorda.
              </PanelDescription>
            </div>
            <Badge variant="neutral">Reeglid + profiil</Badge>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniKpi label="Soovitusi" value={`${decision.recommendations.length}`} />
              <MiniKpi label="Andmekvaliteet" value={`${decision.dataQuality.completeness0to100}/100`} />
              <MiniKpi
                label="Tugevaim sääst"
                value={
                  decision.strongestSavings
                    ? `${decision.strongestSavings.eurPerMonth.toFixed(0)} €`
                    : "—"
                }
              />
            </div>
            <p className="mt-4 text-sm text-foreground/65">{decision.dataQuality.summaryEt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href="/dashboard/contracts">
                <Button variant="outline">Leping</Button>
              </Link>
              <Link href="/dashboard/consumption">
                <Button variant="outline">Tarbimine</Button>
              </Link>
              <Link href="/dashboard/simulations">
                <Button variant="gradient">Simulatsioonid</Button>
              </Link>
            </div>
          </div>
        </Panel>

        <Panel className="md:col-span-5">
          <PanelHeader>
            <div>
              <PanelTitle>Investeeringute hinnang</PanelTitle>
              <PanelDescription>Salvestatud stsenaariumid: sobivus, valmidus ja soovituslik samm.</PanelDescription>
            </div>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="space-y-2">
              {decision.investments.length ? (
                decision.investments.slice(0, 5).map((i) => (
                  <div
                    key={`${i.type}-${i.name}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{i.name}</p>
                      <p className="line-clamp-2 text-[11px] text-foreground/55">{i.summaryEt}</p>
                    </div>
                    <Badge
                      variant={i.verdict === "wait" ? "warm" : i.verdict === "do_now" ? "green" : "neutral"}
                    >
                      {investmentVerdictEt(i.verdict)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-foreground/60">Pole salvestatud stsenaariume.</p>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((r) => (
          <RecommendationCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ r }: { r: ProductRecommendation }) {
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
            <PanelTitle>
              <span className="mr-2 font-mono text-xs text-foreground/45">#{r.rank}</span>
              {r.title}
            </PanelTitle>
            <PanelDescription>{r.summary}</PanelDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="cyan">{categoryEt(r.category)}</Badge>
            <Badge variant={c.variant}>{c.label}</Badge>
          </div>
        </PanelHeader>
        <div className="px-6 pb-6">
          <p className="text-sm text-foreground/70">{r.explanation}</p>
          <p className="mt-3 text-sm font-medium text-foreground/85">{r.whyItMatters}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniKpi label="Hinnanguline mõju" value={fmtEur(r.estimatedImpactEurPerMonth)} />
            <MiniKpi label="Pingutus" value={r.effort} />
            <MiniKpi label="Ajakava" value={r.timeHorizonEt} />
          </div>

          <div className="mt-4 rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs font-medium tracking-wide text-foreground/60">{r.nextStepLabel}</p>
            {r.whyNowVsLaterEt ? (
              <p className="mt-2 text-sm text-foreground/70">{r.whyNowVsLaterEt}</p>
            ) : null}
            {r.confidenceNote ? (
              <p className="mt-2 text-xs text-foreground/55">{r.confidenceNote}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {r.nextStepHref ? (
                <Link href={r.nextStepHref}>
                  <Button variant="gradient">Ava</Button>
                </Link>
              ) : null}
              <Button
                variant="outline"
                               onClick={() =>
                  alert("Soovituste salvestamine tuleb järgmises versioonis — hetkel saad neid töölaual jälgida.")
                }
              >
                Salvesta
              </Button>
            </div>
          </div>

          {r.signals.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {r.signals.slice(0, 6).map((e) => (
                <div
                  key={e.label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2"
                >
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
