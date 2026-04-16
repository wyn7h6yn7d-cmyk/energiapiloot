/**
 * Legacy re-exports — prefer `@/lib/unlock` for new code.
 */

export type PremiumUnlockTier = "none" | "full";

export {
  PREMIUM_COOKIE_NAME,
  PREMIUM_COOKIE_FULL_VALUE,
  PREMIUM_STORAGE_KEY,
  ENTITLEMENTS_COOKIE_NAME,
} from "@/lib/unlock/constants";

export type { UnlockEntitlement, UnlockOfferId } from "@/lib/unlock/types";
