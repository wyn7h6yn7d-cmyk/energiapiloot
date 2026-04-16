import type { UnlockEntitlement, UnlockOfferId } from "./types";

/**
 * Product / price mapping for Stripe Checkout (placeholders).
 * `stripePriceEnvKey` is the server env name for the Price ID when checkout goes live.
 */
export type UnlockOffer = {
  id: UnlockOfferId;
  label: string;
  description?: string;
  grants: readonly UnlockEntitlement[];
  stripePriceEnvKey?: string;
};

export const UNLOCK_OFFERS: readonly UnlockOffer[] = [
  {
    id: "ep_offer_premium_results",
    label: "Täisvaate tulemused",
    description: "Sügavad simulatsioonid, täis graafikud ja analüüsikihid brauseris.",
    grants: ["premium_results"],
    stripePriceEnvKey: "STRIPE_PRICE_UNLOCK_PREMIUM_RESULTS",
  },
  {
    id: "ep_offer_report",
    label: "Interaktiivne kokkuvõte",
    description: "Sama analüüs brauseris — võrdlused, mälu ja jagamine ühes vaates.",
    grants: ["report"],
    stripePriceEnvKey: "STRIPE_PRICE_UNLOCK_REPORT",
  },
  {
    id: "ep_offer_download",
    label: "Laaditav PDF",
    description: "Laaditav dokument ja jagatav kokkuvõte.",
    grants: ["download"],
    stripePriceEnvKey: "STRIPE_PRICE_UNLOCK_DOWNLOAD",
  },
  {
    id: "ep_offer_bundle_all",
    label: "Kogu pakett",
    description: "Täisvaade, interaktiivne kokkuvõte ja laaditav PDF ühes ostus.",
    grants: ["premium_results", "report", "download"],
    stripePriceEnvKey: "STRIPE_PRICE_UNLOCK_BUNDLE",
  },
];

export function getUnlockOffer(offerId: string): UnlockOffer | undefined {
  return UNLOCK_OFFERS.find((o) => o.id === offerId);
}

export function isKnownUnlockOfferId(id: string): id is UnlockOfferId {
  return UNLOCK_OFFERS.some((o) => o.id === id);
}
