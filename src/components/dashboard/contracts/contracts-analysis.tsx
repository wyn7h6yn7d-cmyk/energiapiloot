"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { analyzeContracts, type AnalysisInputs, type ContractType } from "@/lib/contracts/model";

function fmtEur(n: number) {
  const sign = n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)} €`;
}

function riskLabel(score: number) {
  if (score <= 25) return { label: "Madal", variant: "green" as const };
  if (score <= 55) return { label: "Keskmine", variant: "neutral" as const };
  return { label: "Kõrge", variant: "warm" as const };
}

export function ContractsAnalysisModule() {
  const [providerName, setProviderName] = useState("ElektraNord");
  const [type, setType] = useState<ContractType>("spot");
  const [monthlyKwh, setMonthlyKwh] = useState(420);
  const [baseFee, setBaseFee] = useState(3.49);
  const [energyPrice, setEnergyPrice] = useState(0.118);
  const [networkFee, setNetworkFee] = useState(0.072);
  const [vatRate, setVatRate] = useState(0.22);

  const [peakShare, setPeakShare] = useState(0.38);
  const [peakMult, setPeakMult] = useState(1.28);

  const [spotVol, setSpotVol] = useState(0.55);
  const [hybridSpotShare, setHybridSpotShare] = useState(0.55);

  const inputs: AnalysisInputs = useMemo(
    () => ({
      monthlyKwh: Math.max(0, monthlyKwh),
      pattern: {
        peakShare: Math.min(0.9, Math.max(0.1, peakShare)),
        peakPriceMultiplier: Math.min(1.8, Math.max(1.05, peakMult)),
      },
      current: {
        providerName: providerName.trim() || "Praegune pakkuja",
        type,
        baseFeeEurPerMonth: Math.max(0, baseFee),
        energyPriceEurPerKwh: Math.max(0, energyPrice),
        networkFeeEurPerKwh: Math.max(0, networkFee),
        vatRate: Math.min(0.3, Math.max(0, vatRate)),
      },
      assumptions: {
        spotVolatility: Math.min(1, Math.max(0, spotVol)),
        hybridSpotShare: Math.min(0.9, Math.max(0.1, hybridSpotShare)),
      },
    }),
    [
      baseFee,
      energyPrice,
      hybridSpotShare,
      monthlyKwh,
      networkFee,
      peakMult,
      peakShare,
      providerName,
      spotVol,
      type,
      vatRate,
    ]
  );

  const analysis = useMemo(() => analyzeContracts(inputs), [inputs]);
  const currentRisk = riskLabel(analysis.current.riskScore);
  const best = analysis.recommendation;

  const chartData = analysis.scenarios
    .filter((s) => s.label !== "Praegune")
    .map((s) => ({
      name: s.label,
      est: s.estMonthlyCostEur,
      best: s.bestCaseEur,
      worst: s.worstCaseEur,
      risk: s.riskScore,
    }));

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <PanelHeader>
            <div>
              <PanelTitle>Praegune leping</PanelTitle>
              <PanelDescription>
                Sisesta kiirelt oma eeldused. Mudel on MVP ja mõeldud arusaadavaks.
              </PanelDescription>
            </div>
            <Badge variant="neutral">MVP mudel</Badge>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium tracking-wide text-foreground/60">
                  Pakkuja (silt)
                </label>
                <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium tracking-wide text-foreground/60">
                  Lepingu tüüp
                </label>
                <select
                  className="h-10 rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
                  value={type}
                  onChange={(e) => setType(e.target.value as ContractType)}
                >
                  <option value="fixed">Fikseeritud</option>
                  <option value="spot">Börsihind</option>
                  <option value="hybrid">Hübriid</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-foreground/60">
                    Tarbimine (kWh/kuu)
                  </label>
                  <Input
                    inputMode="numeric"
                    value={String(monthlyKwh)}
                    onChange={(e) => setMonthlyKwh(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-foreground/60">
                    Kuutasu (€)
                  </label>
                  <Input
                    inputMode="decimal"
                    value={String(baseFee)}
                    onChange={(e) => setBaseFee(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-foreground/60">
                    Energia hind (€/kWh)
                  </label>
                  <Input
                    inputMode="decimal"
                    value={String(energyPrice)}
                    onChange={(e) => setEnergyPrice(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-foreground/60">
                    Võrgutasu (€/kWh)
                  </label>
                  <Input
                    inputMode="decimal"
                    value={String(networkFee)}
                    onChange={(e) => setNetworkFee(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-foreground/60">
                    KM määr (nt 0.22)
                  </label>
                  <Input
                    inputMode="decimal"
                    value={String(vatRate)}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-foreground/60">
                    Hinnariski eeldus (0..1)
                  </label>
                  <Input
                    inputMode="decimal"
                    value={String(spotVol)}
                    onChange={(e) => setSpotVol(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-2 rounded-2xl border border-border/50 bg-card/25 p-4">
                <p className="text-xs font-medium tracking-wide text-foreground/60">
                  Tarbimismuster (eeldus)
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs text-foreground/55">
                      Tipp-tundide osakaal: {Math.round(peakShare * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={0.8}
                      step={0.01}
                      value={peakShare}
                      onChange={(e) => setPeakShare(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-foreground/55">
                      Tipp-tundide hinnakordaja: {peakMult.toFixed(2)}×
                    </label>
                    <input
                      type="range"
                      min={1.05}
                      max={1.8}
                      step={0.01}
                      value={peakMult}
                      onChange={(e) => setPeakMult(Number(e.target.value))}
                    />
                  </div>
                </div>

                {type === "hybrid" ? (
                  <div className="mt-4 grid gap-2">
                    <label className="text-xs text-foreground/55">
                      Hübriidi börsiosa: {Math.round(hybridSpotShare * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.01}
                      value={hybridSpotShare}
                      onChange={(e) => setHybridSpotShare(Number(e.target.value))}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 lg:col-span-7">
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Kokkuvõte</PanelTitle>
                <PanelDescription>Selge, lihtne, tegutsemisele suunatud.</PanelDescription>
              </div>
              <Badge variant={currentRisk.variant}>Risk: {currentRisk.label}</Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-xs text-foreground/55">Hinnanguline kuukulu</p>
                  <p className="mt-2 font-mono text-xl font-semibold">
                    {fmtEur(analysis.current.estMonthlyCostEur)}
                  </p>
                  <p className="mt-2 text-xs text-foreground/55">
                    Vahemik: {fmtEur(analysis.current.bestCaseEur)} –{" "}
                    {fmtEur(analysis.current.worstCaseEur)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-xs text-foreground/55">Riskiskoor</p>
                  <p className="mt-2 font-mono text-xl font-semibold">{analysis.current.riskScore}/100</p>
                  <p className="mt-2 text-xs text-foreground/55">
                    Tipp: {Math.round(inputs.pattern.peakShare * 100)}% • vol:{" "}
                    {inputs.assumptions.spotVolatility.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-xs text-foreground/55">Soovitus</p>
                  <p className="mt-2 text-sm font-semibold">{best.title}</p>
                  <p className="mt-2 text-xs text-foreground/55">{best.summary}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border/40 bg-card/20 p-4">
                <p className="text-xs font-medium tracking-wide text-foreground/60">
                  Plain-language kokkuvõte
                </p>
                <p className="mt-2 text-sm text-foreground/70">
                  Sinu tarbimine on {Math.round(inputs.pattern.peakShare * 100)}% tipp-tundides.
                  See tähendab, et börsipõhise lepingu puhul mõjutab kuukulu rohkem hinnakõikumine.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                  {best.why.map((w, idx) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link href="/dashboard/recommendations">
                  <Button variant="outline">Lisa see soovitus nimekirja</Button>
                </Link>
                <Link href="/dashboard/reports">
                  <Button variant="glow">Loo raport</Button>
                </Link>
              </div>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader>
              <div>
                <PanelTitle>Kulude võrdlus</PanelTitle>
                <PanelDescription>Hindame kuukulu eri lepingutüüpidega (MVP mudel).</PanelDescription>
              </div>
              <Badge variant="neutral">€/kuu</Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              <div className="h-64 w-full rounded-2xl border border-border/60 bg-background/30 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 55%)", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 45%)", fontSize: 11 }} />
                    <Tooltip
                      wrapperStyle={{ outline: "none" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const est = payload.find((p) => p.dataKey === "est")?.value as number;
                        const risk = payload.find((p) => p.dataKey === "risk")?.payload?.risk as number;
                        return (
                          <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground/85 shadow-[var(--shadow-elev-2)] backdrop-blur-md">
                            <p className="font-medium">{label}</p>
                            <p className="mt-1">{fmtEur(est)} / kuu</p>
                            <p className="mt-1 text-foreground/60">Risk: {risk}/100</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="est" radius={[10, 10, 6, 6]} fill="oklch(0.83 0.14 205 / 45%)" stroke="oklch(0.83 0.14 205 / 70%)" />
                    {/* Invisible bar used for tooltip payload */}
                    <Bar dataKey="risk" hide />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-xs font-medium tracking-wide text-foreground/60">Riskiskoor (mida see tähendab)</p>
                  <p className="mt-2 text-sm text-foreground/70">
                    0–25: stabiilne • 26–55: mõõdukas kõikumine • 56–100: tugev kõikumine ja eelarverisk.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-xs font-medium tracking-wide text-foreground/60">Parim sobivus sinu profiilile</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={best.bestFit === "fixed" ? "green" : "neutral"}
                      className={cn(best.bestFit !== "fixed" && "opacity-70")}
                    >
                      Fikseeritud
                    </Badge>
                    <Badge
                      variant={best.bestFit === "spot" ? "cyan" : "neutral"}
                      className={cn(best.bestFit !== "spot" && "opacity-70")}
                    >
                      Börs
                    </Badge>
                    <Badge
                      variant={best.bestFit === "hybrid" ? "warm" : "neutral"}
                      className={cn(best.bestFit !== "hybrid" && "opacity-70")}
                    >
                      Hübriid
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-foreground/70">{best.summary}</p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="rounded-3xl border border-border/40 bg-card/20 p-6">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Tehniline märkus
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          See moodul on modulaarne: praegu kasutame lihtsat MVP mudelit (sisendhind + volatiilsuse eeldus).
          Järgmises etapis ühendame päris turuandmed (Nord Pool / pakkumised) ja sinu tegeliku tarbimise profiili.
        </p>
      </div>
    </div>
  );
}

