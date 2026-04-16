"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseSiteAddressJson } from "@/lib/server/repositories/user-energy-context";
import type {
  ContractType,
  DataConnectionState,
  EnergyAsset,
  Goal,
  ObjectType,
  UserType,
} from "@/lib/supabase/profile";

export async function saveOnboardingAction(formData: FormData) {
  const user_type = String(formData.get("user_type") ?? "") as UserType;
  const object_name = String(formData.get("object_name") ?? "").trim();
  const object_type = String(formData.get("object_type") ?? "") as ObjectType;
  const contract_type = String(formData.get("contract_type") ?? "unknown") as ContractType;
  const goal = String(formData.get("goal") ?? "") as Goal;
  const assetsRaw = formData.getAll("assets").map((v) => String(v)) as EnergyAsset[];
  const assets = assetsRaw.length ? assetsRaw : (["none"] as EnergyAsset[]);
  const company_name = String(formData.get("company_name") ?? "").trim();
  const business_registry_code = String(formData.get("business_registry_code") ?? "").trim();
  const data_connection = String(formData.get("data_connection") ?? "none") as DataConnectionState;

  const siteAddressRaw = String(formData.get("site_address_json") ?? "").trim();
  let site_address: unknown = null;
  if (siteAddressRaw) {
    try {
      const obj = JSON.parse(siteAddressRaw) as unknown;
      site_address = parseSiteAddressJson(obj);
    } catch {
      site_address = null;
    }
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?error=" + encodeURIComponent("Palun logi sisse."));

  const safeDataConnection: DataConnectionState =
    data_connection === "estfeed_pending" || data_connection === "estfeed_connected"
      ? data_connection
      : "none";

  const { error } = await supabase.from("profiles").upsert({
    user_id: auth.user!.id,
    onboarded: true,
    user_type,
    object_name,
    object_type,
    contract_type,
    assets,
    goal,
    company_name: user_type === "business" ? company_name || null : null,
    business_registry_code: user_type === "business" ? business_registry_code || null : null,
    site_address,
    data_connection: safeDataConnection,
  });

  if (error) {
    redirect("/onboarding?error=" + encodeURIComponent("Onboardingu salvestamine ebaõnnestus."));
  }

  redirect("/dashboard");
}

