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

export type Profile = {
  user_id: string;
  onboarded: boolean;
  user_type: UserType | null;
  object_name: string | null;
  object_type: ObjectType | null;
  contract_type: ContractType | null;
  assets: EnergyAsset[] | null;
  goal: Goal | null;
};

export async function getMyProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { profile: null, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id,onboarded,user_type,object_name,object_type,contract_type,assets,goal")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return { profile: (profile as Profile | null) ?? null, user: auth.user };
}

