import type { ConfidenceLabel } from "@/lib/domain/scoring/confidence";

export type RecommendationCategory =
  | "contract"
  | "behavior"
  | "investigation"
  | "automation"
  | "solar"
  | "battery"
  | "ev"
  | "heating"
  | "monitoring";

export type EffortLevel = "väike" | "keskmine" | "suur";

export type ProductRecommendation = {
  id: string;
  category: RecommendationCategory;
  title: string;
  summary: string;
  explanation: string;
  whyItMatters: string;
  estimatedImpactEurPerMonth: number;
  impactLowEur?: number;
  impactHighEur?: number;
  timeHorizonEt: string;
  confidence: ConfidenceLabel;
  confidenceNote?: string;
  effort: EffortLevel;
  /** Raw priority before global sort tweaks */
  priority0to100: number;
  /** Final rank (1 = do first) */
  rank: number;
  nextStepLabel: string;
  nextStepHref?: string;
  signals: { label: string; value: string }[];
  whyNowVsLaterEt?: string;
};

export type DecisionEngineOutput = {
  dataQuality: import("@/lib/domain/scoring/confidence").DataQualityAssessment;
  contract: import("@/lib/domain/contracts/intelligence").ContractIntelligence;
  consumption: import("@/lib/domain/consumption/intelligence").ConsumptionIntelligence;
  investments: import("@/lib/domain/investments/intelligence").InvestmentEvaluation[];
  recommendations: ProductRecommendation[];
  strongestSavings: { title: string; eurPerMonth: number; category: RecommendationCategory } | null;
  strongestInvestment: { title: string; type: string; verdict: string } | null;
  notEnoughData: boolean;
};
