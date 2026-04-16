"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";

import type { CashflowPoint, SensitivityPoint } from "@/lib/simulations/types";

function tooltipBox(children: React.ReactNode) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground/85 shadow-[var(--shadow-elev-2)] backdrop-blur-md">
      {children}
    </div>
  );
}

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  return (
    <div className="h-64 w-full rounded-2xl border border-border/60 bg-background/30 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 55%)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 45%)", fontSize: 11 }} />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value as number;
              return tooltipBox(
                <>
                  <p className="font-medium">Aasta {label}</p>
                  <p className="mt-1">{v.toFixed(0)} € kumulatiivne</p>
                </>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeEur"
            stroke="oklch(0.83 0.14 205 / 75%)"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SensitivityChart({ data }: { data: SensitivityPoint[] }) {
  return (
    <div className="h-64 w-full rounded-2xl border border-border/60 bg-background/30 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 55%)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 45%)", fontSize: 11 }} />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value as number;
              const pb = (payload[0]?.payload as any)?.paybackYears as number | null;
              return tooltipBox(
                <>
                  <p className="font-medium">{label} stsenaarium</p>
                  <p className="mt-1">{v.toFixed(0)} € / kuu</p>
                  <p className="mt-1 text-foreground/60">
                    Tasuvus: {pb === null ? "—" : `${pb.toFixed(1)} a`}
                  </p>
                </>
              );
            }}
          />
          <Bar
            dataKey="monthlySavingsEur"
            radius={[10, 10, 6, 6]}
            fill="oklch(0.82 0.16 145 / 45%)"
            stroke="oklch(0.82 0.16 145 / 65%)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

