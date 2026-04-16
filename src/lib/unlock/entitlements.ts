import type { ClientUnlockSnapshot, UnlockEntitlement } from "./types";
import { UNLOCK_ENTITLEMENTS } from "./types";

export const ALL_UNLOCK_ENTITLEMENTS: ReadonlySet<UnlockEntitlement> = new Set(UNLOCK_ENTITLEMENTS);

export function isUnlockGranted(snapshot: ClientUnlockSnapshot, entitlement: UnlockEntitlement): boolean {
  return snapshot.grants.has(entitlement);
}
