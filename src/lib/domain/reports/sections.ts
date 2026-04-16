import type { DecisionEngineOutput, ProductRecommendation } from "@/lib/domain/recommendations/types";
import type { ReportSection, ReportType } from "@/lib/reports/types";

function categoryEt(c: ProductRecommendation["category"]) {
  const m: Record<ProductRecommendation["category"], string> = {
    contract: "Leping",
    behavior: "Käitumine",
    investigation: "Uurimine",
    automation: "Automaatika",
    solar: "Päike",
    battery: "Aku",
    ev: "Elektriauto",
    heating: "Küte",
    monitoring: "Jälgimine",
  };
  return m[c];
}

function verdictEt(v: string) {
  if (v === "do_now") return "Tugev signaal";
  if (v === "wait") return "Nõrk signaal";
  if (v === "evaluate_further") return "Hinda edasi";
  return v;
}

export function buildDomainReportSections(
  type: ReportType,
  decision: DecisionEngineOutput
): ReportSection[] {
  const sections: ReportSection[] = [];

  sections.push({
    kind: "bullets",
    title: "Andmete kindlus",
    items: [
      decision.dataQuality.summaryEt,
      `Andmekvaliteedi skoor (0–100): ${decision.dataQuality.completeness0to100}.`,
 ],
  });

  sections.push({
    kind: "kpis",
    title: "Lepingu intelligentsus (kokkuvõte)",
    items: [
      { label: "Volatiilsuse eksponeeritus", value: `${decision.contract.volatilityExposure.score0to100}/100` },
      { label: "Lepingu sobivus", value: `${decision.contract.contractFitScore.score0to100}/100` },
      {
        label: "Hinnanguline võit (parim vs praegune)",
        value: `${decision.contract.savingsOpportunityEurPerMonth.toFixed(1)} €/kuu`,
        hint: decision.contract.isMarginalDifference ? "Vahe on väike — ära üle tähtsusta." : undefined,
      },
    ],
  });

  sections.push({
    kind: "bullets",
    title: "Tarbimise leid",
    items: [
      decision.consumption.framingNoteEt.slice(0, 480),
      `Paindlikkus: ${decision.consumption.flexibilityScore.score0to100}/100 (${decision.consumption.flexibilityScore.band}).`,
      `Baas-koormus: ${decision.consumption.baselineClass}.`,
    ],
  });

  if (decision.investments.length) {
    sections.push({
      kind: "table",
      title: "Investeeringute otsusetugi",
      columns: ["Stsenaarium", "Tüüp", "Sobivus", "Otsus", "Tasuvus"],
      rows: decision.investments.slice(0, 8).map((i) => [
        i.name,
        i.type,
        `${i.strategicFit.score0to100}/100`,
        verdictEt(i.verdict),
        i.paybackYears !== null ? `${i.paybackYears.toFixed(1)} a` : "—",
      ]),
      note: "Hinnang: tugev signaal = võib olla järgmine suurem samm; hinda edasi = kogu täiendavat infot; nõrk signaal = ära kiirusta.",
    });
  }

  const top = decision.recommendations.slice(0, 6);
  sections.push({
    kind: "table",
    title: "Soovituste prioriteedid",
    columns: ["#", "Pealkiri", "Kategooria", "Mõju €/kuu", "Pingutus"],
    rows: top.map((r) => [
      String(r.rank),
      r.title,
      categoryEt(r.category),
      r.estimatedImpactEurPerMonth > 0 ? r.estimatedImpactEurPerMonth.toFixed(1) : "—",
      r.effort,
    ]),
  });

  if (type === "contract_risk_summary") {
    sections.push({
      kind: "bullets",
      title: "Lepingu selgitus",
      items: [
        decision.contract.summaryEt,
        decision.contract.volatilityExposure.rationaleEt,
        decision.contract.contractFitScore.rationaleEt,
      ],
    });
  }

  if (type === "savings_opportunity_summary" && decision.strongestSavings) {
    sections.push({
      kind: "kpis",
      title: "Tugevaim säästu koht (mudel)",
      items: [
        { label: "Tegevus", value: decision.strongestSavings.title },
        { label: "Hinnang", value: `~${decision.strongestSavings.eurPerMonth.toFixed(1)} €/kuu` },
      ],
    });
  }

  return sections;
}
