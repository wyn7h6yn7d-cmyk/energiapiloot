export type PlanId = "free" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthlyEur: number | null;
  stripePriceId?: string;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", priceMonthlyEur: 0 },
  { id: "pro", name: "Pro", priceMonthlyEur: 12, stripePriceId: undefined },
];

