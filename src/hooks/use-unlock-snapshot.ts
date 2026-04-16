"use client";

import { useCallback, useEffect, useState } from "react";

import { buildClientUnlockSnapshot } from "@/lib/unlock/client-snapshot";
import { PREMIUM_STORAGE_KEY } from "@/lib/unlock/constants";
import { ALL_UNLOCK_ENTITLEMENTS, isUnlockGranted } from "@/lib/unlock/entitlements";
import type { ClientUnlockSnapshot, UnlockEntitlement } from "@/lib/unlock/types";

const emptySnapshot: ClientUnlockSnapshot = {
  grants: new Set(),
  source: "none",
};

/**
 * Browser unlock state: cookies (`ep_unlock`, `ep_entitlements`) + dev `localStorage`.
 * `?unlock=demo` seeds full grants in storage (same as before).
 */
export function useUnlockSnapshot() {
  const [snapshot, setSnapshot] = useState<ClientUnlockSnapshot>(emptySnapshot);

  const refresh = useCallback(() => {
    setSnapshot(buildClientUnlockSnapshot());
  }, []);

  useEffect(() => {
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
