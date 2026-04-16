import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/supabase/profile";

export type SiteRow = {
  id: string;
  name: string;
  object_type: string;
  owner_user_id: string | null;
  owner_organization_id: string | null;
};

export async function getOrCreateMyPrimarySite(): Promise<SiteRow> {
  const supabase = await createSupabaseServerClient();
  const { user, profile } = await getMyProfile();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("sites")
    .select("id,name,object_type,owner_user_id,owner_organization_id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return existing as SiteRow;

  const name = profile?.object_name?.trim() || "Minu objekt";
  const object_type = profile?.object_type || "other";

  const { data: created, error } = await supabase
    .from("sites")
    .insert({
      owner_user_id: user.id,
      owner_organization_id: null,
      name,
      object_type,
      country: "EE",
      timezone: "Europe/Tallinn",
      created_by: user.id,
    })
    .select("id,name,object_type,owner_user_id,owner_organization_id")
    .single();

  if (error) throw error;
  return created as SiteRow;
}

