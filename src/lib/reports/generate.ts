import { analyzeContracts } from "@/lib/contracts/model";
import { buildConsumptionInsights } from "@/lib/consumption/insights";
import { buildOverviewMock } from "@/lib/dashboard/overview-mock";
import type { SiteRow } from "@/lib/supabase/site";
import { SIM_DEFINITIONS } from "@/lib/simulations/definitions";
import type { SimulationType } from "@/lib/simulations/types";
import type { ReportPayload, ReportType } from "@/lib/reports/types";

function isoNow() {
  return new Date().toISOString();
}

function eur(n: number) {
  return `${n.toFixed(2)} €`;
}

function eurPerMonth(n: number) {
  return `${n.toFixed(2)} € / kuu`;
}

function years(n: number | null) {
  return n === null ? "—" : `${n.toFixed(1)} a`;
}

export type ReportContext = {
  site: SiteRow;
  audience: "household" | "business";
  // MVP: use existing mock models; replace with real DB data later.
  overview: ReturnType<typeof buildOverviewMock>;
  contract: ReturnType<typeof analyzeContracts>;
  usage: ReturnType<typeof buildConsumptionInsights>;
  scenarios: {
    id: string;
    simulation_type: SimulationType;
    name: string;
    config: Record<string, unknown>;
  }[];
};

export function buildReportPayload(type: ReportType, ctx: ReportContext): ReportPayload {
  if (type === "monthly_energy_summary") return monthlyEnergySummary(ctx);
  if (type === "contract_risk_summary") return contractRiskSummary(ctx);
  if (type === "savings_opportunity_summary") return savingsOpportunitySummary(ctx);
  return investmentSimulationReport(ctx);
}

function basePayload(type: ReportType, title: string, ctx: ReportContext): ReportPayload {
  return {
    report_type: type,
    title,
    generated_at: isoNow(),
    site: { name: ctx.site.name, object_type: ctx.site.object_type },
    audience: ctx.audience,
    sections: [],
    meta: {
      version: 1,
      inputs_summary: [
        `Objekt: ${ctx.site.name}`,
        `Publik: ${ctx.audience === "business" ? "Äri" : "Kodu"}`,
        `Tarbimine (hinnang): ${ctx.overview.kpis.estMonthlyKwh} kWh/kuu`,
        `Keskmine hind (hinnang): ${ctx.overview.kpis.estAvgPriceEurPerKwh.toFixed(3)} €/kWh`,
      ],
    },
  };
}

function monthlyEnergySummary(ctx: ReportContext): ReportPayload {
  const p = basePayload("monthly_energy_summary", "Kuu energia kokkuvõte", ctx);

  const estCost = ctx.usage.kpis.estMonthlyCostEur;
  const baseShare = ctx.usage.kpis.baseLoadShare;
  const peak = ctx.usage.kpis.peakDependencyScore;

  p.sections.push({
    kind: "kpis",
    title: "Ülevaade",
    items: [
      { label: "Hinnanguline kuukulu", value: eur(estCost), hint: "Põhineb eeldustel (MVP)." },
      { label: "Hinnanguline tarbimine", value: `${ctx.overview.kpis.estMonthlyKwh} kWh`, hint: "MVP (asendub mõõteandmetega)." },
      { label: "Baas-koormus", value: `${Math.round(baseShare * 100)}%`, hint: "~24/7 tarbimise osakaal." },
      { label: "Tipu-sõltuvus", value: `${peak}/100`, hint: "Kui kõrge, siis ajastus aitab." },
    ],
  });

  p.sections.push({
    kind: "table",
    title: "Kulu draiverid",
    columns: ["Draiver", "kWh/kuu", "€ / kuu", "Märkus"],
    rows: ctx.usage.drivers.slice(0, 6).map((d) => [
      d.label,
      `${Math.round(d.kwhMonthly)}`,
      eur(d.eurMonthly),
      d.note,
    ]),
    note: "Need on hinnangud. Kui ühendad päris andmed, muutub jaotus täpsemaks.",
  });

  p.sections.push({
    kind: "bullets",
    title: "Mida see tähendab",
    items: [
      "Kui baas-koormus on kõrge, alusta varjatud tarbijate leidmisest.",
      "Kui tipu-sõltuvus on kõrge, tee ajastamisreeglid (boiler/EV/jahutus).",
      "Hoia eeldused nähtavad: see teeb otsuse auditeeritavaks.",
    ],
  });

  return p;
}

function contractRiskSummary(ctx: ReportContext): ReportPayload {
  const p = basePayload("contract_risk_summary", "Lepingu riski kokkuvõte", ctx);
  const current = ctx.contract.current;
  const rec = ctx.contract.recommendation;

  p.sections.push({
    kind: "kpis",
    title: "Praegune leping",
    items: [
      { label: "Tüüp", value: current.type === "spot" ? "Börs" : current.type === "fixed" ? "Fikseeritud" : "Hübriid" },
      { label: "Hinnanguline kuukulu", value: eur(current.estMonthlyCostEur), hint: "Põhineb tarbimise ja mustri eeldusel." },
      { label: "Vahemik (best–worst)", value: `${eur(current.bestCaseEur)} – ${eur(current.worstCaseEur)}`, hint: "Volatiilsuse eeldus mõjutab." },
      { label: "Riskiskoor", value: `${current.riskScore}/100` },
    ],
  });

  p.sections.push({
    kind: "table",
    title: "Võrdlus",
    columns: ["Valik", "€ / kuu", "Risk", "Best–Worst"],
    rows: ctx.contract.scenarios
      .filter((s) => s.label !== "Praegune")
      .map((s) => [
        s.label,
        eur(s.estMonthlyCostEur),
        `${s.riskScore}/100`,
        `${eur(s.bestCaseEur)} – ${eur(s.worstCaseEur)}`,
      ]),
    note: "MVP mudel: kasutab sisendhindasid + volatiilsuse eeldust + tipp-tundide osakaalu.",
  });

  p.sections.push({
    kind: "bullets",
    title: "Soovitus",
    items: [rec.title, rec.summary, ...rec.why],
  });

  return p;
}

function savingsOpportunitySummary(ctx: ReportContext): ReportPayload {
  const p = basePayload("savings_opportunity_summary", "Säästu võimaluste kokkuvõte", ctx);

  const opps = ctx.usage.opportunities;
  const estTop = opps.reduce((a, o) => a + o.estMonthlyEur, 0);

  p.sections.push({
    kind: "kpis",
    title: "Top säästu kohad",
    items: [
      { label: "Top võimaluste summa", value: eurPerMonth(estTop), hint: "Hinnang (MVP)." },
      { label: "Baas-koormuse osakaal", value: `${Math.round(ctx.usage.kpis.baseLoadShare * 100)}%` },
      { label: "Tipu-sõltuvus", value: `${ctx.usage.kpis.peakDependencyScore}/100` },
      { label: "Soovitusi", value: `${opps.length}`, hint: "Kuvame top 4." },
    ],
  });

  p.sections.push({
    kind: "table",
    title: "Võimalused",
    columns: ["Teema", "€ / kuu", "Usaldus", "Miks"],
    rows: opps.map((o) => [o.title, eur(o.estMonthlyEur), o.confidence, o.rationale]),
  });

  p.sections.push({
    kind: "bullets",
    title: "Järgmised sammud",
    items: [
      "Alusta 1–2 lihtsaima tegevusega (ajastus + baas-koormus).",
      "Seejärel kinnita eeldused mõõteandmetega, et kitsendada vahemikke.",
      "Kui investeerid, salvesta stsenaariumid ja võrdle cashflow’d.",
    ],
  });

  return p;
}

function investmentSimulationReport(ctx: ReportContext): ReportPayload {
  const p = basePayload("investment_simulation_report", "Investeeringu simulatsiooni raport", ctx);

  const scenario = ctx.scenarios[0];
  if (!scenario) {
    p.sections.push({
      kind: "bullets",
      title: "Pole simulatsiooni",
      items: [
        "Selle raporti jaoks on vaja vähemalt üht salvestatud stsenaariumi.",
        "Mine Simulatsioonid → salvesta stsenaarium → loo raport uuesti.",
      ],
    });
    return p;
  }

  const def = SIM_DEFINITIONS[scenario.simulation_type];
  const res = def.calculate(scenario.config as any);

  p.sections.push({
    kind: "simulation_snapshot",
    title: "Stsenaariumi kokkuvõte",
    simulation: {
      type: scenario.simulation_type,
      name: scenario.name,
      monthlySavingsEur: res.monthlySavingsEur,
      annualSavingsEur: res.annualSavingsEur,
      paybackYears: res.paybackYears,
    },
    assumptions: res.assumptions,
  });

  p.sections.push({
    kind: "kpis",
    title: "Tulemused",
    items: [
      { label: "Kuutine sääst", value: eurPerMonth(res.monthlySavingsEur) },
      { label: "Aastane sääst", value: eur(res.annualSavingsEur), hint: "MVP (lihtne mudel)." },
      { label: "Tasuvus", value: years(res.paybackYears), hint: "Upfront / aastane sääst." },
      { label: "Sensitiivsus", value: "±30%", hint: "Säästu variatsioon." },
    ],
  });

  p.sections.push({
    kind: "chart_data",
    title: "Cash flow (andmed)",
    chart: "simulation_cashflow",
    data: { cashflow: res.cashflow, sensitivity: res.sensitivity },
    note: "Detailvaates kuvatakse graafik; PDF ekspordiks on andmed siin struktureeritult.",
  });

  p.sections.push({
    kind: "bullets",
    title: "Soovitus",
    items: [res.summary.title, res.summary.bestFit, ...res.summary.bullets],
  });

  return p;
}

