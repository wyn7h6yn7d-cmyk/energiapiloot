"use server";

import { getMyEntitlements } from "@/lib/billing/server";

export async function getMyEntitlementsAction() {
  return await getMyEntitlements();
}

