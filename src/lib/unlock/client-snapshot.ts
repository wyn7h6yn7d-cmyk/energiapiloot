import {
  ENTITLEMENTS_COOKIE_NAME,
  PREMIUM_COOKIE_FULL_VALUE,
  PREMIUM_COOKIE_NAME,
  PREMIUM_STORAGE_KEY,
} from "./constants";
import { ALL_UNLOCK_ENTITLEMENTS } from "./entitlements";
import type { ClientUnlockSnapshot, UnlockEntitlement } from "./types";
import { mergeGrantSets } from "./merge-grants";
import { parseEntitlementCsv } from "./parse-entitlements";

function readDocumentCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function parseDevStorage(raw: string | null): Set<UnlockEntitlement> | null {
  if (!raw) return null;
  if (raw === "1") {
    return new Set(ALL_UNLOCK_ENTITLEMENTS);
  }
  try {
    const parsed = JSON.parse(raw) as { grants?: unknown };
    if (!Array.isArray(parsed.grants)) {
      return null;
    }
    const out = new Set<UnlockEntitlement>();
    for (const g of parsed.grants) {
      if (typeof g === "string" && ALL_UNLOCK_ENTITLEMENTS.has(g as UnlockEntitlement)) {
        out.add(g as UnlockEntitlement);
      }
    }
    return out.size > 0 ? out : null;
  } catch {
    return null;
  }
}

/**
 * Build unlock state in the browser (legacy cookie, granular cookie, dev storage).
 * Presentation components should not call this directly — use `useUnlockSnapshot()`.
 */
export function buildClientUnlockSnapshot(): ClientUnlockSnapshot {
  const legacy = readDocumentCookie(PREMIUM_COOKIE_NAME);
  const granularRaw = readDocumentCookie(ENTITLEMENTS_COOKIE_NAME);

  let grants = new Set<UnlockEntitlement>();
  let cookieHadData = false;

  if (legacy === PREMIUM_COOKIE_FULL_VALUE) {
    grants = new Set(ALL_UNLOCK_ENTITLEMENTS);
    cookieHadData = true;
  } else {
    grants = parseEntitlementCsv(granularRaw);
    cookieHadData = grants.size > 0;
  }

  let storageGrants: Set<UnlockEntitlement> | null = null;
  try {
    storageGrants = parseDevStorage(localStorage.getItem(PREMIUM_STORAGE_KEY));
  } catch {
    /* ignore */
  }

  let source: ClientUnlockSnapshot["source"] = "none";
  if (cookieHadData && storageGrants && storageGrants.size > 0) {
    grants = mergeGrantSets(grants, storageGrants);
    source = "mixed";
  } else if (cookieHadData) {
    source = "cookie";
  } else if (storageGrants && storageGrants.size > 0) {
    grants = storageGrants;
    source = "storage";
  }

  return { grants, source };
}
