import type { SimulationType } from "@/lib/simulations/types";

export type ReportType =
  | "monthly_energy_summary"
  | "contract_risk_summary"
  | "savings_opportunity_summary"
  | "investment_simulation_report";

export type ReportStatus = "queued" | "generating" | "ready" | "failed";

export type ReportPayload = {
  report_type: ReportType;
  title: string;
  generated_at: string; // ISO
  site: { name: string; object_type: string };
  audience: "household" | "business";
  sections: ReportSection[];
  meta: {
    version: number;
    inputs_summary: string[];
  };
};

export type ReportSection =
  | {
      kind: "kpis";
      title: string;
      items: { label: string; value: string; hint?: string }[];
    }
  | {
      kind: "bullets";
      title: string;
      items: string[];
    }
  | {
      kind: "table";
      title: string;
      columns: string[];
      rows: string[][];
      note?: string;
    }
  | {
      kind: "chart_data";
      title: string;
      chart: "monthly_cost_breakdown" | "savings_opportunities" | "simulation_cashflow";
      data: Record<string, unknown>;
      note?: string;
    }
  | {
      kind: "simulation_snapshot";
      title: string;
      simulation: {
        type: SimulationType;
        name: string;
        monthlySavingsEur: number;
        annualSavingsEur: number;
        paybackYears: number | null;
      };
      assumptions: { label: string; value: string }[];
    };

