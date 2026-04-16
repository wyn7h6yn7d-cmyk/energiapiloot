import type { ReportType } from "@/lib/reports/types";

/** User-facing checklist per template — aligns with future PDF section order. */
export const PREMIUM_REPORT_BUNDLE_ITEMS: Record<ReportType, readonly string[]> = {
  monthly_energy_summary: [
    "Kompaktne otsustaja kokkuvõte",
    "KPI-d ja kuu draiverid",
    "Print / PDF sõbralik paigutus",
  ],
  contract_risk_summary: [
    "Lepingu riski ja sobivuse sõnastus",
    "Võrdlusvaated ja riskiskoori kontekst",
    "Jagatav dokument otsustajale",
  ],
  savings_opportunity_summary: [
    "Säästu võimaluste prioriseerimine",
    "Mõju hinnang ja järgmised sammud",
    "Struktureeritud väljund",
  ],
  investment_simulation_report: [
    "Stsenaariumi KPI-d ja eelduste lõik",
    "15 aasta rahavoog ja tundlikkus",
    "Investeerimismälu (PDF) jagamiseks",
  ],
};

export function defaultTitleForReportType(type: ReportType): string {
  switch (type) {
    case "monthly_energy_summary":
      return "Energiakokkuvõtte pakett";
    case "contract_risk_summary":
      return "Lepingu riski pakett";
    case "savings_opportunity_summary":
      return "Säästu võimaluste pakett";
    case "investment_simulation_report":
      return "Investeeringu otsuse pakett";
  }
}
