"use client";

import { useUnlockSnapshot } from "@/hooks/use-unlock-snapshot";

/**
 * `true` when premium **results** are unlocked (cookie, granular entitlement, demo storage, or legacy `full`).
 */
export function usePremiumAccess(): boolean {
  const { hasPremiumResults } = useUnlockSnapshot();
  return hasPremiumResults;
}
