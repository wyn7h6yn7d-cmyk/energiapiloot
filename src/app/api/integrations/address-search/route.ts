import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdapters } from "@/lib/api/adapters/registry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  q: z.string().min(2).max(120),
});

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ results: [] satisfies unknown[] }, { status: 200 });
  }

  const { address, env } = getAdapters();
  const r = await address.search(parsed.data.q);
  if (!r.ok) {
    return NextResponse.json({ error: r.error.message, code: r.error.code }, { status: 502 });
  }

  return NextResponse.json(
    { results: r.data, ttlSec: env.CACHE_ADDRESS_TTL_SEC },
    { status: 200, headers: { "Cache-Control": "private, max-age=60" } }
  );
}
