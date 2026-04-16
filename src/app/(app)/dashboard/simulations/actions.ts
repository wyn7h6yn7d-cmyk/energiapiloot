"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateMyPrimarySite } from "@/lib/supabase/site";
import { getMyEntitlements } from "@/lib/billing/server";
import type { SimulationType } from "@/lib/simulations/types";

export type ScenarioDTO = {
  id: string;
  site_id: string;
  simulation_type: SimulationType;
  name: string;
  description: string | null;
  config: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export async function listScenariosAction(): Promise<ScenarioDTO[]> {
  const supabase = await createSupabaseServerClient();
  const site = await getOrCreateMyPrimarySite();

  const { data, error } = await supabase
    .from("saved_scenarios")
    .select("id,site_id,simulation_type,name,description,config,is_favorite,created_at,updated_at")
    .eq("site_id", site.id)
    .order("is_favorite", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as ScenarioDTO[]) ?? [];
}

export async function saveScenarioAction(input: {
  simulation_type: SimulationType;
  name: string;
  description?: string | null;
  config: Record<string, unknown>;
}): Promise<ScenarioDTO> {
  const supabase = await createSupabaseServerClient();
  const site = await getOrCreateMyPrimarySite();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const ent = await getMyEntitlements();
  if (!ent.allowedSimulationTypes.includes(input.simulation_type)) {
    throw new Error("Sinu pakett ei sisalda seda simulaatorit.");
  }
  if (ent.savedScenarioLimit !== -1) {
    const { count } = await supabase
      .from("saved_scenarios")
      .select("id", { count: "exact", head: true })
      .eq("site_id", site.id);
    if ((count ?? 0) >= ent.savedScenarioLimit) {
      throw new Error(`Salvestatud stsenaariumide limiit (${ent.savedScenarioLimit}) on täis.`);
    }
  }

  const { data, error } = await supabase
    .from("saved_scenarios")
    .insert({
      site_id: site.id,
      simulation_type: input.simulation_type,
      name: input.name,
      description: input.description ?? null,
      config: input.config,
      created_by: auth.user.id,
    })
    .select("id,site_id,simulation_type,name,description,config,is_favorite,created_at,updated_at")
    .single();

  if (error) throw error;
  revalidatePath("/dashboard/simulations");
  return data as ScenarioDTO;
}

export async function renameScenarioAction(input: {
  id: string;
  name: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("saved_scenarios").update({ name: input.name }).eq("id", input.id);
  if (error) throw error;
  revalidatePath("/dashboard/simulations");
}

export async function toggleFavoriteScenarioAction(input: {
  id: string;
  is_favorite: boolean;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("saved_scenarios")
    .update({ is_favorite: input.is_favorite })
    .eq("id", input.id);
  if (error) throw error;
  revalidatePath("/dashboard/simulations");
}

export async function deleteScenarioAction(input: { id: string }): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("saved_scenarios").delete().eq("id", input.id);
  if (error) throw error;
  revalidatePath("/dashboard/simulations");
}

export async function duplicateScenarioAction(input: { id: string }): Promise<ScenarioDTO> {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const { data: src, error: srcErr } = await supabase
    .from("saved_scenarios")
    .select("site_id,simulation_type,name,description,config")
    .eq("id", input.id)
    .single();
  if (srcErr) throw srcErr;

  const { data, error } = await supabase
    .from("saved_scenarios")
    .insert({
      site_id: (src as any).site_id,
      simulation_type: (src as any).simulation_type,
      name: `${(src as any).name} (koopia)`,
      description: (src as any).description ?? null,
      config: (src as any).config ?? {},
      created_by: auth.user.id,
    })
    .select("id,site_id,simulation_type,name,description,config,is_favorite,created_at,updated_at")
    .single();

  if (error) throw error;
  revalidatePath("/dashboard/simulations");
  return data as ScenarioDTO;
}

