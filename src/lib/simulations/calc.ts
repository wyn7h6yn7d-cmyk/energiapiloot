import type { CashflowPoint, SensitivityPoint } from "@/lib/simulations/types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function safeNumber(n: unknown, fallback: number) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function paybackYears(upfrontEur: number, annualSavingsEur: number): number | null {
  if (upfrontEur <= 0) return 0;
  if (annualSavingsEur <= 0) return null;
  return round2(upfrontEur / annualSavingsEur);
}

export function buildCashflow({
  upfrontEur,
  annualSavingsEur,
  years = 15,
}: {
  upfrontEur: number;
  annualSavingsEur: number;
  years?: number;
}): CashflowPoint[] {
  const y = Math.max(5, Math.min(25, Math.round(years)));
  const points: CashflowPoint[] = [];
  let cumulative = -Math.max(0, upfrontEur);
  points.push({ year: 0, cumulativeEur: round2(cumulative) });
  for (let i = 1; i <= y; i++) {
    cumulative += Math.max(0, annualSavingsEur);
    points.push({ year: i, cumulativeEur: round2(cumulative) });
  }
  return points;
}

export function buildSensitivity({
  upfrontEur,
  baseAnnualSavingsEur,
  multipliers = [0.7, 0.85, 1, 1.15, 1.3],
}: {
  upfrontEur: number;
  baseAnnualSavingsEur: number;
  multipliers?: number[];
}): SensitivityPoint[] {
  const base = Math.max(0, baseAnnualSavingsEur);
  return multipliers.map((m) => {
    const annual = base * clamp(m, 0.2, 2.5);
    return {
      label: `${Math.round(m * 100)}%`,
      monthlySavingsEur: round2(annual / 12),
      paybackYears: paybackYears(upfrontEur, annual),
    };
  });
}

