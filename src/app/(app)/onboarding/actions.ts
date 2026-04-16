"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContractType, EnergyAsset, Goal, ObjectType, UserType } from "@/lib/supabase/profile";

export async function saveOnboardingAction(formData: FormData) {
  const user_type = String(formData.get("user_type") ?? "") as UserType;
  const object_name = String(formData.get("object_name") ?? "").trim();
  const object_type = String(formData.get("object_type") ?? "") as ObjectType;
  const contract_type = String(formData.get("contract_type") ?? "unknown") as ContractType;
  const goal = String(formData.get("goal") ?? "") as Goal;
  const assetsRaw = formData.getAll("assets").map((v) => String(v)) as EnergyAsset[];
  const assets = assetsRaw.length ? assetsRaw : (["none"] as EnergyAsset[]);

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?error=" + encodeURIComponent("Palun logi sisse."));

  const { error } = await supabase.from("profiles").upsert({
    user_id: auth.user!.id,
    onboarded: true,
    user_type,
    object_name,
    object_type,
    contract_type,
    assets,
    goal,
  });

  if (error) {
    redirect("/onboarding?error=" + encodeURIComponent("Onboardingu salvestamine ebaõnnestus."));
  }

  redirect("/dashboard");
}

