import { cookies } from "next/headers";

import { FULL_ACCESS_TEST_MODE } from "@/lib/feature-flags";
import {
  ENTITLEMENTS_COOKIE_NAME,
  PREMIUM_COOKIE_FULL_VALUE,
  PREMIUM_COOKIE_NAME,
} from "./constants";
import { ALL_UNLOCK_ENTITLEMENTS } from "./entitlements";
import type { UnlockEntitlement } from "./types";
import { parseEntitlementCsv } from "./parse-entitlements";

/**
 * Read entitlements from request cookies (Route Handlers, Server Components).
 * Future: verify signed session / Stripe webhook before trusting values.
 */
export async function getServerUnlockGrants(): Promise<ReadonlySet<UnlockEntitlement>> {
  if (FULL_ACCESS_TEST_MODE) {
    return ALL_UNLOCK_ENTITLEMENTS;
  }
  const store = await cookies();
  const legacy = store.get(PREMIUM_COOKIE_NAME)?.value;
  if (legacy === PREMIUM_COOKIE_FULL_VALUE) {
    return ALL_UNLOCK_ENTITLEMENTS;
  }
  const granular = store.get(ENTITLEMENTS_COOKIE_NAME)?.value;
  return parseEntitlementCsv(granular);
}

export function isUnlockGrantedOnServer(
  grants: ReadonlySet<UnlockEntitlement>,
  entitlement: UnlockEntitlement
): boolean {
  return grants.has(entitlement);
}
