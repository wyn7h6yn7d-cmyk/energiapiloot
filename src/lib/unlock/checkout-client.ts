import { getUnlockOffer } from "./product-unlock-config";
import type { UnlockOfferId } from "./types";

export type UnlockCheckoutStartResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; status: number; error: string; message?: string };

/**
 * Start Stripe Checkout when the API returns `{ checkoutUrl }`.
 * Until Stripe is wired, the route returns 501 — use `fallbackHref` in the button.
 */
export async function startUnlockCheckout(params: {
  offerId: UnlockOfferId;
  returnUrl?: string;
}): Promise<UnlockCheckoutStartResult> {
  if (!getUnlockOffer(params.offerId)) {
    return { ok: false, status: 400, error: "unknown_offer" };
  }

  const returnUrl = params.returnUrl ?? (typeof window !== "undefined" ? window.location.href : undefined);

  const res = await fetch("/api/checkout/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      offerId: params.offerId,
      returnUrl,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (res.ok && typeof data.checkoutUrl === "string") {
    return { ok: true, checkoutUrl: data.checkoutUrl };
  }

  return {
    ok: false,
    status: res.status,
    error: String(data.error ?? "checkout_failed"),
    message: typeof data.message === "string" ? data.message : undefined,
  };
}
