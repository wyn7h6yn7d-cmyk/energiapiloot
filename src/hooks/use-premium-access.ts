"use client";

import { useEffect, useState } from "react";

import { PREMIUM_COOKIE_FULL_VALUE, PREMIUM_COOKIE_NAME, PREMIUM_STORAGE_KEY } from "@/lib/product/premium";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * `true` when full premium preview is active (demo localStorage, cookie from future Stripe, or ?unlock=demo).
 */
export function usePremiumAccess(): boolean {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") === "demo") {
      try {
        localStorage.setItem(PREMIUM_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      params.delete("unlock");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }

    const fromStorage = (() => {
      try {
        return localStorage.getItem(PREMIUM_STORAGE_KEY) === "1";
      } catch {
        return false;
      }
    })();

    const fromCookie = readCookie(PREMIUM_COOKIE_NAME) === PREMIUM_COOKIE_FULL_VALUE;

    setUnlocked(fromStorage || fromCookie);
  }, []);

  return unlocked;
}
