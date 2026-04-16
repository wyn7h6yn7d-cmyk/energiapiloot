"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  // Create a placeholder profile row (onboarding will fill it).
  const userId = data.user?.id;
  if (userId) {
    await supabase.from("profiles").upsert({ user_id: userId, onboarded: false });
  }

  redirect("/onboarding");
}

