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
    name: "Tasuta",
    tagline: "Selge stardipunkt, ilma kohustuseta.",
    pricing: { monthlyEur: 0, yearlyEur: 0 },
    stripe: {},
    features: [
      "Töölaua põhiülevaade",
      "Põhilised tarbimise ja lepingu hinnangud",
      "Kuni 1 salvestatud stsenaarium",
      "Üks simulaator: päikeseelektrijaam",
      "Aruanded: kuu kokkuvõte",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "Rohkem kontrolli. Rohkem selgust.",
    pricing: { monthlyEur: 9, yearlyEur: 90 },
    stripe: {},
    features: [
      "Kõik, mis Tasuta paketis",
      "Laiendatud soovitused (sh investeeringud)",
      "Rohkem simulaatoreid: päike, elektriauto, tipu tasakaalustamine",
      "Kuni 5 salvestatud stsenaariumi",
      "Aruanded: leping, säästud ja kuu kokkuvõte",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Täielik tööriistakast otsusteks.",
    highlight: true,
    badge: "Populaarne",
    pricing: { monthlyEur: 19, yearlyEur: 190 },
    stripe: {},
    features: [
      "Kõik, mis Plus paketis",
      "Täielik soovituste komplekt",
      "Kõik simulaatorid (päike, aku, EV, soojuspump, tipu tasakaalustamine)",
      "Piiramatu arv stsenaariume",
      "Aruanded printimiseks ja PDF-ks",
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

/** Full tool access for anonymous / marketing simulator routes (no account). */
export const PUBLIC_TOOL_ENTITLEMENTS: Entitlements = entitlementsForPlan("pro");

export function formatPrice(planId: PlanId, interval: BillingInterval) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return "—";
  const v = interval === "monthly" ? plan.pricing.monthlyEur : plan.pricing.yearlyEur;
  if (v === null) return "Kokkuleppel";
  if (v === 0) return "0 €";
  return interval === "monthly" ? `${v} € / kuu` : `${v} € / aasta`;
}

