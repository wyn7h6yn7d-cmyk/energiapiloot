export type Confidence = "kõrge" | "keskmine" | "madal";

export type RecommendationKind =
  | "contract_switch"
  | "load_shift"
  | "base_load_investigate"
  | "investment_delay"
  | "investment_prioritize"
  | "heat_pump_evaluate"
  | "ev_schedule";

export type Recommendation = {
  id: string;
  kind: RecommendationKind;
  title: string;
  whyItMatters: string;
  estimatedImpactEurPerMonth: number;
  confidence: Confidence;
  nextStep: string;
  evidence: { label: string; value: string }[];
  priorityScore: number; // higher first (0..100)
};

export type RecommendationContext = {
  // Only include what we can have today; expand later with real tables.
  profile?: {
    userType?: "household" | "business";
  };
  contract?: {
    type: "fixed" | "spot" | "hybrid";
    riskScore?: number; // 0..100
    bestFit?: "fixed" | "spot" | "hybrid";
    estMonthlyCostEur?: number;
  };
  usage?: {
    estMonthlyCostEur?: number;
    baseLoadShare?: number; // 0..1
    peakDependencyScore?: number; // 0..100
    opportunities?: { title: string; estMonthlyEur: number; confidence: Confidence }[];
    devices?: {
      ev?: boolean;
      boiler?: boolean;
      heatPump?: boolean;
    };
  };
  simulations?: {
    scenarios?: {
      type: "solar" | "battery" | "ev_charger" | "heat_pump" | "peak_shaving";
      name: string;
      monthlySavingsEur: number;
      paybackYears: number | null;
    }[];
  };
};

