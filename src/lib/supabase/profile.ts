import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserType = "household" | "business";
export type ObjectType = "apartment" | "house" | "office" | "shop" | "warehouse" | "other";
export type ContractType = "spot" | "fixed" | "hybrid" | "unknown";
export type EnergyAsset = "solar" | "battery" | "ev" | "heat_pump" | "none";
export type Goal =
  | "reduce_bill"
  | "compare_contract"
  | "evaluate_investment"
  | "monitor_usage"
  | "understand_risks";

export type DataConnectionState = "none" | "estfeed_pending" | "estfeed_connected";

export type Profile = {
  user_id: string;
  onboarded: boolean;
  user_type: UserType | null;
  display_name?: string | null;
  company_name?: string | null;
  notification_prefs?: Record<string, unknown> | null;
  primary_site_id?: string | null;
  object_name: string | null;
  object_type: ObjectType | null;
  contract_type: ContractType | null;
  assets: EnergyAsset[] | null;
  goal: Goal | null;
  site_address?: unknown | null;
  business_registry_code?: string | null;
  data_connection?: DataConnectionState | null;
};

export async function getMyProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { profile: null, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "user_id,onboarded,user_type,display_name,company_name,notification_prefs,primary_site_id,object_name,object_type,contract_type,assets,goal,site_address,business_registry_code,data_connection"
    )
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return { profile: (profile as Profile | null) ?? null, user: auth.user };
}

