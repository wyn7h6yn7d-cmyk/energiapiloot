import { NextResponse } from "next/server";

import { getUnlockOffer } from "@/lib/unlock/product-unlock-config";

type UnlockBody = {
  offerId?: string;
  returnUrl?: string;
  /** Future: pass-through when creating Checkout Session */
  priceId?: string;
};

/**
 * Future: create Stripe Checkout Session from `offerId` → configured Price env.
 * POST body: { offerId: string; returnUrl?: string }
 */
export async function POST(req: Request) {
  let body: UnlockBody;
  try {
    body = (await req.json()) as UnlockBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const offerId = typeof body.offerId === "string" ? body.offerId : "";
  const offer = getUnlockOffer(offerId);
  if (!offer) {
    return NextResponse.json({ ok: false, error: "unknown_offer", offerId }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "checkout_not_live",
      message: "Stripe makselink tuleb siia järgmises versioonis.",
      acceptedOfferId: offer.id,
      wouldGrant: offer.grants,
      stripePriceEnvKey: offer.stripePriceEnvKey ?? null,
      nextStep: "stripe_checkout_session",
    },
    { status: 501 }
  );
}
