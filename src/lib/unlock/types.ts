/**
 * Purchase-granted capabilities (cookie / future Stripe metadata).
 * Keep keys stable — they may be stored in cookies and checkout metadata.
 */
export const UNLOCK_ENTITLEMENTS = ["premium_results", "report", "download"] as const;
export type UnlockEntitlement = (typeof UNLOCK_ENTITLEMENTS)[number];

export const UNLOCK_OFFER_IDS = [
  "ep_offer_premium_results",
  "ep_offer_report",
  "ep_offer_download",
  "ep_offer_bundle_all",
] as const;
export type UnlockOfferId = (typeof UNLOCK_OFFER_IDS)[number];

/** Client-side snapshot of what the browser considers unlocked (cookies + dev storage). */
export type ClientUnlockSnapshot = {
  readonly grants: ReadonlySet<UnlockEntitlement>;
  /** Where grants were last merged from (best-effort, for debugging). */
  readonly source: "none" | "cookie" | "storage" | "mixed";
};
