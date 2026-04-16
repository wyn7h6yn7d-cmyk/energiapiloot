import type { SimulationType } from "@/lib/simulations/types";
import type { ReportType } from "@/lib/reports/types";

export type PlanId = "free" | "plus" | "pro" | "business";

export type BillingInterval = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  highlight?: boolean;
  badge?: string;
  pricing: {
    monthlyEur: number | null;
    yearlyEur: number | null; // total per year (not per month)
  };
  stripe: {
    monthlyPriceId?: string;
    yearlyPriceId?: string;
  };
  features: string[];
};

export type Entitlements = {
  planId: PlanId;
  advancedRecommendations: boolean;
  allowedSimulationTypes: SimulationType[];
  savedScenarioLimit: number; // -1 = unlimited
  reports: {
    allowed: boolean;
    allowedTypes: ReportType[];
  };
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Selge baas. Kiire võit.",
    pricing: { monthlyEur: 0, yearlyEur: 0 },
    stripe: {},
    features: [
      "Dashboardi baasülevaade",
      "Põhilised insight’id",
      "Kuni 1 salvestatud stsenaarium",
      "Üks simulaator (Päike)",
      "Raportid: piiratud",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "Rohkem kontrolli. Rohkem selgust.",
    pricing: { monthlyEur: 9, yearlyEur: 90 },
    stripe: {},
    features: [
      "Kõik Free-st",
      "Täiustatud soovitused (osa)",
      "Rohkem simulaatoreid (Päike + EV + Peak shaving)",
      "Kuni 5 salvestatud stsenaariumi",
      "Raportid: kokkuvõtted",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Täielik tööriistakast otsusteks.",
    highlight: true,
    badge: "Soovitus",
    pricing: { monthlyEur: 19, yearlyEur: 190 },
    stripe: {},
    features: [
      "Kõik Plus-st",
      "Täiustatud soovitused",
      "Kõik MVP simulaatorid",
      "Piiramatu stsenaarium",
      "Raportid + print/PDF",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Meeskonnale ja mitmele objektile.",
    pricing: { monthlyEur: 49, yearlyEur: 490 },
    stripe: {},
    features: [
      "Kõik Pro-st",
      "Mitme kasutaja tugi (org)",
      "Mitme objekti tugi",
      "Rollid ja audit (tulemas)",
      "Prioriteetne tugi",
    ],
  },
];

export function entitlementsForPlan(planId: PlanId): Entitlements {
  const allSims: SimulationType[] = ["solar", "battery", "ev_charger", "heat_pump", "peak_shaving"];
  const allReports: ReportType[] = [
    "monthly_energy_summary",
    "contract_risk_summary",
    "savings_opportunity_summary",
    "investment_simulation_report",
  ];

  if (planId === "business") {
    return {
      planId,
      advancedRecommendations: true,
      allowedSimulationTypes: allSims,
      savedScenarioLimit: -1,
      reports: { allowed: true, allowedTypes: allReports },
    };
  }

  if (planId === "pro") {
    return {
      planId,
      advancedRecommendations: true,
      allowedSimulationTypes: allSims,
      savedScenarioLimit: -1,
      reports: { allowed: true, allowedTypes: allReports },
    };
  }

  if (planId === "plus") {
    return {
      planId,
      advancedRecommendations: true,
      allowedSimulationTypes: ["solar", "ev_charger", "peak_shaving"],
      savedScenarioLimit: 5,
      reports: {
        allowed: true,
        allowedTypes: ["monthly_energy_summary", "contract_risk_summary", "savings_opportunity_summary"],
      },
    };
  }

  // Free
  return {
    planId: "free",
    advancedRecommendations: false,
    allowedSimulationTypes: ["solar"],
    savedScenarioLimit: 1,
    reports: { allowed: true, allowedTypes: ["monthly_energy_summary"] },
  };
}

export function formatPrice(planId: PlanId, interval: BillingInterval) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return "—";
  const v = interval === "monthly" ? plan.pricing.monthlyEur : plan.pricing.yearlyEur;
  if (v === null) return "Kokkuleppel";
  if (v === 0) return "0 €";
  return interval === "monthly" ? `${v} € / kuu` : `${v} € / aasta`;
}

