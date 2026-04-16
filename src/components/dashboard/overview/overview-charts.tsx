"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

function tooltipClass() {
  return "rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground/85 shadow-[var(--shadow-elev-2)] backdrop-blur-md";
}

export function MiniCostTrend({
  data,
  className,
}: {
  data: { day: string; eur: number }[];
  className?: string;
}) {
  const mounted = useMounted();
  return (
    <div className={cn("h-44 w-full min-w-0", className)}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 55%)", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 45%)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{}}
              wrapperStyle={{ outline: "none" }}
              cursor={{ stroke: "oklch(0.83 0.14 205 / 35%)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const v = payload[0]?.value as number;
                return <div className={tooltipClass()}>{`${v.toFixed(2)} €`}</div>;
              }}
            />
            <defs>
              <linearGradient id="epCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.83 0.14 205 / 55%)" />
                <stop offset="100%" stopColor="oklch(0.83 0.14 205 / 6%)" />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="eur"
              stroke="oklch(0.83 0.14 205 / 75%)"
              strokeWidth={2}
              fill="url(#epCost)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-2xl border border-border/40 bg-card/20" aria-hidden />
      )}
    </div>
  );
}

export function MiniKwhBars({
  data,
  className,
}: {
  data: { day: string; kwh: number }[];
  className?: string;
}) {
  const mounted = useMounted();
  return (
    <div className={cn("h-44 w-full min-w-0", className)}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 55%)", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 45%)", fontSize: 11 }} />
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              cursor={{ fill: "oklch(1 0 0 / 4%)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const v = payload[0]?.value as number;
                return <div className={tooltipClass()}>{`${v.toFixed(1)} kWh`}</div>;
              }}
            />
            <Bar
              dataKey="kwh"
              radius={[10, 10, 6, 6]}
              fill="oklch(0.82 0.16 145 / 45%)"
              stroke="oklch(0.82 0.16 145 / 65%)"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-2xl border border-border/40 bg-card/20" aria-hidden />
      )}
    </div>
  );
}

