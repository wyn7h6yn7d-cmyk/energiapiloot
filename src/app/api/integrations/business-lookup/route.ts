import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdapters } from "@/lib/api/adapters/registry";

const querySchema = z.object({
  // Backward compatible: legacy used `code=...`; new UI uses `q=...` for name search.
  q: z.string().min(2).max(120).optional(),
  code: z.string().min(2).max(120).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    code: url.searchParams.get("code") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ company: null }, { status: 200 });
  }

  const query = (parsed.data.q ?? parsed.data.code ?? "").trim();
  if (!query) return NextResponse.json({ company: null }, { status: 200 });

  const { businessRegistry, env } = getAdapters();
  const r = await businessRegistry.lookup(query);
  if (!r.ok) {
    return NextResponse.json(
      { error: r.error.message, code: r.error.code },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { company: r.data[0] ?? null, ttlSec: env.CACHE_COMPANY_TTL_SEC },
    { status: 200, headers: { "Cache-Control": "private, max-age=120" } }
  );
}
