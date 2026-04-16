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
    <div className="rounded-xl border border-[oklch(0.83_0.14_205_/_22%)] bg-[oklch(0.08_0.02_255_/_92%)] px-3 py-2 text-xs text-foreground/90 shadow-[0_0_32px_-8px_oklch(0.83_0.14_205_/_0.35)] backdrop-blur-xl">
      {children}
    </div>
  );
}

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  return (
    <div className="ep-sim-chart-frame h-[17.5rem] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="oklch(1 0 0 / 7%)" vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 58%)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 48%)", fontSize: 11 }} />
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
            stroke="oklch(0.83 0.14 205 / 88%)"
            strokeWidth={2.75}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SensitivityChart({ data }: { data: SensitivityPoint[] }) {
  return (
    <div className="ep-sim-chart-frame h-[17.5rem] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="oklch(1 0 0 / 7%)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 58%)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "oklch(1 0 0 / 48%)", fontSize: 11 }} />
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
            fill="oklch(0.82 0.16 145 / 58%)"
            stroke="oklch(0.82 0.16 145 / 78%)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

