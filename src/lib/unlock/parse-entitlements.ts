import type { UnlockEntitlement } from "./types";
import { UNLOCK_ENTITLEMENTS } from "./types";

export const UNLOCK_ENTITLEMENT_KEY_SET: ReadonlySet<string> = new Set(UNLOCK_ENTITLEMENTS);

/** Parse a comma-separated list of entitlement keys from cookie or metadata. */
export function parseEntitlementCsv(raw: string | null | undefined): Set<UnlockEntitlement> {
  if (!raw?.trim()) return new Set();
  const out = new Set<UnlockEntitlement>();
  for (const part of raw.split(",")) {
    const k = part.trim();
    if (UNLOCK_ENTITLEMENT_KEY_SET.has(k)) {
      out.add(k as UnlockEntitlement);
    }
  }
  return out;
}
