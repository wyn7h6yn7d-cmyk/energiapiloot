"use client";

import { useEffect, useMemo, useState } from "react";

import { PremiumGate } from "@/components/product/premium-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { LinkButton } from "@/components/ui/link-button";
import { SIM_DEFINITIONS, listSimulators } from "@/lib/simulations/definitions";
import type { SimulationResult, SimulationType } from "@/lib/simulations/types";
import { CashflowChart, SensitivityChart } from "@/components/dashboard/simulations/simulation-charts";
import type { ScenarioDTO } from "@/app/(app)/dashboard/simulations/actions";
import { evaluateInvestmentScenario } from "@/lib/domain/investments/intelligence";
import type { SimulationInvestmentContext } from "@/lib/product/simulation-investment-context";
import {
  deleteScenarioAction,
  duplicateScenarioAction,
  listScenariosAction,
  renameScenarioAction,
  saveScenarioAction,
  toggleFavoriteScenarioAction,
} from "@/app/(app)/dashboard/simulations/actions";
import type { Entitlements } from "@/lib/billing/plans";
import { PaywallCard } from "@/components/billing/paywall-card";
import type { SolarIntegrationHints } from "@/lib/integrations/solar-hints";

function fmtEur(n: number) {
  const sign = n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)} €`;
}

function fmtYears(n: number | null) {
  if (n === null) return "—";
  if (n <= 0) return "0 a";
  return `${n.toFixed(1)} a`;
}

function typeLabel(t: SimulationType) {
  return t === "solar"
    ? "Päike"
    : t === "battery"
      ? "Aku"
      : t === "ev_charger"
        ? "EV laadija"
        : t === "heat_pump"
          ? "Soojuspump"
          : "Peak shaving";
}

function isNumberField(key: string, v: unknown) {
  return typeof v === "number" && Number.isFinite(v);
}

function verdictEt(v: "do_now" | "evaluate_further" | "wait") {
  if (v === "do_now") return "Tugev signaal";
  if (v === "wait") return "Nõrk signaal";
  return "Hinda edasi";
}

export function InvestmentSimulationsModule({
  initialScenarios,
  entitlements,
  solarHints,
  simulationContext,
  variant = "dashboard",
}: {
  initialScenarios: ScenarioDTO[];
  entitlements: Entitlements;
  solarHints?: SolarIntegrationHints | null;
  simulationContext: SimulationInvestmentContext;
  variant?: "dashboard" | "public";
}) {
  const sims = useMemo(() => listSimulators(), []);
  const [type, setType] = useState<SimulationType>("solar");

  const def = SIM_DEFINITIONS[type];
  const [name, setName] = useState<string>("Uus stsenaarium");
  const [inputs, setInputs] = useState<Record<string, unknown>>({ ...def.defaultInputs });

  const result: SimulationResult = useMemo(() => def.calculate(inputs as any), [def, inputs]);

  const domainEval = useMemo(
    () =>
      evaluateInvestmentScenario({
        type,
        name: name.trim() || typeLabel(type),
        monthlySavingsEur: result.monthlySavingsEur,
        annualSavingsEur: result.annualSavingsEur,
        paybackYears: result.paybackYears,
        config: inputs as Record<string, unknown>,
        context: {
          userType: simulationContext.userType,
          peakDependency0to100: simulationContext.peakDependency0to100,
          dayShare: simulationContext.dayShare,
          spotVolatility01: simulationContext.spotVolatility01,
          hasSolarAsset: simulationContext.hasSolarAsset,
          hasHeatPumpAsset: simulationContext.hasHeatPumpAsset,
          hasEvAsset: simulationContext.hasEvAsset,
          machinery: simulationContext.machinery,
          dataStrength: simulationContext.dataStrength,
          hasSiteCoords: simulationContext.hasSiteCoords,
        },
      }),
    [inputs, name, result.annualSavingsEur, result.monthlySavingsEur, result.paybackYears, simulationContext, type]
  );

  const [saved, setSaved] = useState<ScenarioDTO[]>(initialScenarios);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  useEffect(() => {
    setSaved(initialScenarios);
  }, [initialScenarios]);

  useEffect(() => {
    // reset defaults when switching type
    setInputs({ ...def.defaultInputs });
    setName(`${typeLabel(def.type)} • stsenaarium`);
  }, [def.type]);

  const compareList = useMemo(() => saved.filter((s) => compareIds.includes(s.id)), [compareIds, saved]);

  const allowedSims = useMemo(
    () => sims.filter((s) => entitlements.allowedSimulationTypes.includes(s.type)),
    [entitlements.allowedSimulationTypes, sims]
  );

  useEffect(() => {
    // If current type not allowed, switch to first allowed.
    if (!entitlements.allowedSimulationTypes.includes(type)) {
      const first = entitlements.allowedSimulationTypes[0] ?? "solar";
      setType(first);
    }
  }, [entitlements.allowedSimulationTypes, type]);

  const isPublic = variant === "public";

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground/60">Simulatsioonid</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
            {isPublic
              ? "Investeeringu labor: näe mõju enne allkirja."
              : "Investeeringu mõju, selgelt ja võrreldavalt."}
          </h1>
          <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
            {isPublic
              ? "Avalik režiim näitab kiiret ülevaadet ja KPI-sid. Täielik otsustuskiht, graafikud ja eksport tulevad premium avamisega (Stripe + PDF on struktuuris valmis)."
              : "Simulaatorid kasutavad selgeid, kontrollitavaid valemeid. Täpne tarbimine ja turuhinnad ühenduvad hiljem sama liidese alla — ilma töövoogu ümber tegemata."}
          </p>
        </div>
      </div>

      {!isPublic && solarHints ? (
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Päikese eelhinnang (PVGIS, server-only)</PanelTitle>
              <PanelDescription>
                Kiire kontekst sinu onboarding aadressi / vaikimisi Tallinna koordinaatide järgi. Ei käivita
                brauseris väliseid päringuid.
              </PanelDescription>
            </div>
            <Badge variant="cyan">{solarHints.source}</Badge>
          </PanelHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-foreground/75">
              ~<span className="font-mono font-semibold">{Math.round(solarHints.annualProductionKwh)}</span> kWh/a
              @ <span className="font-mono font-semibold">{solarHints.demoPeakPowerKwp}</span> kWp •{" "}
              <span className="font-mono text-foreground/70">
                {solarHints.lat.toFixed(3)}, {solarHints.lng.toFixed(3)}
              </span>
            </p>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-4">
          <PanelHeader>
            <div>
              <PanelTitle>Simulaator</PanelTitle>
              <PanelDescription>Vali tüüp ja seadista sisendid.</PanelDescription>
            </div>
            <Badge variant="neutral">Esialgne</Badge>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs font-medium tracking-wide text-foreground/60">Tüüp</label>
                <select
                  className="h-10 rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
                  value={type}
                  onChange={(e) => setType(e.target.value as SimulationType)}
                >
                  {allowedSims.map((s) => (
                    <option key={s.type} value={s.type}>
                      {s.title}
                    </option>
                  ))}
                </select>
                {allowedSims.length < sims.length ? (
                  <p className="text-xs text-foreground/55">
                    Mõned simulaatorid on sinu paketis lukus.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium tracking-wide text-foreground/60">Stsenaariumi nimi</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="mt-2 rounded-2xl border border-border/50 bg-card/25 p-4">
                <p className="text-xs font-medium tracking-wide text-foreground/60">Sisendid</p>
                <div className="mt-3 grid gap-3">
                  {Object.entries(inputs)
                    .filter(([k, v]) => isNumberField(k, v))
                    .map(([k, v]) => (
                      <div key={k} className="grid gap-1.5">
                        <label className="text-xs text-foreground/55">{k}</label>
                        <Input
                          inputMode="decimal"
                          value={String(v)}
                          onChange={(e) =>
                            setInputs((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {isPublic ? (
                  <>
                    <LinkButton href="/pricing#avamine" variant="gradient">
                      Ava salvestus ja võrdlus
                    </LinkButton>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInputs({ ...def.defaultInputs });
                      }}
                    >
                      Lähtesta
                    </Button>
                    <p className="w-full text-xs text-foreground/55">
                      Ilma premium avamiseta ei salvesta brauser su stsenaariume serverisse — see on teadlikult lihtne
                      ja privaatne avalik kogemus.
                    </p>
                  </>
                ) : (
                  <>
                    <Button
                      variant="gradient"
                      onClick={async () => {
                        try {
                          await saveScenarioAction({
                            simulation_type: type,
                            name: name.trim() || `${typeLabel(type)} • stsenaarium`,
                            config: inputs,
                          });
                          const next = await listScenariosAction();
                          setSaved(next);
                        } catch (e: any) {
                          alert(e?.message ?? "Salvestamine ebaõnnestus.");
                        }
                      }}
                    >
                      Salvesta stsenaarium
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInputs({ ...def.defaultInputs });
                      }}
                    >
                      Lähtesta
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-3 rounded-2xl border border-border/40 bg-card/20 p-4">
                <p className="text-xs font-medium tracking-wide text-foreground/60">Soovitus</p>
                <p className="mt-2 text-sm font-semibold">{result.summary.title}</p>
                <p className="mt-2 text-sm text-foreground/65">{result.summary.bestFit}</p>
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 lg:col-span-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Kpi label="Kuutine sääst" value={`${fmtEur(result.monthlySavingsEur)}`} hint="Hinnanguline." />
            <Kpi label="Aastane sääst" value={`${fmtEur(result.annualSavingsEur)}`} hint="12 × kuine sääst." />
            <Kpi label="Tasuvus" value={fmtYears(result.paybackYears)} hint="Upfront / aastane sääst." />
          </div>

          {isPublic ? (
            <PremiumGate
              className="min-h-[360px] rounded-3xl"
              title="Täielik investeeringu signaal"
              description="Ava premium, et näha domeenihinnangut, 15-aastast rahavoogu, tundlikkust ja täielikku eelduste lõiku. Allalaaditav raport tuleb samasse voogu."
            >
              <div className="grid gap-4">
                <Panel>
                  <PanelHeader>
                    <div>
                      <PanelTitle>Otsustustugi (domeenikiht)</PanelTitle>
                      <PanelDescription>
                        Strateegiline sobivus, valmidus ja eelduste tundlikkus — sõltub sinu profiilist ja mõõdulisusest, mitte ainult ühest numbrist.
                      </PanelDescription>
                    </div>
                    <Badge
                      variant={
                        domainEval.verdict === "wait" ? "warm" : domainEval.verdict === "do_now" ? "green" : "neutral"
                      }
                    >
                      {verdictEt(domainEval.verdict)}
                    </Badge>
                  </PanelHeader>
                  <div className="px-6 pb-6">
                    <p className="text-sm text-foreground/75">{domainEval.summaryEt}</p>
                    {domainEval.cautionEt ? (
                      <p className="mt-3 rounded-2xl border border-border/50 bg-card/25 p-3 text-sm text-foreground/70">
                        {domainEval.cautionEt}
                      </p>
                    ) : null}
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <MiniStat label="Strateegiline sobivus" value={`${domainEval.strategicFit.score0to100}/100`} />
                      <MiniStat label="Valmidus" value={`${domainEval.readiness.score0to100}/100`} />
                      <MiniStat
                        label="Eelduste tundlikkus"
                        value={`${domainEval.assumptionDependency.score0to100}/100`}
                      />
                    </div>
                    <p className="mt-4 text-xs text-foreground/55">
                      Kuusäästu vahemik (±): {fmtEur(domainEval.monthlySavingsLowHigh.low)} –{" "}
                      {fmtEur(domainEval.monthlySavingsLowHigh.high)}
                    </p>
                  </div>
                </Panel>

                <Panel className="overflow-hidden">
                  <PanelHeader>
                    <div>
                      <PanelTitle>Cash flow</PanelTitle>
                      <PanelDescription>Kumulatiivne sääst ajas (15 a).</PanelDescription>
                    </div>
                    <Badge variant="cyan">€</Badge>
                  </PanelHeader>
                  <div className="px-6 pb-6">
                    <CashflowChart data={result.cashflow} />
                  </div>
                </Panel>

                <div className="grid gap-4 md:grid-cols-2">
                  <Panel className="overflow-hidden">
                    <PanelHeader>
                      <div>
                        <PanelTitle>Sensitivity</PanelTitle>
                        <PanelDescription>Säästu kõikumine ±30% (näidis).</PanelDescription>
                      </div>
                    </PanelHeader>
                    <div className="px-6 pb-6">
                      <SensitivityChart data={result.sensitivity} />
                    </div>
                  </Panel>

                  <Panel>
                    <PanelHeader>
                      <div>
                        <PanelTitle>Eeldused</PanelTitle>
                        <PanelDescription>Mida see arvutus eeldab.</PanelDescription>
                      </div>
                    </PanelHeader>
                    <div className="px-6 pb-6">
                      <div className="space-y-2">
                        {result.assumptions.map((a) => (
                          <div key={a.label} className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2">
                            <p className="text-xs text-foreground/60">{a.label}</p>
                            <p className="text-xs font-medium text-foreground/80">{a.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-2xl border border-border/40 bg-card/20 p-4">
                        <p className="text-xs font-medium tracking-wide text-foreground/60">Selgitus</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                          {result.summary.bullets.map((b, idx) => (
                            <li key={idx}>• {b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Panel>
                </div>

              </div>
            </PremiumGate>
          ) : (
            <>
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Otsustustugi (domeenikiht)</PanelTitle>
                <PanelDescription>
                  Strateegiline sobivus, valmidus ja eelduste tundlikkus — sõltub sinu profiilist ja mõõdulisusest, mitte ainult ühest numbrist.
                </PanelDescription>
              </div>
              <Badge
                variant={
                  domainEval.verdict === "wait" ? "warm" : domainEval.verdict === "do_now" ? "green" : "neutral"
                }
              >
                {verdictEt(domainEval.verdict)}
              </Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              <p className="text-sm text-foreground/75">{domainEval.summaryEt}</p>
              {domainEval.cautionEt ? (
                <p className="mt-3 rounded-2xl border border-border/50 bg-card/25 p-3 text-sm text-foreground/70">
                  {domainEval.cautionEt}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Strateegiline sobivus" value={`${domainEval.strategicFit.score0to100}/100`} />
                <MiniStat label="Valmidus" value={`${domainEval.readiness.score0to100}/100`} />
                <MiniStat
                  label="Eelduste tundlikkus"
                  value={`${domainEval.assumptionDependency.score0to100}/100`}
                />
              </div>
              <p className="mt-4 text-xs text-foreground/55">
                Kuusäästu vahemik (±): {fmtEur(domainEval.monthlySavingsLowHigh.low)} –{" "}
                {fmtEur(domainEval.monthlySavingsLowHigh.high)}
              </p>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader>
              <div>
                <PanelTitle>Cash flow</PanelTitle>
                <PanelDescription>Kumulatiivne sääst ajas (15 a).</PanelDescription>
              </div>
              <Badge variant="cyan">€</Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              <CashflowChart data={result.cashflow} />
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel className="overflow-hidden">
              <PanelHeader>
                <div>
                  <PanelTitle>Sensitivity</PanelTitle>
                  <PanelDescription>Säästu kõikumine ±30% (näidis).</PanelDescription>
                </div>
              </PanelHeader>
              <div className="px-6 pb-6">
                <SensitivityChart data={result.sensitivity} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader>
                <div>
                  <PanelTitle>Eeldused</PanelTitle>
                  <PanelDescription>Mida see arvutus eeldab.</PanelDescription>
                </div>
              </PanelHeader>
              <div className="px-6 pb-6">
                <div className="space-y-2">
                  {result.assumptions.map((a) => (
                    <div key={a.label} className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2">
                      <p className="text-xs text-foreground/60">{a.label}</p>
                      <p className="text-xs font-medium text-foreground/80">{a.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-border/40 bg-card/20 p-4">
                  <p className="text-xs font-medium tracking-wide text-foreground/60">Selgitus</p>
                  <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                    {result.summary.bullets.map((b, idx) => (
                      <li key={idx}>• {b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          </div>

          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Salvestatud stsenaariumid</PanelTitle>
                <PanelDescription>See on päris töövoog: salvestus, lemmikud ja võrdlus.</PanelDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    listScenariosAction().then(setSaved);
                    setCompareIds([]);
                  }}
                >
                  Värskenda
                </Button>
              </div>
            </PanelHeader>
            <div className="px-6 pb-6">
              {entitlements.savedScenarioLimit !== -1 && saved.length >= entitlements.savedScenarioLimit ? (
                <div className="mb-4">
                  <PaywallCard
                    title="Stsenaariumide limiit on täis"
                    description={`Sinu paketis on lubatud kuni ${entitlements.savedScenarioLimit} salvestatud stsenaarium(i). Uuenda paketti, et salvestada rohkem ja võrrelda mugavamalt.`}
                    requiredPlan="plus"
                  />
                </div>
              ) : null}
              {saved.length === 0 ? (
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-sm font-semibold">Pole salvestatud stsenaariume</p>
                  <p className="mt-2 text-sm text-foreground/65">
                    Salvesta ülal stsenaarium ja saad neid võrrelda.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {saved.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-border/50 bg-card/25 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          {renamingId === s.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                className="h-8"
                              />
                              <Button
                                variant="outline"
                                onClick={async () => {
                                  await renameScenarioAction({ id: s.id, name: renameValue.trim() || s.name });
                                  setRenamingId(null);
                                  setRenameValue("");
                                  setSaved(await listScenariosAction());
                                }}
                              >
                                Salvesta
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setRenamingId(null);
                                  setRenameValue("");
                                }}
                              >
                                Tühista
                              </Button>
                            </div>
                          ) : (
                            <p className="truncate text-sm font-semibold tracking-tight">{s.name}</p>
                          )}
                          <p className="mt-1 text-xs text-foreground/55">
                            {typeLabel(s.simulation_type)} •{" "}
                            {new Date(s.updated_at ?? s.created_at).toLocaleString("et-EE")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={s.is_favorite ? "glow" : "outline"}
                            onClick={async () => {
                              await toggleFavoriteScenarioAction({ id: s.id, is_favorite: !s.is_favorite });
                              setSaved(await listScenariosAction());
                            }}
                            aria-label="Lemmik"
                          >
                            {s.is_favorite ? "★" : "☆"}
                          </Button>
                          <label className="flex items-center gap-2 text-xs text-foreground/60">
                            <input
                              type="checkbox"
                              checked={compareIds.includes(s.id)}
                              onChange={(e) =>
                                setCompareIds((prev) =>
                                  e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                                )
                              }
                            />
                            Võrdle
                          </label>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setType(s.simulation_type);
                              setName(s.name);
                              setInputs((s.config ?? {}) as any);
                            }}
                          >
                            Ava
                          </Button>
                          <Button
                            variant="outline"
                            onClick={async () => {
                              await duplicateScenarioAction({ id: s.id });
                              setSaved(await listScenariosAction());
                            }}
                          >
                            Dubleeri
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRenamingId(s.id);
                              setRenameValue(s.name);
                            }}
                          >
                            Nimeta
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              await deleteScenarioAction({ id: s.id });
                              setSaved(await listScenariosAction());
                              setCompareIds((prev) => prev.filter((id) => id !== s.id));
                            }}
                          >
                            Kustuta
                          </Button>
                        </div>
                      </div>
                      <ScenarioPreview scenario={s} />
                    </div>
                  ))}
                </div>
              )}

              {compareList.length >= 2 ? (
                <div className="mt-4 rounded-3xl border border-border/50 bg-card/20 p-5">
                  <p className="text-xs font-medium tracking-wide text-foreground/60">Võrdlus</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {compareList.map((s) => (
                      <div key={s.id} className="rounded-2xl border border-border/50 bg-card/25 p-4">
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="mt-1 text-xs text-foreground/55">{typeLabel(s.simulation_type)}</p>
                        <div className="mt-3 space-y-2">
                          <ScenarioCompareStats scenario={s} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-foreground/60">
                      Järgmine samm: lisame “compare cashflow overlay” graafiku ja ekspordi.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Panel className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_220px_at_25%_0%,rgba(38,230,255,0.08),transparent_60%)]"
      />
      <div className="relative px-6 py-5">
        <p className="text-xs font-medium tracking-wide text-foreground/60">{label}</p>
        <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-2 text-sm text-foreground/60">{hint}</p>
      </div>
    </Panel>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2">
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="font-mono text-xs font-semibold text-foreground/85">{value}</p>
    </div>
  );
}

function ScenarioPreview({ scenario }: { scenario: ScenarioDTO }) {
  const def = SIM_DEFINITIONS[scenario.simulation_type];
  const res = def.calculate((scenario.config ?? {}) as any);
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      <MiniStat label="Kuutine sääst" value={fmtEur(res.monthlySavingsEur)} />
      <MiniStat label="Aastane sääst" value={fmtEur(res.annualSavingsEur)} />
      <MiniStat label="Tasuvus" value={fmtYears(res.paybackYears)} />
    </div>
  );
}

function ScenarioCompareStats({ scenario }: { scenario: ScenarioDTO }) {
  const def = SIM_DEFINITIONS[scenario.simulation_type];
  const res = def.calculate((scenario.config ?? {}) as any);
  return (
    <>
      <MiniStat label="Kuutine sääst" value={fmtEur(res.monthlySavingsEur)} />
      <MiniStat label="Aastane sääst" value={fmtEur(res.annualSavingsEur)} />
      <MiniStat label="Tasuvus" value={fmtYears(res.paybackYears)} />
    </>
  );
}

