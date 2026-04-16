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
          <PanelDescription>Kiirülevaade ja võrdlus (mock-andmed).</PanelDescription>
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
            <p className="mt-1 text-xs text-foreground/55">Mock: +8% all-in hind</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/40 bg-card/20 p-4">
          <p className="text-xs font-medium tracking-wide text-foreground/60">Hinnanguline kuukulu</p>
          <p className="mt-2 font-mono text-2xl font-semibold">{fmtEur(estEnergyCost)}</p>
          <p className="mt-2 text-sm text-foreground/60">
            Arvutus põhineb \( {estMonthlyKwh} kWh/kuu \) ja eeldatud keskmisel hinnal.
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
          <PanelDescription>Kus on kõige lihtsam võit (mock).</PanelDescription>
        </div>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/25 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">{s.label}</p>
                <p className="mt-1 text-xs text-foreground/55">Usaldus: {s.confidence}</p>
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
          <PanelDescription>Konkreetsed järgmised sammud (mock).</PanelDescription>
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
                          : "Monitooring"}
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
          <PanelDescription>Stsenaariumid ja tulemused (mock).</PanelDescription>
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
          <PanelDescription>Mis sul on juba olemas (mock).</PanelDescription>
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

export function UpcomingInsights({
  items,
}: {
  items: { id: string; title: string; etaLabel: string; description: string }[];
}) {
  return (
    <Panel>
      <PanelHeader>
        <div>
          <PanelTitle>Tulemas / Insights</PanelTitle>
          <PanelDescription>Automaatne analüüs, kui andmed täienevad.</PanelDescription>
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

