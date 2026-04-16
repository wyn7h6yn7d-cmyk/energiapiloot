// Stripe-ready plan identifiers. Actual paywall logic lives in `src/lib/billing/*`.
export type PlanId = "free" | "plus" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthlyEur: number | null;
  stripePriceId?: string;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", priceMonthlyEur: 0 },
  { id: "plus", name: "Plus", priceMonthlyEur: 9, stripePriceId: undefined },
  { id: "pro", name: "Pro", priceMonthlyEur: 19, stripePriceId: undefined },
  { id: "business", name: "Business", priceMonthlyEur: 49, stripePriceId: undefined },
];

