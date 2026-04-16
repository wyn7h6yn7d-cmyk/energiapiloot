"use client";

import { useCallback, useEffect, useState } from "react";

import { FULL_ACCESS_TEST_MODE } from "@/lib/feature-flags";
import { buildClientUnlockSnapshot } from "@/lib/unlock/client-snapshot";
import { PREMIUM_STORAGE_KEY } from "@/lib/unlock/constants";
import { ALL_UNLOCK_ENTITLEMENTS, isUnlockGranted } from "@/lib/unlock/entitlements";
import type { ClientUnlockSnapshot, UnlockEntitlement } from "@/lib/unlock/types";

const emptySnapshot: ClientUnlockSnapshot = {
  grants: new Set(),
  source: "none",
};

const fullAccessSnapshot: ClientUnlockSnapshot = {
  grants: new Set(ALL_UNLOCK_ENTITLEMENTS),
  source: "mixed",
};

/**
 * Browser unlock state: cookies (`ep_unlock`, `ep_entitlements`) + dev `localStorage`.
 * `?unlock=demo` seeds full grants in storage (same as before).
 */
export function useUnlockSnapshot() {
  const [snapshot, setSnapshot] = useState<ClientUnlockSnapshot>(
    FULL_ACCESS_TEST_MODE ? fullAccessSnapshot : emptySnapshot
  );

  const refresh = useCallback(() => {
    if (FULL_ACCESS_TEST_MODE) {
      setSnapshot(fullAccessSnapshot);
      return;
    }
    setSnapshot(buildClientUnlockSnapshot());
  }, []);

  useEffect(() => {
    if (FULL_ACCESS_TEST_MODE) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") === "demo") {
      try {
        localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify({ grants: [...ALL_UNLOCK_ENTITLEMENTS] }));
      } catch {
        /* ignore */
      }
      params.delete("unlock");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }

    refresh();
  }, [refresh]);

  useEffect(() => {
    if (FULL_ACCESS_TEST_MODE) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === PREMIUM_STORAGE_KEY) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return {
    snapshot,
    refresh,
    isGranted: (e: UnlockEntitlement) => isUnlockGranted(snapshot, e),
    hasPremiumResults: isUnlockGranted(snapshot, "premium_results"),
    hasReport: isUnlockGranted(snapshot, "report"),
    hasDownload: isUnlockGranted(snapshot, "download"),
  };
}
