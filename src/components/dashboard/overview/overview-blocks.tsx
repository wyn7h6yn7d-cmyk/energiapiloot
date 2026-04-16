"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import type {
  ContractSummary,
  EnergyAssetSummary,
  RecommendationItem,
  SavingsOpportunity,
  SimulationSnippet,
} from "@/lib/dashboard/overview-mock";
import type { DecisionEngineOutput, ProductRecommendation } from "@/lib/domain/recommendations/types";

function fmtEur(n: number) {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return `${sign}${abs.toFixed(2)} €`;
}

export function KpiCard({
  label,
  value,
  hint,
  trend,
  variant = "neutral",
  className,
}: {
  label: string;
  value: string;
  hint: string;
  trend?: string;
  variant?: "neutral" | "cyan" | "green" | "warm";
  className?: string;
}) {
  return (
    <Panel className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(480px_240px_at_25%_0%,rgba(38,230,255,0.10),transparent_60%)] opacity-70"
      />
      <div className="relative px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium tracking-wide text-foreground/60">{label}</p>
          <Badge variant={variant}>{trend ?? "Hinnang"}</Badge>
        </div>
        <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-2 text-sm text-foreground/60">{hint}</p>
      </div>
    </Panel>
  );
}

export function ContractComparison({
  contract,
  estMonthlyKwh,
}: {
  contract: ContractSummary;
  estMonthlyKwh: number;
}) {
  const allIn = (contract.energyPriceEurPerKwh + contract.networkFeeEurPerKwh) * (1 + contract.vatRate);
  const estEnergyCost = estMonthlyKwh * allIn + contract.baseFeeEurPerMonth;
  const fixedAllIn = allIn * 1.08;
  const estFixed = estMonthlyKwh * fixedAllIn + contract.baseFeeEurPerMonth;
  const delta = estFixed - estEnergyCost;

  return (
    <Panel className="overflow-hidden">
      <PanelHeader>
        <div>
          <PanelTitle>Praegune leping</PanelTitle>
          <PanelDescription>Kiirülevaade ja lihtsustatud võrdlus (näidisandmed).</PanelDescription>
        </div>
        <Link href="/dashboard/contracts">
          <Button variant="outline">Ava analüüs</Button>
        </Link>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="cyan">{contract.provider}</Badge>
          <Badge variant="neutral">
            {contract.type === "spot" ? "Börsihind" : contract.type === "fixed" ? "Fikseeritud" : "Hübriid"}
          </Badge>
          <Badge variant={contract.riskLabel === "madal" ? "green" : contract.riskLabel === "kõrge" ? "warm" : "neutral"}>
            Risk: {contract.riskLabel}
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs text-foreground/55">Kõik sees hind</p>
            <p className="mt-2 font-mono text-lg font-semibold">{allIn.toFixed(3)} €/kWh</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs text-foreground/55">Kuutasu</p>
            <p className="mt-2 font-mono text-lg font-semibold">{fmtEur(contract.baseFeeEurPerMonth)}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs text-foreground/55">Võrdlus (fikseeritud)</p>
            <p className={cn("mt-2 font-mono text-lg font-semibold", delta > 0 ? "text-[oklch(0.92_0.06_145)]" : "text-foreground/90")}>
              {delta > 0 ? `+${fmtEur(delta)}` : fmtEur(delta)}
            </p>
            <p className="mt-1 text-xs text-foreground/55">Näidis: fikseeritud +8% kõik-hinda</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/40 bg-card/20 p-4">
          <p className="text-xs font-medium tracking-wide text-foreground/60">Hinnanguline kuukulu</p>
          <p className="mt-2 font-mono text-2xl font-semibold">{fmtEur(estEnergyCost)}</p>
            <p className="mt-2 text-sm text-foreground/60">
            Arvutus põhineb {estMonthlyKwh} kWh/kuu ja eeldatud keskmisel hinnal.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export function SavingsOpportunities({ items }: { items: SavingsOpportunity[] }) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Säästu võimalused</PanelTitle>
          <PanelDescription>Kus on kõige lihtsam võit (näidis).</PanelDescription>
        </div>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/25 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">{s.label}</p>
                <p className="mt-1 text-xs text-foreground/55">Kindlus: {s.confidence}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold text-[oklch(0.92_0.06_145)]">
                  {fmtEur(s.estMonthly.eur)}
                </p>
                <p className="text-[11px] text-foreground/55">€/kuu</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function RecommendationCards({ items }: { items: RecommendationItem[] }) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Top soovitused</PanelTitle>
          <PanelDescription>Konkreetsed järgmised sammud (näidis).</PanelDescription>
        </div>
        <Link href="/dashboard/recommendations">
          <Button variant="outline">Kõik soovitused</Button>
        </Link>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="grid gap-3">
          {items.slice(0, 3).map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold tracking-tight">{r.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={r.kind === "investment" ? "warm" : r.kind === "load_shift" ? "green" : "neutral"}>
                    {r.kind === "contract"
                      ? "Leping"
                      : r.kind === "load_shift"
                        ? "Ajastus"
                        : r.kind === "investment"
                          ? "Investeering"
                          : "Jälgimine"}
                  </Badge>
                  <Badge variant="cyan">{r.effort}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/65">{r.rationale}</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-xs text-foreground/55">Hinnanguline mõju</p>
                <p className="font-mono text-lg font-semibold text-[oklch(0.92_0.06_145)]">
                  {fmtEur(r.estMonthlyImpact.eur)} / kuu
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function LatestSimulations({ items }: { items: SimulationSnippet[] }) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Viimased simulatsioonid</PanelTitle>
          <PanelDescription>Stsenaariumid ja tulemused (näidis).</PanelDescription>
        </div>
        <Link href="/dashboard/simulations">
          <Button variant="outline">Kõik simulatsioonid</Button>
        </Link>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight">{s.title}</p>
                  <p className="mt-1 text-xs text-foreground/55">{s.createdAtLabel}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-semibold text-[oklch(0.92_0.06_145)]">
                    {fmtEur(s.estMonthlyImpact.eur)}
                  </p>
                  <p className="text-[11px] text-foreground/55">€/kuu</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/65">{s.resultLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function EnergyAssetsSummary({ assets }: { assets: EnergyAssetSummary }) {
  const items = [
    { key: "solar", label: "Päike", on: assets.solar, variant: "green" as const },
    { key: "battery", label: "Aku", on: assets.battery, variant: "cyan" as const },
    { key: "ev", label: "EV", on: assets.ev, variant: "warm" as const },
    { key: "heatPump", label: "Soojuspump", on: assets.heatPump, variant: "neutral" as const },
  ];

  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Energiavarad</PanelTitle>
          <PanelDescription>Mis sul on juba olemas (profiilist).</PanelDescription>
        </div>
        <Button
          variant="outline"
          onClick={() => alert("Varade haldus lisandub järgmises etapis.")}
        >
          Halda
        </Button>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {items.map((i) => (
            <Badge key={i.key} variant={i.on ? i.variant : "neutral"} className={cn(!i.on && "opacity-60")}>
              {i.label} {i.on ? "✓" : "—"}
            </Badge>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-border/40 bg-card/20 p-4">
          <p className="text-sm text-foreground/70">
            Kui lisad varad ja tarbimise, saame teha täpsema oma-tarbimise ja tasuvuse hinnangu.
          </p>
        </div>
      </div>
    </Panel>
  );
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
    monitoring: "Andmete jälgimine",
  };
  return m[c];
}

export function DecisionConfidenceStrip({ decision }: { decision: DecisionEngineOutput }) {
  return (
    <Panel className="border-[color:oklch(0.83_0.14_205_/_0.35)]">
      <PanelHeader>
        <div>
          <PanelTitle>Soovituste taust</PanelTitle>
          <PanelDescription>{decision.dataQuality.summaryEt}</PanelDescription>
        </div>
        <Badge variant={decision.dataQuality.strength === "metered" ? "green" : "neutral"}>
          Andmed: {decision.dataQuality.completeness0to100}/100
        </Badge>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs text-foreground/55">Lepingu sobivus</p>
            <p className="mt-2 font-mono text-lg font-semibold">
              {decision.contract.contractFitScore.score0to100}/100
            </p>
            <p className="mt-1 text-xs text-foreground/55">{decision.contract.contractFitScore.band}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs text-foreground/55">Paindlikkus</p>
            <p className="mt-2 font-mono text-lg font-semibold">
              {decision.consumption.flexibilityScore.score0to100}/100
            </p>
            <p className="mt-1 text-xs text-foreground/55">{decision.consumption.flexibilityScore.band}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs text-foreground/55">Tugevaim sääst (mudel)</p>
            <p className="mt-2 font-mono text-lg font-semibold">
              {decision.strongestSavings
                ? `${decision.strongestSavings.eurPerMonth.toFixed(1)} €`
                : "—"}
            </p>
            <p className="mt-1 text-xs text-foreground/55">
              {decision.strongestSavings?.title ?? "Selget säästu ei hinnatud"}
            </p>
          </div>
        </div>
        {decision.notEnoughData ? (
          <p className="mt-4 text-sm text-foreground/70">
            Hetkel on prioriteet andmete täiendamine — suured soovitused tulevad pärast mõõte või täpsemat
            profiili.
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

export function ProductRecommendationCards({ items }: { items: ProductRecommendation[] }) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Top soovitused</PanelTitle>
          <PanelDescription>Eelistatud sammud lähtuvalt reeglitest, profiilist ja turu- ning tarbimisvihjetest.</PanelDescription>
        </div>
        <Link href="/dashboard/recommendations">
          <Button variant="outline">Kõik soovitused</Button>
        </Link>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="grid gap-3">
          {items.slice(0, 3).map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-mono text-xs text-foreground/50">#{r.rank}</span>
                  <p className="truncate text-sm font-semibold tracking-tight">{r.title}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="cyan">{categoryEt(r.category)}</Badge>
                  <Badge variant="neutral">{r.confidence}</Badge>
                  <Badge variant="green">{r.effort}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/65">{r.summary}</p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <p className="text-xs text-foreground/55">
                  {r.confidenceNote ? <span>{r.confidenceNote} </span> : null}
                  {r.timeHorizonEt}
                </p>
                <p className="font-mono text-lg font-semibold text-[oklch(0.92_0.06_145)]">
                  {r.estimatedImpactEurPerMonth > 0.01 ? `${fmtEur(r.estimatedImpactEurPerMonth)} / kuu` : "—"}
                </p>
              </div>
              {r.nextStepHref ? (
                <div className="mt-3">
                  <Link href={r.nextStepHref}>
                    <Button size="sm" variant="gradient">
                      {r.nextStepLabel}
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function UpcomingInsights({
  items,
}: {
  items: { id: string; title: string; etaLabel: string; description: string }[];
}) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Tulekul</PanelTitle>
          <PanelDescription>Automaatne analüüs täieneb, kui ühendad mõõteandmed.</PanelDescription>
        </div>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {items.map((x) => (
            <div key={x.id} className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold tracking-tight">{x.title}</p>
                <Badge variant="neutral">{x.etaLabel}</Badge>
              </div>
              <p className="mt-2 text-sm text-foreground/65">{x.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

