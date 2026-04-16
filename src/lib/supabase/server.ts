import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

/**
 * Minimal server client scaffold.
 * We’ll upgrade this to SSR cookie-based auth helpers in the next phase.
 */
export async function createSupabaseServerClient() {
  // Touch cookies so this is request-scoped (and future auth wiring is straightforward).
  await cookies();

  return createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

