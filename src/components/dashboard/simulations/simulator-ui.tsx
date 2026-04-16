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
import type { SolarIntegrationHints } from "@/lib/integrations/solar-hints";
import { cn } from "@/lib/utils";

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

const SIM_SURFACE = "ep-sim-panel";

const SIM_FIELD_LABELS: Record<string, string> = {
  upfrontEur: "Alginvesteering (€)",
  systemKw: "Süsteemi võimsus (kW)",
  selfConsumptionShare: "Oma-tarbimine (osa 0–1)",
  annualYieldKwhPerKw: "Toodang (kWh/kW/a)",
  electricityPriceEurPerKwh: "Elektri hind (€/kWh)",
  capacityKwh: "Mahutavus (kWh)",
  cyclesPerDay: "Tsüklid ööpäevas",
  efficiency: "Kasutegur",
  valuePerKwhShiftedEur: "Nihutatud kWh väärtus (€)",
  monthlyKwhCharged: "Laadimine (kWh/kuu)",
  smartChargingShare: "Nutikas laadimine (osa)",
  monthlyHeatKwh: "Soojuskoormus (kWh/kuu)",
  cop: "COP",
  replacedFuelCostEurPerKwh: "Asendatud kütus (€/kWh)",
  peakKwReduced: "Tipu vähenemine (kW)",
  networkChargeEurPerKwMonth: "Võrgu tasu (€/kW/kuu)",
  monthsPerYear: "Kuud aastas",
};

function simFieldLabel(key: string) {
  return SIM_FIELD_LABELS[key] ?? key;
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
      {isPublic ? (
        <div className="ep-cinema-panel relative overflow-hidden rounded-[1.75rem] p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[oklch(0.83_0.14_205_/_0.14)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.45)] to-transparent"
          />
          <p className="ep-eyebrow-caps text-foreground/50">Simulatsioonid</p>
          <h1 className="ep-display mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Investeeringu labor: näe mõju enne allkirja.
          </h1>
          <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
            Avalik vaade näitab kohe KPI-sid ja graafikuid. Eesmärk on testida kogu töövoogu: sisendid → mõju → otsus.
          </p>
        </div>
      ) : (
        <div className="ep-cinema-panel relative overflow-hidden rounded-[1.75rem] p-6 md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[oklch(0.82_0.16_145_/_0.1)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.4)] to-transparent"
          />
          <p className="ep-eyebrow-caps text-foreground/50">Simulatsioonid</p>
          <h1 className="ep-display relative mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Investeeringu mõju, selgelt ja võrreldavalt.
          </h1>
          <p className="relative mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
            Simulaatorid kasutavad selgeid, kontrollitavaid valemeid. Täpne tarbimine ja turuhinnad ühenduvad hiljem
            sama liidese alla — ilma töövoogu ümber tegemata.
          </p>
        </div>
      )}

      {!isPublic && solarHints ? (
        <Panel className={SIM_SURFACE}>
          <PanelHeader>
            <div>
              <PanelTitle>Päikese eelhinnang (PVGIS, server-only)</PanelTitle>
              <PanelDescription>
                Kiire kontekst sinu onboarding aadressi / vaikimisi Tallinna koordinaatide järgi. Ei käivita
                brauseris väliseid päringuid.
              </PanelDescription>
            </div>
            <Badge variant="cyan" className="shadow-[0_0_20px_-6px_oklch(0.83_0.14_205_/_0.4)]">
              {solarHints.source}
            </Badge>
          </PanelHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-foreground/78">
              ~<span className="font-mono font-semibold text-foreground/90">{Math.round(solarHints.annualProductionKwh)}</span>{" "}
              kWh/a @ <span className="font-mono font-semibold text-foreground/90">{solarHints.demoPeakPowerKwp}</span> kWp •{" "}
              <span className="font-mono text-foreground/65">
                {solarHints.lat.toFixed(3)}, {solarHints.lng.toFixed(3)}
              </span>
            </p>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          className={cn(
            SIM_SURFACE,
            "lg:col-span-4",
            isPublic && "shadow-[0_0_100px_-48px_oklch(0.83_0.14_205_/_0.32)]"
          )}
        >
          <PanelHeader>
            <div>
              <p className="ep-eyebrow-caps text-[0.58rem] text-foreground/45">Investeeringu instrument</p>
              <PanelTitle className="mt-2">Simulaator</PanelTitle>
              <PanelDescription className="mt-2">
                Muuda parameetreid — väljund uueneb kohe, et näeksid mõju enne otsust.
              </PanelDescription>
            </div>
            <Badge variant="neutral" className="shadow-[0_0_20px_-6px_oklch(0.83_0.14_205_/_0.28)]">
              Esialgne
            </Badge>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <label className="ep-eyebrow-caps text-[0.58rem] text-foreground/50">Stsenaariumi tüüp</label>
                <select
                  className={cn(
                    "ep-sim-select h-11 w-full px-3.5 text-sm font-medium text-foreground",
                    "outline-none"
                  )}
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
                  <p className="text-xs text-foreground/55">Kõik simulaatorid ei pruugi selles vaates veel valmis olla.</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="ep-eyebrow-caps text-[0.58rem] text-foreground/50">Stsenaariumi nimi</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ep-sim-input h-11 bg-transparent px-3.5 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="ep-sim-instrument-well p-4 md:p-5">
                <p className="ep-eyebrow-caps text-[0.58rem] text-[oklch(0.83_0.14_205)]">Mõõdetavad sisendid</p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                  Iga väli mõjutab kohe tulemusi — see on tööriist, mitte passiivne vorm.
                </p>
                <div className="mt-4 grid gap-4">
                  {Object.entries(inputs)
                    .filter(([k, v]) => isNumberField(k, v))
                    .map(([k, v]) => (
                      <div key={k} className="grid gap-2">
                        <label className="text-[11px] font-medium uppercase tracking-wider text-foreground/55">
                          {simFieldLabel(k)}
                        </label>
                        <Input
                          inputMode="decimal"
                          value={String(v)}
                          onChange={(e) =>
                            setInputs((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                          }
                          className="ep-sim-input h-11 bg-transparent px-3.5 font-mono text-[0.95rem] shadow-none focus-visible:ring-0"
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                {isPublic ? (
                  <>
                    <Button variant="gradient" disabled title="Avalikus testis salvestus on ajutiselt välja lülitatud.">
                      Salvesta (tulekul)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInputs({ ...def.defaultInputs });
                      }}
                    >
                      Lähtesta
                    </Button>
                    <p className="w-full text-xs leading-relaxed text-foreground/55">
                      Avalikus testis salvestus ja võrdlus on ajutiselt välja lülitatud. Väljundid ja graafikud on siiski
                      täies mahus nähtavad.
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

              <div className="ep-sim-insight mt-1 p-4 md:p-5">
                <p className="ep-eyebrow-caps text-[0.58rem] text-[oklch(0.82_0.14_145)]">Kohene signaal</p>
                <p className="mt-3 text-sm font-semibold leading-snug text-foreground/92">{result.summary.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/68">{result.summary.bestFit}</p>
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-6 lg:col-span-8">
          <div className="ep-sim-kpi-row">
            <p className="ep-eyebrow-caps text-foreground/45">Mõõdetud väljund</p>
            <p className="mt-2 max-w-2xl text-sm text-foreground/58">
              Need KPI-d uuenevad reaalajas — muuda sisendeid ja vaata, kuidas signaal muutub.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Kpi label="Kuutine sääst" value={`${fmtEur(result.monthlySavingsEur)}`} hint="Hinnanguline, kohene." />
              <Kpi label="Aastane sääst" value={`${fmtEur(result.annualSavingsEur)}`} hint="12 × kuine sääst." />
              <Kpi label="Tasuvus" value={fmtYears(result.paybackYears)} hint="Alginvesteering / aastane sääst." />
            </div>
          </div>

          {isPublic ? (
            <PremiumGate
              className="min-h-[440px] rounded-[1.75rem]"
              title="Investeeringu vaade"
              description="Domeenikiht, rahavoog, tundlikkus ja eeldused ühes vaates — täielikult testimiseks avatud."
              ctaLabel="Ava vaade"
              secondaryCta={undefined}
              tertiaryCta={undefined}
              valuePoints={[
                "Sügavam säästu- ja riskianalüüs (rahavoog + tundlikkus)",
                "Mitme investeeringu stsenaariumi võrdlus",
                "Soovituste kiht joondatud sinu profiiliga",
                "Selgem investeerimisjuhis koos eelduste lõiguga",
              ]}
            >
              <div className="grid gap-4">
                <Panel className={SIM_SURFACE}>
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
                    <p className="text-sm leading-relaxed text-foreground/78">{domainEval.summaryEt}</p>
                    {domainEval.cautionEt ? (
                      <p className="ep-sim-insight mt-3 p-3 text-sm text-foreground/72">{domainEval.cautionEt}</p>
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

                <Panel className={cn(SIM_SURFACE, "overflow-hidden")}>
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
                  <Panel className={cn(SIM_SURFACE, "overflow-hidden")}>
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

                  <Panel className={SIM_SURFACE}>
                    <PanelHeader>
                      <div>
                        <PanelTitle>Eeldused</PanelTitle>
                        <PanelDescription>Mida see arvutus eeldab.</PanelDescription>
                      </div>
                    </PanelHeader>
                    <div className="px-6 pb-6">
                      <div className="space-y-2">
                        {result.assumptions.map((a) => (
                          <div
                            key={a.label}
                            className="ep-sim-assumption-row flex items-center justify-between gap-4 px-3.5 py-2.5"
                          >
                            <p className="text-xs text-foreground/62">{a.label}</p>
                            <p className="text-xs font-medium font-mono text-foreground/85">{a.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="ep-sim-instrument-well mt-4 p-4">
                        <p className="ep-eyebrow-caps text-[0.58rem] text-foreground/48">Selgitus</p>
                        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground/72">
                          {result.summary.bullets.map((b, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_12px_oklch(0.83_0.14_205_/_0.5)]" />
                              <span>{b}</span>
                            </li>
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
          <Panel className={SIM_SURFACE}>
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
              <p className="text-sm leading-relaxed text-foreground/78">{domainEval.summaryEt}</p>
              {domainEval.cautionEt ? (
                <p className="ep-sim-insight mt-3 p-3 text-sm text-foreground/72">{domainEval.cautionEt}</p>
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

          <Panel className={cn(SIM_SURFACE, "overflow-hidden")}>
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
            <Panel className={cn(SIM_SURFACE, "overflow-hidden")}>
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

            <Panel className={SIM_SURFACE}>
              <PanelHeader>
                <div>
                  <PanelTitle>Eeldused</PanelTitle>
                  <PanelDescription>Mida see arvutus eeldab.</PanelDescription>
                </div>
              </PanelHeader>
              <div className="px-6 pb-6">
                <div className="space-y-2">
                  {result.assumptions.map((a) => (
                    <div
                      key={a.label}
                      className="ep-sim-assumption-row flex items-center justify-between gap-4 px-3.5 py-2.5"
                    >
                      <p className="text-xs text-foreground/62">{a.label}</p>
                      <p className="text-xs font-medium font-mono text-foreground/85">{a.value}</p>
                    </div>
                  ))}
                </div>

                <div className="ep-sim-instrument-well mt-4 p-4">
                  <p className="ep-eyebrow-caps text-[0.58rem] text-foreground/48">Selgitus</p>
                  <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground/72">
                    {result.summary.bullets.map((b, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_12px_oklch(0.83_0.14_205_/_0.5)]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          </div>

          <Panel className={SIM_SURFACE}>
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
                <div className="mb-4 rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-sm font-semibold text-foreground/90">Stsenaariumide limiit on täis</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/62">
                    Selles test-buildis püüame hoida töövoo lihtsana. Vajadusel kustuta vanu stsenaariume või
                    oota, kuni salvestus/haldus saab uue versiooni.
                  </p>
                </div>
              ) : null}
              {saved.length === 0 ? (
                <div className="ep-sim-instrument-well p-5">
                  <p className="text-sm font-semibold text-foreground/90">Pole salvestatud stsenaariume</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/62">
                    Salvesta ülal stsenaarium ja saad neid võrrelda.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {saved.map((s) => (
                    <div key={s.id} className="ep-cinema-card relative p-4 md:p-5">
                      <div className="relative z-10">
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
                    </div>
                  ))}
                </div>
              )}

              {compareList.length >= 2 ? (
                <div className="ep-sim-instrument-well mt-4 p-5 md:p-6">
                  <p className="ep-eyebrow-caps text-[0.58rem] text-foreground/48">Võrdlus</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {compareList.map((s) => (
                      <div key={s.id} className="ep-sim-stat-chip rounded-2xl p-4">
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
    <div className="group ep-stat-plinth relative transition-[box-shadow] duration-300 hover:shadow-[0_0_48px_-16px_oklch(0.83_0.14_205_/_0.35)]">
      <div className="relative z-10">
        <p className="ep-eyebrow-caps text-[0.58rem] text-foreground/50">{label}</p>
        <p className="mt-3 bg-gradient-to-br from-foreground via-foreground to-foreground/75 bg-clip-text font-mono text-2xl font-semibold tracking-tight text-transparent">
          {value}
        </p>
        <p className="mt-2 text-sm text-foreground/58">{hint}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ep-sim-stat-chip flex items-baseline justify-between gap-4 px-3.5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/55">{label}</p>
      <p className="font-mono text-xs font-semibold tabular-nums text-foreground/90">{value}</p>
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

