"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateMyPrimarySite } from "@/lib/supabase/site";

export type SettingsProfileDTO = {
  user_id: string;
  display_name: string | null;
  user_type: string | null;
  company_name: string | null;
  object_name: string | null;
  object_type: string | null;
  notification_prefs: Record<string, unknown>;
  primary_site_id: string | null;
};

export type SiteDTO = {
  id: string;
  name: string;
  object_type: string;
  country: string | null;
  timezone: string | null;
  owner_user_id: string | null;
  owner_organization_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetDTO = {
  id: string;
  site_id: string;
  asset_type: string;
  name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ContractDTO = {
  id: string;
  site_id: string;
  provider_name: string | null;
  contract_type: string;
  currency: string;
  notes: string | null;
  starts_on: string | null;
  ends_on: string | null;
  created_at: string;
  updated_at: string;
};

export async function getSettingsDataAction() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/dashboard/settings");

  // ensure at least one site exists
  await getOrCreateMyPrimarySite();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "user_id,display_name,user_type,company_name,object_name,object_type,notification_prefs,primary_site_id"
    )
    .eq("user_id", auth.user.id)
    .maybeSingle();

  const { data: sites } = await supabase
    .from("sites")
    .select("id,name,object_type,country,timezone,owner_user_id,owner_organization_id,created_at,updated_at")
    .or(`owner_user_id.eq.${auth.user.id},created_by.eq.${auth.user.id}`)
    .order("created_at", { ascending: true });

  const primarySiteId = (profile as any)?.primary_site_id ?? (sites as any)?.[0]?.id ?? null;

  const { data: assets } = await supabase
    .from("energy_assets")
    .select("id,site_id,asset_type,name,metadata,created_at,updated_at")
    .eq("site_id", primarySiteId ?? (sites as any)?.[0]?.id ?? "");

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id,site_id,provider_name,contract_type,currency,notes,starts_on,ends_on,created_at,updated_at")
    .eq("site_id", primarySiteId ?? (sites as any)?.[0]?.id ?? "");

  return {
    userEmail: auth.user.email ?? null,
    profile: (profile as SettingsProfileDTO | null) ?? null,
    sites: (sites as SiteDTO[]) ?? [],
    assets: (assets as AssetDTO[]) ?? [],
    contracts: (contracts as ContractDTO[]) ?? [],
  };
}

export async function updateProfileAction(input: {
  display_name?: string | null;
  company_name?: string | null;
  notification_prefs?: Record<string, unknown>;
  primary_site_id?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.display_name ?? null,
      company_name: input.company_name ?? null,
      notification_prefs: input.notification_prefs ?? {},
      primary_site_id: input.primary_site_id ?? null,
    })
    .eq("user_id", auth.user.id);
  if (error) throw error;
  revalidatePath("/dashboard/settings");
}

export async function upsertSiteAction(input: {
  id?: string;
  name: string;
  object_type: string;
  country?: string | null;
  timezone?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  if (input.id) {
    const { error } = await supabase
      .from("sites")
      .update({
        name: input.name,
        object_type: input.object_type,
        country: input.country ?? null,
        timezone: input.timezone ?? null,
      })
      .eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("sites").insert({
      owner_user_id: auth.user.id,
      owner_organization_id: null,
      name: input.name,
      object_type: input.object_type,
      country: input.country ?? "EE",
      timezone: input.timezone ?? "Europe/Tallinn",
      created_by: auth.user.id,
    });
    if (error) throw error;
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteSiteAction(input: { id: string }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("sites").delete().eq("id", input.id);
  if (error) throw error;
  revalidatePath("/dashboard/settings");
}

export async function upsertAssetAction(input: {
  id?: string;
  site_id: string;
  asset_type: string;
  name?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  if (input.id) {
    const { error } = await supabase
      .from("energy_assets")
      .update({
        asset_type: input.asset_type,
        name: input.name ?? null,
        metadata: input.metadata ?? {},
      })
      .eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("energy_assets").insert({
      site_id: input.site_id,
      asset_type: input.asset_type,
      name: input.name ?? null,
      metadata: input.metadata ?? {},
      created_by: auth.user.id,
    });
    if (error) throw error;
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteAssetAction(input: { id: string }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("energy_assets").delete().eq("id", input.id);
  if (error) throw error;
  revalidatePath("/dashboard/settings");
}

export async function upsertContractAction(input: {
  id?: string;
  site_id: string;
  provider_name?: string | null;
  contract_type: string;
  currency?: string;
  notes?: string | null;
  starts_on?: string | null;
  ends_on?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  if (input.id) {
    const { error } = await supabase
      .from("contracts")
      .update({
        provider_name: input.provider_name ?? null,
        contract_type: input.contract_type,
        currency: input.currency ?? "EUR",
        notes: input.notes ?? null,
        starts_on: input.starts_on ?? null,
        ends_on: input.ends_on ?? null,
      })
      .eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("contracts").insert({
      site_id: input.site_id,
      provider_name: input.provider_name ?? null,
      contract_type: input.contract_type,
      currency: input.currency ?? "EUR",
      notes: input.notes ?? null,
      starts_on: input.starts_on ?? null,
      ends_on: input.ends_on ?? null,
      created_by: auth.user.id,
    });
    if (error) throw error;
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteContractAction(input: { id: string }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contracts").delete().eq("id", input.id);
  if (error) throw error;
  revalidatePath("/dashboard/settings");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

