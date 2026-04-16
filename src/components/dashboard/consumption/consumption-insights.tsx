"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
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
import { LinkButton } from "@/components/ui/link-button";
import { PremiumGate } from "@/components/product/premium-gate";
import { useMounted } from "@/hooks/use-mounted";
import {
  buildConsumptionInsights,
  type ConsumptionInsights,
  type ConsumptionProfileInputs,
  type MajorDeviceKey,
} from "@/lib/consumption/insights";

function fmtEur(n: number) {
  return `${n.toFixed(2)} €`;
}

function severityBadge(sev: "info" | "warn" | "high") {
  if (sev === "high") return { label: "Kõrge", variant: "warm" as const };
  if (sev === "warn") return { label: "Hoiatus", variant: "neutral" as const };
  return { label: "Info", variant: "green" as const };
}

const DEVICE_LABELS: Record<MajorDeviceKey, string> = {
  ev: "Elektriauto",
  boiler: "Sooja vee boiler",
  heat_pump: "Soojuspump",
  cooling: "Jahutus",
  commercial_refrigeration: "Külma ahel (äri)",
  machinery: "Tööpink / masinad",
};

export function ConsumptionInsightsModule({
  serverBootstrap,
  publicExperience = false,
}: {
  serverBootstrap?: { monthlyKwh: number; avgAllIn: number; footnote?: string };
  publicExperience?: boolean;
}) {
  const [monthlyKwh, setMonthlyKwh] = useState(serverBootstrap?.monthlyKwh ?? 420);
  const [avgAllIn, setAvgAllIn] = useState(serverBootstrap?.avgAllIn ?? 0.19);
  const [dayShare, setDayShare] = useState(0.58);
  const [weekendShare, setWeekendShare] = useState(0.26);
  const [baseLoadW, setBaseLoadW] = useState(220);
  const [peakDep, setPeakDep] = useState(0.55);
  const [devices, setDevices] = useState<Record<MajorDeviceKey, boolean>>({
    ev: true,
    boiler: true,
    heat_pump: false,
    cooling: false,
    commercial_refrigeration: false,
    machinery: false,
  });

  const profile: ConsumptionProfileInputs = useMemo(
    () => ({
      monthlyKwh: Math.max(0, monthlyKwh),
      avgAllInEurPerKwh: Math.max(0.01, avgAllIn),
      dayShare: Math.min(0.9, Math.max(0.2, dayShare)),
      weekendShare: Math.min(0.6, Math.max(0.15, weekendShare)),
      baseLoadW: Math.max(0, baseLoadW),
      devices,
      peakHourDependency: Math.min(1, Math.max(0, peakDep)),
    }),
    [avgAllIn, baseLoadW, dayShare, devices, monthlyKwh, peakDep, weekendShare]
  );

  const insights = useMemo(() => buildConsumptionInsights(profile), [profile]);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Panel className="lg:col-span-5">
        <PanelHeader>
          <div>
            <PanelTitle>Tarbimisprofiil</PanelTitle>
            <PanelDescription>
              Seadista lihtsad eeldused. See töötab ka siis, kui sul pole veel
              täpseid mõõteandmeid.
              {serverBootstrap?.footnote ? (
                <span className="mt-2 block text-[11px] text-foreground/50">{serverBootstrap.footnote}</span>
              ) : null}
            </PanelDescription>
          </div>
          <Badge variant="neutral">Hinnang</Badge>
        </PanelHeader>
        <div className="px-6 pb-6">
          <div className="grid gap-4">
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
                  Keskmine hind (€/kWh)
                </label>
                <Input
                  inputMode="decimal"
                  value={String(avgAllIn)}
                  onChange={(e) => setAvgAllIn(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium tracking-wide text-foreground/60">
                Baas-koormus (W)
              </label>
              <Input
                inputMode="numeric"
                value={String(baseLoadW)}
                onChange={(e) => setBaseLoadW(Number(e.target.value))}
              />
              <p className="text-xs text-foreground/55">
                Lihtne rusikareegel: 150–300 W on kodus tavaline; äris võib olla
                kõrgem.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs font-medium tracking-wide text-foreground/60">
                Käitumise eeldused
              </p>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-2">
                  <label className="text-xs text-foreground/55">
                    Päeva osakaal (päev vs öö): {Math.round(dayShare * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.2}
                    max={0.9}
                    step={0.01}
                    value={dayShare}
                    onChange={(e) => setDayShare(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs text-foreground/55">
                    Nädalavahetuse osakaal: {Math.round(weekendShare * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.15}
                    max={0.6}
                    step={0.01}
                    value={weekendShare}
                    onChange={(e) => setWeekendShare(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs text-foreground/55">
                    Tipp-tundide sõltuvus: {Math.round(peakDep * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={peakDep}
                    onChange={(e) => setPeakDep(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs font-medium tracking-wide text-foreground/60">
                Suured seadmed
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(Object.keys(DEVICE_LABELS) as MajorDeviceKey[]).map((k) => (
                  <label
                    key={k}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border/40 bg-card/20 px-3 py-2 text-sm"
                  >
                    <span className="text-foreground/75">{DEVICE_LABELS[k]}</span>
                    <input
                      type="checkbox"
                      checked={devices[k]}
                      onChange={(e) =>
                        setDevices((prev) => ({ ...prev, [k]: e.target.checked }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:col-span-7">
        {publicExperience ? (
          <PremiumGate
            className="rounded-3xl"
            title="Tarbimise vaade"
            description="Täisgraafik, draiverid, anomaaliad ja säästuplaan — kõik kihid on testimiseks avatud."
          >
            <ConsumptionDeepPanels
              insights={insights}
              monthlyKwh={monthlyKwh}
              avgAllIn={avgAllIn}
              dayShare={dayShare}
              publicExperience
            />
          </PremiumGate>
        ) : (
          <ConsumptionDeepPanels
            insights={insights}
            monthlyKwh={monthlyKwh}
            avgAllIn={avgAllIn}
            dayShare={dayShare}
            publicExperience={false}
          />
        )}
      </div>
    </div>
  );
}

function ConsumptionDeepPanels({
  insights,
  monthlyKwh,
  avgAllIn,
  dayShare,
  publicExperience,
}: {
  insights: ConsumptionInsights;
  monthlyKwh: number;
  avgAllIn: number;
  dayShare: number;
  publicExperience: boolean;
}) {
  const mounted = useMounted();
  return (
    <>
      <Panel className="overflow-hidden">
        <PanelHeader>
          <div>
            <PanelTitle>Visuaalne tarbimismuster</PanelTitle>
            <PanelDescription>Ööpäevaring — mudelitud profiil (kuni tulevad mõõdud).</PanelDescription>
          </div>
          <Badge variant="cyan">{insights.kpis.peakDependencyScore}/100 tipu-sõltuvus</Badge>
        </PanelHeader>
        <div className="px-6 pb-6">
          <div className="h-64 w-full min-w-0 rounded-2xl border border-border/60 bg-background/30 p-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={insights.pattern} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    interval={3}
                    tick={{ fill: "oklch(1 0 0 / 55%)", fontSize: 11 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 45%)", fontSize: 11 }} />
                  <Tooltip
                    wrapperStyle={{ outline: "none" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const v = payload[0]?.value as number;
                      return (
                        <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground/85 shadow-[var(--shadow-elev-2)] backdrop-blur-md">
                          <p className="font-medium">{label}</p>
                          <p className="mt-1">{v.toFixed(2)} kWh</p>
                        </div>
                      );
                    }}
                  />
                  <defs>
                    <linearGradient id="epCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.82 0.16 145 / 52%)" />
                      <stop offset="100%" stopColor="oklch(0.82 0.16 145 / 6%)" />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="kwh"
                    stroke="oklch(0.82 0.16 145 / 75%)"
                    strokeWidth={2}
                    fill="url(#epCons)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-xl border border-border/40 bg-card/20" aria-hidden />
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs text-foreground/55">Kuukulu (hinnang)</p>
              <p className="mt-2 font-mono text-xl font-semibold">{fmtEur(insights.kpis.estMonthlyCostEur)}</p>
              <p className="mt-1 text-xs text-foreground/55">
                {monthlyKwh} kWh • {avgAllIn.toFixed(3)} €/kWh
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs text-foreground/55">Baas-koormus</p>
              <p className="mt-2 font-mono text-xl font-semibold">~{Math.round(insights.kpis.estMonthlyBaseKwh)} kWh</p>
              <p className="mt-1 text-xs text-foreground/55">{Math.round(insights.kpis.baseLoadShare * 100)}% kogu tarbimisest</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-xs text-foreground/55">Päev vs öö</p>
              <p className="mt-2 font-mono text-xl font-semibold">
                {Math.round(dayShare * 100)}/{100 - Math.round(dayShare * 100)}
              </p>
              <p className="mt-1 text-xs text-foreground/55">%</p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Kulu draiverid</PanelTitle>
              <PanelDescription>Kust kulud tõenäoliselt tulevad.</PanelDescription>
            </div>
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {insights.drivers.slice(0, 6).map((d) => (
                <div key={d.key} className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold tracking-tight">{d.label}</p>
                    <Badge variant="neutral">{fmtEur(d.eurMonthly)}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-foreground/55">
                    ~{Math.round(d.kwhMonthly)} kWh/kuu • {d.note}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-border/40 bg-card/20 p-4">
              <p className="text-sm text-foreground/70">
                Need on hinnangud. Kui ühendad päris mõõteandmed, muutuvad draiverid automaatselt täpsemaks.
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Lipud ja võimalused</PanelTitle>
              <PanelDescription>Anomaaliad + kiire sääst.</PanelDescription>
            </div>
            {publicExperience ? (
              <LinkButton href="/leping" variant="outline">
                Võrdle lepingut
              </LinkButton>
            ) : (
              <Link href="/dashboard/recommendations">
                <Button variant="outline">Soovitused</Button>
              </Link>
            )}
          </PanelHeader>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {insights.anomalies.map((a, idx) => {
                const b = severityBadge(a.severity);
                return (
                  <div key={idx} className="rounded-2xl border border-border/50 bg-card/25 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold tracking-tight">{a.title}</p>
                      <Badge variant={b.variant}>{b.label}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-foreground/65">{a.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium tracking-wide text-foreground/60">Säästu võimalused (top)</p>
              <div className="mt-3 space-y-2">
                {insights.opportunities.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-border/50 bg-card/25 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-tight">{o.title}</p>
                      <p className="mt-1 text-xs text-foreground/55">
                        Usaldus: {o.confidence} • {o.rationale}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-[oklch(0.92_0.06_145)]">{fmtEur(o.estMonthlyEur)}</p>
                      <p className="text-[11px] text-foreground/55">€/kuu</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader>
          <div>
            <PanelTitle>{insights.recommendations.title}</PanelTitle>
            <PanelDescription>Lihtsas keeles, et saaks kohe tegutseda.</PanelDescription>
          </div>
          <Badge variant="green">Selge kokkuvõte</Badge>
        </PanelHeader>
        <div className="px-6 pb-6">
          <ul className="space-y-2 text-sm text-foreground/70">
            {insights.recommendations.bullets.map((b, idx) => (
              <li key={idx}>• {b}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {publicExperience ? (
              <>
                <LinkButton href="/simulatsioonid" variant="gradient">
                  Ava simulatsioon
                </LinkButton>
                <LinkButton href="/leping" variant="outline">
                  Võrdle lepingut
                </LinkButton>
              </>
            ) : (
              <>
                <Button variant="gradient" onClick={() => alert("Salvestamine lisandub koos stsenaariumidega.")}>
                  Salvesta profiil
                </Button>
                <Link href="/dashboard/contracts">
                  <Button variant="outline">Mine lepinguanalüüsi</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Panel>
    </>
  );
}

