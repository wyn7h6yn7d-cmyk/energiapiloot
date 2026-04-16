import { NextResponse } from "next/server";

/**
 * Future: create Stripe Checkout Session for premium unlock + optional PDF bundle.
 * POST body: { priceId?: string; returnUrl?: string }
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "checkout_not_live",
      message: "Stripe makselink tuleb siia järgmises versioonis.",
    },
    { status: 501 }
  );
}
