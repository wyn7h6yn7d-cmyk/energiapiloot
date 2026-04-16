import type { Recommendation, RecommendationContext } from "@/lib/recommendations/types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function eurPerMonth(n: number | undefined) {
  return round2(Math.max(0, n ?? 0));
}

function confidenceFromLabel(label?: string) {
  if (!label) return "keskmine" as const;
  if (label === "kõrge" || label === "keskmine" || label === "madal") return label;
  return "keskmine" as const;
}

function priorityFromImpact(impact: number, bonus = 0) {
  return Math.round(clamp(impact * 2.2 + bonus, 0, 100));
}

export function generateRecommendations(ctx: RecommendationContext): Recommendation[] {
  const recs: Recommendation[] = [];

  const usageCost = eurPerMonth(ctx.usage?.estMonthlyCostEur ?? ctx.contract?.estMonthlyCostEur);
  const baseShare = clamp(ctx.usage?.baseLoadShare ?? 0, 0, 1);
  const peakScore = clamp(ctx.usage?.peakDependencyScore ?? 0, 0, 100);
  const contractType = ctx.contract?.type;
  const contractRisk = clamp(ctx.contract?.riskScore ?? 0, 0, 100);
  const bestFit = ctx.contract?.bestFit;

  const sims = ctx.simulations?.scenarios ?? [];
  const solar = sims.filter((s) => s.type === "solar").sort((a, b) => (a.paybackYears ?? 99) - (b.paybackYears ?? 99))[0];
  const battery = sims.filter((s) => s.type === "battery").sort((a, b) => (a.paybackYears ?? 99) - (b.paybackYears ?? 99))[0];
  const ev = sims.filter((s) => s.type === "ev_charger").sort((a, b) => (a.paybackYears ?? 99) - (b.paybackYears ?? 99))[0];
  const hp = sims.filter((s) => s.type === "heat_pump").sort((a, b) => (a.paybackYears ?? 99) - (b.paybackYears ?? 99))[0];

  // 1) Contract switch suggestion (when risk high or bestFit differs)
  if (contractType && (contractRisk >= 60 || (bestFit && bestFit !== contractType))) {
    const target = bestFit ?? (contractRisk >= 75 ? "fixed" : "hybrid");
    const title =
      target === "fixed"
        ? "Kaalu fikseeritud lepingut (stabiilsus)"
        : target === "hybrid"
          ? "Kaalu hübriidlepingut (risk + hind tasakaalus)"
          : "Kaalu börsilepingut (optimeerimise potentsiaal)";

    const impact = Math.max(0, usageCost * 0.04);
    recs.push({
      id: "rec_contract_switch",
      kind: "contract_switch",
      title,
      whyItMatters:
        "Kui tarbimine langeb kallimatesse tundidesse või volatiilsus on kõrge, võib lepingu tüüp mõjutada eelarveriski rohkem kui väike hinnavahe.",
      estimatedImpactEurPerMonth: round2(impact),
      confidence: contractRisk >= 75 ? "keskmine" : "madal",
      nextStep: "Ava lepinguanalüüs ja võrdle fikseeritud vs börs vs hübriid ühe eelduste paketiga.",
      evidence: [
        { label: "Praegune tüüp", value: contractType },
        { label: "Riskiskoor", value: `${contractRisk}/100` },
        ...(bestFit ? [{ label: "Parim sobivus", value: bestFit }] : []),
      ],
      priorityScore: priorityFromImpact(impact, 18),
    });
  }

  // 2) Shift consumption to lower-cost periods (peak dependency high)
  if (peakScore >= 70) {
    const impact = Math.max(3, usageCost * 0.07);
    recs.push({
      id: "rec_shift_load",
      kind: "load_shift",
      title: "Nihuta tarbimist odavamatesse tundidesse",
      whyItMatters:
        "Ajastamine vähendab tiputundide mõju. Sageli on see kõige odavam “investeering”: reegel + taimer + harjumus.",
      estimatedImpactEurPerMonth: round2(impact),
      confidence: "kõrge",
      nextStep: "Seadista boiler/EV/jahutus ajastusega: odavad tunnid + väldi tippe.",
      evidence: [
        { label: "Tipu-sõltuvus", value: `${peakScore}/100` },
        { label: "Hinnanguline kuukulu", value: `${usageCost.toFixed(2)} €` },
      ],
      priorityScore: priorityFromImpact(impact, 22),
    });
  }

  // 3) Investigate high base load
  if (baseShare >= 0.32) {
    const impact = Math.max(4, usageCost * Math.min(0.12, baseShare * 0.18));
    recs.push({
      id: "rec_base_load",
      kind: "base_load_investigate",
      title: baseShare >= 0.42 ? "Kontrolli varjatud 24/7 tarbimist" : "Optimeeri baas-koormust",
      whyItMatters:
        "Kõrge baas-koormus tähendab, et maksad ka siis, kui “midagi ei kasuta”. Tihti leitakse siit kiireid võite (valmidusrežiimid, lekked, seadistused).",
      estimatedImpactEurPerMonth: round2(impact),
      confidence: baseShare >= 0.42 ? "kõrge" : "keskmine",
      nextStep:
        "Tee 30-min “lekkeotsing”: lülita ringe/Seadmeid välja ja vaata, mis tarbimine jääb püsima. Seejärel taimerid ja seadistused.",
      evidence: [
        { label: "Baas-koormuse osakaal", value: `${Math.round(baseShare * 100)}%` },
      ],
      priorityScore: priorityFromImpact(impact, 20),
    });
  }

  // 4) EV scheduling recommendation (if EV exists)
  if (ctx.usage?.devices?.ev) {
    const impact = Math.max(2, usageCost * 0.03);
    recs.push({
      id: "rec_ev_schedule",
      kind: "ev_schedule",
      title: "Muuda EV laadimise reeglit (odavad tunnid)",
      whyItMatters:
        "EV tarbimine on ajastatav. Kui laadid tiputundidel, suurendad nii kuukulu kui hinnariski.",
      estimatedImpactEurPerMonth: round2(impact),
      confidence: peakScore >= 70 ? "kõrge" : "keskmine",
      nextStep: "Loo reegel: lae ainult odavaimate tundide aknas (nt öö + madal hind).",
      evidence: [
        { label: "Seade", value: "EV" },
        ...(peakScore ? [{ label: "Tipu-sõltuvus", value: `${peakScore}/100` }] : []),
      ],
      priorityScore: priorityFromImpact(impact, 10),
    });
  }

  // 5) Prioritize solar first (if solar scenario exists and is strong)
  if (solar && solar.paybackYears !== null && solar.paybackYears <= 10) {
    const impact = Math.max(5, eurPerMonth(solar.monthlySavingsEur));
    recs.push({
      id: "rec_prioritize_solar",
      kind: "investment_prioritize",
      title: "Prioritiseeri päike enne teisi investeeringuid",
      whyItMatters:
        "Kui päike annab tugeva tasuvuse, on see sageli parim “baas” teiste optimeerimiste jaoks (aku, EV, tipud).",
      estimatedImpactEurPerMonth: round2(impact),
      confidence: "keskmine",
      nextStep: "Kinnita eeldused: oma-tarbimine, süsteemi suurus, varjud. Seejärel küsi 2–3 pakkumist.",
      evidence: [
        { label: "Päikese stsenaarium", value: solar.name },
        { label: "Tasuvus", value: `${solar.paybackYears.toFixed(1)} a` },
      ],
      priorityScore: priorityFromImpact(impact, 16),
    });
  }

  // 6) Delay battery investment if payback worse than solar or very long
  if (battery && battery.paybackYears !== null) {
    const solarPb = solar?.paybackYears ?? null;
    const delay =
      battery.paybackYears >= 12 || (solarPb !== null && solarPb + 1.5 < battery.paybackYears);
    if (delay) {
      recs.push({
        id: "rec_delay_battery",
        kind: "investment_delay",
        title: "Lükka aku investeering edasi (praeguste eelduste järgi)",
        whyItMatters:
          "Aku tasuvus sõltub hinnavahedest ja kasutusprofiilist. Tihti on parem esmalt teha päike/ajastus ja siis hinnata aku uuesti.",
        estimatedImpactEurPerMonth: 0,
        confidence: "keskmine",
        nextStep: "Paranda esmalt ajastus ja (kui asjakohane) päikese oma-tarbimine. Siis arvuta aku uuesti uute eeldustega.",
        evidence: [
          { label: "Aku stsenaarium", value: battery.name },
          { label: "Tasuvus", value: `${battery.paybackYears.toFixed(1)} a` },
          ...(solarPb !== null ? [{ label: "Päike tasuvus", value: `${solarPb.toFixed(1)} a` }] : []),
        ],
        priorityScore: 28,
      });
    }
  }

  // 7) Heat pump evaluation (if high cost and no HP scenario)
  if (!hp && usageCost >= 85) {
    const impact = usageCost * 0.12;
    recs.push({
      id: "rec_heat_pump_eval",
      kind: "heat_pump_evaluate",
      title: "Soojuspump võib olla väärt hindamist",
      whyItMatters:
        "Kui soojusvajadus on suur, võib COP-ga lahendus oluliselt vähendada kulu. Tasub hinnata vähemalt ühe stsenaariumiga.",
      estimatedImpactEurPerMonth: round2(impact),
      confidence: "madal",
      nextStep: "Loo soojuspumba stsenaarium: soojusvajadus (kWh), COP eeldus, praegune soojuse hind.",
      evidence: [{ label: "Kuukulu tase", value: `${usageCost.toFixed(0)} €+` }],
      priorityScore: priorityFromImpact(impact, 8),
    });
  }

  // 8) Use usage-generated opportunities as recommendations (bridge)
  for (const opp of ctx.usage?.opportunities ?? []) {
    const impact = eurPerMonth(opp.estMonthlyEur);
    recs.push({
      id: `rec_usage_${opp.title.toLowerCase().replace(/\s+/g, "_").slice(0, 40)}`,
      kind: opp.title.toLowerCase().includes("baas") ? "base_load_investigate" : "load_shift",
      title: opp.title,
      whyItMatters: "See on tuletatud tarbimisprofiili eeldustest (MVP) ja annab kiire, praktilise säästu tee.",
      estimatedImpactEurPerMonth: impact,
      confidence: confidenceFromLabel(opp.confidence),
      nextStep: "Ava tarbimise insight ja täpsusta eeldusi (seadmed, baas, tipud).",
      evidence: [{ label: "Allikas", value: "Tarbimise insight (MVP)" }],
      priorityScore: priorityFromImpact(impact, 12),
    });
  }

  // Deduplicate by id
  const unique = new Map<string, Recommendation>();
  for (const r of recs) {
    if (!unique.has(r.id)) unique.set(r.id, r);
  }

  return [...unique.values()].sort((a, b) => b.priorityScore - a.priorityScore);
}

