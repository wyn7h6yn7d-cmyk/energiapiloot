/**
 * Future Stripe + premium PDF unlocks.
 * Cookie `ep_unlock=full` will be set after successful checkout (server-side).
 */

export const PREMIUM_COOKIE_NAME = "ep_unlock";
export const PREMIUM_COOKIE_FULL_VALUE = "full";

export type PremiumUnlockTier = "none" | "full";

export const PREMIUM_STORAGE_KEY = "ep_unlock_dev";
