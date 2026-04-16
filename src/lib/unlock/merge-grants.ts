import type { UnlockEntitlement } from "./types";

export function mergeGrantSets(
  a: ReadonlySet<UnlockEntitlement>,
  b: ReadonlySet<UnlockEntitlement>
): Set<UnlockEntitlement> {
  return new Set([...a, ...b]);
}
