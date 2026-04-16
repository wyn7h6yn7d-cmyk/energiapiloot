/**
 * Cookie & storage names for unlock state.
 * Legacy: `ep_unlock=full` means all entitlements (Stripe success path can keep using this).
 * Granular: `ep_entitlements` comma-separated entitlement keys.
 */
export const PREMIUM_COOKIE_NAME = "ep_unlock";
export const PREMIUM_COOKIE_FULL_VALUE = "full";

export const ENTITLEMENTS_COOKIE_NAME = "ep_entitlements";

/** Dev / demo persistence until Stripe sets HTTP-only cookies */
export const PREMIUM_STORAGE_KEY = "ep_unlock_dev";
