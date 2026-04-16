"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { entitlementsForPlan, type Entitlements, type PlanId } from "@/lib/billing/plans";

export type SubscriptionRow = {
  id: string;
  owner_user_id: string | null;
  owner_organization_id: string | null;
  plan_id: PlanId;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export async function getOrCreateMySubscription(): Promise<SubscriptionRow> {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const { data: existing, error: selErr } = await supabase
    .from("subscription_status")
    .select(
      "id,owner_user_id,owner_organization_id,plan_id,status,stripe_customer_id,stripe_subscription_id,current_period_end,cancel_at_period_end,created_at,updated_at"
    )
    .eq("owner_user_id", auth.user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing as SubscriptionRow;

  const { data: created, error } = await supabase
    .from("subscription_status")
    .insert({
      owner_user_id: auth.user.id,
      owner_organization_id: null,
      plan_id: "free",
      status: "active",
      created_by: auth.user.id,
    })
    .select(
      "id,owner_user_id,owner_organization_id,plan_id,status,stripe_customer_id,stripe_subscription_id,current_period_end,cancel_at_period_end,created_at,updated_at"
    )
    .single();

  if (error) throw error;
  return created as SubscriptionRow;
}

export async function getMyEntitlements(): Promise<Entitlements> {
  try {
    const sub = await getOrCreateMySubscription();
    const planId = (sub.plan_id ?? "free") as PlanId;
    return entitlementsForPlan(planId);
  } catch {
    return entitlementsForPlan("free");
  }
}

