"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

type PricePoint = { ts: string; eurPerMwh: number };

function fmtEurPerMwh(v: number) {
  return `${Math.round(v)} €/MWh`;
}

function fmtCentsPerKwh(vEurPerMwh: number) {
  const s = (vEurPerMwh / 10).toFixed(1);
  return `${s} s/kWh`;
}

function tooltipClass() {
  return "rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground/85 shadow-[var(--shadow-elev-2)] backdrop-blur-md";
}

function hourKey(iso: string) {
  // yyyy-mm-ddThh
  return iso.slice(0, 13);
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function asQuarterHours(points: PricePoint[]) {
  // Preview: create 4x 15-min slots per hour (flat within the hour).
  const out: Array<{ ts: string; eurPerMwh: number; source: "derived_15m" }> = [];
  for (const p of points) {
    const base = new Date(p.ts);
    if (!Number.isFinite(base.getTime())) continue;
    for (let i = 0; i < 4; i++) {
      const t = new Date(base.getTime() + i * 15 * 60 * 1000).toISOString();
      out.push({ ts: t, eurPerMwh: p.eurPerMwh, source: "derived_15m" });
    }
  }
  return out;
}

export function MarketPriceBoard({ area }: { area: "EE" | "LV" | "LT" | "FI" }) {
  const mounted = useMounted();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    area: string;
    source: string;
    points: PricePoint[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/integrations/market-prices?area=${encodeURIComponent(area)}&days=2`)
      .then(async (res) => {
        const payload = (await res.json().catch(() => null)) as any;
        if (cancelled) return;
        if (!payload || payload.ok !== true || !Array.isArray(payload.points)) {
          setError("Hinnainfo ei ole hetkel saadaval.");
          setLoading(false);
          return;
        }
        setData({
          area: String(payload.area ?? area),
          source: String(payload.source ?? "nord_pool"),
          points: payload.points
            .filter((p: any) => p && typeof p.ts === "string" && typeof p.eurPerMwh === "number")
            .sort((a: any, b: any) => (a.ts < b.ts ? -1 : 1)),
        });
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Võrgu viga. Proovi uuesti.");
        setLoading(false);
      });

    const id = window.setInterval(() => {
      // Refresh every 5 minutes in the background.
      fetch(`/api/integrations/market-prices?area=${encodeURIComponent(area)}&days=2`)
        .then(async (res) => {
          const payload = (await res.json().catch(() => null)) as any;
          if (cancelled) return;
          if (!payload || payload.ok !== true || !Array.isArray(payload.points)) return;
          setData({
            area: String(payload.area ?? area),
            source: String(payload.source ?? "nord_pool"),
            points: payload.points
              .filter((p: any) => p && typeof p.ts === "string" && typeof p.eurPerMwh === "number")
              .sort((a: any, b: any) => (a.ts < b.ts ? -1 : 1)),
          });
        })
        .catch(() => {});
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [area]);

  const computed = useMemo(() => {
    const pts = data?.points ?? [];
    const now = new Date();
    const nowIso = now.toISOString();
    const nowHour = hourKey(nowIso);

    const current = pts.find((p) => hourKey(p.ts) === nowHour) ?? null;
    const today = pts.filter((p) => dayKey(p.ts) === dayKey(nowIso));
    const tomorrowKey = dayKey(new Date(now.getTime() + 24 * 3600 * 1000).toISOString());
    const tomorrow = pts.filter((p) => dayKey(p.ts) === tomorrowKey);

    const nextHours = pts
      .filter((p) => p.ts >= nowIso)
      .slice(0, 12);

    const quarters = asQuarterHours(nextHours);

    const stats = (rows: PricePoint[]) => {
      if (!rows.length) return null;
      const values = rows.map((r) => r.eurPerMwh);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { min, max, avg };
    };

    return {
      current,
      currentEurPerMwh: current?.eurPerMwh ?? null,
      currentHourLabel:
        new Date(nowIso).toLocaleTimeString("et-EE", { hour: "2-digit", minute: "2-digit" }) ?? null,
      today,
      tomorrow,
      tomorrowAvailable: tomorrow.length >= 12,
      nextQuarters: quarters.slice(0, 48), // next 12 hours -> 48 slots
      todayStats: stats(today),
      tomorrowStats: stats(tomorrow),
      chart48h: pts.slice(0, 48).map((p) => ({
        ts: p.ts,
        eurPerMwh: p.eurPerMwh,
        hour: new Date(p.ts).toLocaleTimeString("et-EE", { hour: "2-digit", minute: "2-digit" }),
        day: new Date(p.ts).toLocaleDateString("et-EE", { day: "2-digit", month: "2-digit" }),
        isNowHour: hourKey(p.ts) === nowHour,
      })),
    };
  }, [data]);

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden">
        <PanelHeader>
          <div>
            <PanelTitle>Hetkehinnang</PanelTitle>
            <PanelDescription>Börsihind (day-ahead) praeguse tunni jaoks.</PanelDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{area}</Badge>
            <Badge variant="cyan">{data?.source === "nord_pool" ? "Elering NPS" : "Allikas"}</Badge>
          </div>
        </PanelHeader>
        <div className="px-6 pb-6">
          <div className="grid gap-4 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-border/50 bg-card/25 p-5">
                <p className="text-xs font-medium tracking-wide text-foreground/60">Praegu</p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground/90">
                  {computed.current ? fmtCentsPerKwh(computed.current.eurPerMwh) : "—"}
                </p>
                <p className="mt-2 text-sm text-foreground/65">
                  {computed.current ? fmtEurPerMwh(computed.current.eurPerMwh) : loading ? "Laen…" : "Hind puudub."}
                </p>
                {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <LinkButton href="/leping" variant="outline" size="sm">
                    Kontrolli lepingut
                  </LinkButton>
                  <LinkButton href="/tarbimine" variant="outline" size="sm">
                    Vaata tarbimist
                  </LinkButton>
                </div>
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="rounded-2xl border border-border/50 bg-card/25 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-foreground/60">Järgmised 12 tundi (15 min)</p>
                    <p className="mt-2 text-sm text-foreground/65">Kiire vaade — hea ajastuse tunnetamiseks.</p>
                  </div>
                  <Badge variant="neutral">preview</Badge>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {computed.nextQuarters.map((q) => (
                    <div
                      key={q.ts}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/30 px-3 py-2",
                        "text-sm"
                      )}
                    >
                      <span className="font-mono text-xs text-foreground/65">
                        {new Date(q.ts).toLocaleTimeString("et-EE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="font-mono font-semibold text-foreground/85">{fmtCentsPerKwh(q.eurPerMwh)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <PanelHeader>
          <div>
            <PanelTitle>Hinnagraafik (48h)</PanelTitle>
            <PanelDescription>Liigu hiirega üle graafiku, et näha iga tunni hinda. Homne ilmub, kui API avaldab.</PanelDescription>
          </div>
          <Badge variant="neutral">hourly</Badge>
        </PanelHeader>
        <div className="px-6 pb-6">
          <div className="h-72 w-full min-w-0 rounded-2xl border border-border/60 bg-background/30 p-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={computed.chart48h} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={18}
                    tick={{ fill: "oklch(1 0 0 / 55%)", fontSize: 11 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 45%)", fontSize: 11 }} />
                  <Tooltip
                    wrapperStyle={{ outline: "none" }}
                    cursor={{ stroke: "oklch(0.83 0.14 205 / 35%)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0]?.payload as any;
                      const v = payload[0]?.value as number;
                      return (
                        <div className={tooltipClass()}>
                          <p className="font-medium">
                            {row.day} {row.hour}
                          </p>
                          <p className="mt-1 font-mono">{fmtEurPerMwh(v)}</p>
                          <p className="mt-1 text-foreground/65">{fmtCentsPerKwh(v)}</p>
                        </div>
                      );
                    }}
                  />
                  <defs>
                    <linearGradient id="epPrice48" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.83 0.14 205 / 55%)" />
                      <stop offset="100%" stopColor="oklch(0.83 0.14 205 / 6%)" />
                    </linearGradient>
                  </defs>
                  {computed.currentHourLabel ? (
                    <ReferenceLine
                      x={computed.currentHourLabel}
                      stroke="oklch(1 0 0 / 22%)"
                      strokeDasharray="6 6"
                      strokeWidth={1}
                    />
                  ) : null}
                  {typeof computed.currentEurPerMwh === "number" ? (
                    <ReferenceLine
                      y={computed.currentEurPerMwh}
                      stroke="oklch(0.95 0.02 85 / 55%)"
                      strokeDasharray="6 6"
                      strokeWidth={1.5}
                      label={{
                        value: "Praegu",
                        position: "insideTopRight",
                        fill: "oklch(1 0 0 / 70%)",
                        fontSize: 11,
                      }}
                    />
                  ) : null}
                  <Area
                    type="monotone"
                    dataKey="eurPerMwh"
                    stroke="oklch(0.83 0.14 205 / 78%)"
                    strokeWidth={2.25}
                    fill="url(#epPrice48)"
                    dot={(props: any) => {
                      const isNow = Boolean(props?.payload?.isNowHour);
                      if (!isNow) return null;
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={4.5}
                          fill="oklch(0.95 0.02 85 / 95%)"
                          stroke="oklch(0.83 0.14 205 / 70%)"
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-xl border border-border/40 bg-card/20" aria-hidden />
            )}
          </div>
          <p className="mt-3 text-xs text-foreground/55">
            Märkus: day-ahead on tunnipõhine. 15-min vaade lehel on test-buildi preview (tuletatud tunnipunktidest).
          </p>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <DayCard
          title="Täna"
          subtitle="Min/avg/max day-ahead hind"
          stats={computed.todayStats}
          available={(computed.today?.length ?? 0) > 0}
          loading={loading}
        />
        <DayCard
          title="Homme"
          subtitle={computed.tomorrowAvailable ? "Avaldatud (day-ahead)" : "Pole veel avaldatud"}
          stats={computed.tomorrowStats}
          available={computed.tomorrowAvailable}
          loading={loading}
        />
      </div>
    </div>
  );
}

function DayCard({
  title,
  subtitle,
  stats,
  available,
  loading,
}: {
  title: string;
  subtitle: string;
  stats: { min: number; max: number; avg: number } | null;
  available: boolean;
  loading: boolean;
}) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader>
        <div>
          <PanelTitle>{title}</PanelTitle>
          <PanelDescription>{subtitle}</PanelDescription>
        </div>
        <Badge variant={available ? "green" : "neutral"}>{available ? "Saadaval" : loading ? "Laen…" : "Puudub"}</Badge>
      </PanelHeader>
      <div className="px-6 pb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Min" value={stats ? fmtCentsPerKwh(stats.min) : "—"} hint={stats ? fmtEurPerMwh(stats.min) : ""} />
          <Stat label="Keskmine" value={stats ? fmtCentsPerKwh(stats.avg) : "—"} hint={stats ? fmtEurPerMwh(stats.avg) : ""} />
          <Stat label="Max" value={stats ? fmtCentsPerKwh(stats.max) : "—"} hint={stats ? fmtEurPerMwh(stats.max) : ""} />
        </div>
        {!available ? (
          <p className="mt-4 text-xs leading-relaxed text-foreground/55">
            Homne hind avaldatakse tavaliselt päeva jooksul. Kui API uuendab, ilmub see siia automaatselt (refresh ~5 min).
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
      <p className="text-xs text-foreground/55">{label}</p>
      <p className="mt-2 font-mono text-xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-foreground/55">{hint}</p> : null}
    </div>
  );
}

