import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdapters } from "@/lib/api/adapters/registry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  code: z.string().min(6).max(12),
});

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ code: url.searchParams.get("code") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registry code" }, { status: 400 });
  }

  const { businessRegistry, env } = getAdapters();
  const r = await businessRegistry.lookup(parsed.data.code);
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
