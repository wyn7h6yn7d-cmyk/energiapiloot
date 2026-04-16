import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdapters } from "@/lib/api/adapters/registry";

function isoDate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const querySchema = z.object({
  area: z.string().min(2).max(4).default("EE"),
  days: z.coerce.number().int().min(1).max(3).default(2),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    area: url.searchParams.get("area") ?? undefined,
    days: url.searchParams.get("days") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_query" }, { status: 400 });
  }

  const { nordPool } = getAdapters();
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
  const end = new Date(start.getTime() + (parsed.data.days - 1) * 24 * 3600 * 1000);

  const fromDate = isoDate(start);
  const toDate = isoDate(end);

  const r = await nordPool.getDayAheadPrices({
    area: parsed.data.area.toUpperCase() as any,
    fromDate,
    toDate,
  });
  if (!r.ok) {
    return NextResponse.json(
      { ok: false, error: r.error.code ?? "UPSTREAM", message: r.error.message, fromDate, toDate },
      { status: 502 }
    );
  }

  const points = r.data.points
    .filter((p) => p && typeof p.value === "number" && typeof p.ts === "string")
    .map((p) => ({ ts: p.ts, eurPerMwh: p.value }));

  return NextResponse.json(
    {
      ok: true,
      area: r.data.area,
      currency: r.data.currency,
      contractType: r.data.contractType,
      source: r.data.source,
      fromDate,
      toDate,
      points,
    },
    { status: 200, headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } }
  );
}

