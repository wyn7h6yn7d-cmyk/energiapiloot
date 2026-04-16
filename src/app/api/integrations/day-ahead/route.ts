import { NextResponse } from "next/server";

import { getAdapters } from "@/lib/api/adapters/registry";

function isoDate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const { nordPool } = getAdapters();
  const today = new Date();
  const fromDate = isoDate(today);
  const toDate = fromDate;

  const r = await nordPool.getDayAheadPrices({ area: "EE", fromDate, toDate });
  if (!r.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: r.error.code ?? "UPSTREAM",
        message: r.error.message,
        fromDate,
        toDate,
      },
      { status: 502 }
    );
  }

  const points = r.data.points
    .filter((p) => p && typeof p.value === "number")
    .slice(0, 48); // safety

  const values = points.map((p) => p.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = values.length ? sum / values.length : null;
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;

  return NextResponse.json(
    {
      ok: true,
      area: r.data.area,
      date: fromDate,
      unit: "eur_per_mwh",
      source: r.data.source,
      avgEurPerMwh: avg,
      minEurPerMwh: min,
      maxEurPerMwh: max,
      points: points.map((p) => ({ ts: p.ts, value: p.value })),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    }
  );
}

