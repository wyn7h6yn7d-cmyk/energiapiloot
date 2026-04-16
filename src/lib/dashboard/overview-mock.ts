export type Money = { eur: number };

export type ContractSummary = {
  provider: string;
  type: "spot" | "fixed" | "hybrid";
  baseFeeEurPerMonth: number;
  energyPriceEurPerKwh: number;
  networkFeeEurPerKwh: number;
  vatRate: number;
  riskLabel: "madal" | "keskmine" | "kõrge";
};

export type SavingsOpportunity = {
  id: string;
  label: string;
  estMonthly: Money;
  confidence: "kõrge" | "keskmine" | "madal";
};

export type RecommendationItem = {
  id: string;
  kind: "contract" | "load_shift" | "investment" | "monitoring";
  title: string;
  rationale: string;
  estMonthlyImpact: Money;
  effort: "väike" | "keskmine" | "suur";
  status: "open" | "accepted" | "dismissed";
};

export type SimulationSnippet = {
  id: string;
  title: string;
  createdAtLabel: string;
  resultLabel: string;
  estMonthlyImpact: Money;
};

export type EnergyAssetSummary = {
  solar: boolean;
  battery: boolean;
  ev: boolean;
  heatPump: boolean;
};

export type UpcomingInsight = {
  id: string;
  title: string;
  etaLabel: string;
  description: string;
};

export type OverviewMock = {
  kpis: {
    estMonthlyCost: Money;
    estMonthlyKwh: number;
    estAvgPriceEurPerKwh: number;
    estMonthlySavingsPotential: Money;
  };
  contract: ContractSummary;
  savings: SavingsOpportunity[];
  recommendations: RecommendationItem[];
  latestSimulations: SimulationSnippet[];
  assets: EnergyAssetSummary;
  upcoming: UpcomingInsight[];
  charts: {
    dailyCost: { day: string; eur: number }[];
    dailyKwh: { day: string; kwh: number }[];
    priceBreakdown: { name: string; value: number }[];
  };
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function eur(n: number): Money {
  return { eur: round2(n) };
}

export function buildOverviewMock(): OverviewMock {
  const days = ["E", "T", "K", "N", "R", "L", "P"];
  const baselineKwh = 12.8;
  const kwhByDay = days.map((day, i) => {
    const wave = Math.sin(i / 1.4) * 1.2 + Math.cos(i / 2.1) * 0.7;
    const kwh = Math.max(7.4, baselineKwh + wave);
    return { day, kwh: round2(kwh) };
  });

  const contract: ContractSummary = {
    provider: "ElektraNord",
    type: "spot",
    baseFeeEurPerMonth: 3.49,
    energyPriceEurPerKwh: 0.118,
    networkFeeEurPerKwh: 0.072,
    vatRate: 0.22,
    riskLabel: "keskmine",
  };

  const avgAllIn =
    (contract.energyPriceEurPerKwh + contract.networkFeeEurPerKwh) * (1 + contract.vatRate);
  const weeklyKwh = kwhByDay.reduce((acc, d) => acc + d.kwh, 0);
  const estMonthlyKwh = weeklyKwh * (365 / 7 / 12);
  const estMonthlyCost =
    contract.baseFeeEurPerMonth + estMonthlyKwh * avgAllIn;

  const dailyCost = kwhByDay.map(({ day, kwh }, i) => {
    const priceSwing = 1 + Math.sin(i / 1.2) * 0.07;
    const eurValue = kwh * avgAllIn * priceSwing;
    return { day, eur: round2(eurValue) };
  });

  const savings: SavingsOpportunity[] = [
    { id: "s1", label: "Lepingu optimeerimine", estMonthly: eur(12.4), confidence: "keskmine" },
    { id: "s2", label: "Tarbijate ajastamine", estMonthly: eur(7.8), confidence: "kõrge" },
    { id: "s3", label: "Päikese stsenaarium", estMonthly: eur(18.9), confidence: "madal" },
  ];

  const recommendations: RecommendationItem[] = [
    {
      id: "r1",
      kind: "contract",
      title: "Kontrolli: fikseeritud vs börs 12 kuud",
      rationale: "Sinu kulu on tundlik tipp-tundide hinnale. Võrdleme riskiprofiili.",
      estMonthlyImpact: eur(9.6),
      effort: "väike",
      status: "open",
    },
    {
      id: "r2",
      kind: "load_shift",
      title: "Nihuta 20% tarbimisest odavamatesse tundidesse",
      rationale: "Lihtne ajastus (boiler/EV) vähendab hinnariski ilma investeeringuta.",
      estMonthlyImpact: eur(6.2),
      effort: "keskmine",
      status: "open",
    },
    {
      id: "r3",
      kind: "monitoring",
      title: "Lisa tarbimise baasjoon (andmed või käsitsi)",
      rationale: "Ilma baasjooneta on säästu hinnangud laia vahemikuga.",
      estMonthlyImpact: eur(0),
      effort: "väike",
      status: "open",
    },
  ];

  const latestSimulations: SimulationSnippet[] = [
    {
      id: "sim1",
      title: "Päike (6 kW) • esmane hinnang",
      createdAtLabel: "Täna 10:12",
      resultLabel: "Tasuvus 8.4 a • oma-tarbimine 38%",
      estMonthlyImpact: eur(17.3),
    },
    {
      id: "sim2",
      title: "Aku (7 kWh) • tipukoormuse vähendus",
      createdAtLabel: "Eile 18:44",
      resultLabel: "Tipu mõju −14% • lisakulu < 2€",
      estMonthlyImpact: eur(6.9),
    },
  ];

  const assets: EnergyAssetSummary = {
    solar: true,
    battery: false,
    ev: true,
    heatPump: false,
  };

  const upcoming: UpcomingInsight[] = [
    {
      id: "u1",
      title: "Hinnariski kokkuvõte (30 päeva)",
      etaLabel: "3 päeva pärast",
      description: "Näitab, kui palju maksaksid eri lepingutüüpidega sama tarbimisega.",
    },
    {
      id: "u2",
      title: "Tiputundide mõju",
      etaLabel: "Varsti",
      description: "Kui lisanduvad intervallandmed, arvutame tipukoormuse hinna.",
    },
  ];

  const energyEur = estMonthlyKwh * contract.energyPriceEurPerKwh;
  const networkEur = estMonthlyKwh * contract.networkFeeEurPerKwh;
  const vatEur = (energyEur + networkEur) * contract.vatRate;

  return {
    kpis: {
      estMonthlyCost: eur(estMonthlyCost),
      estMonthlyKwh: Math.round(estMonthlyKwh),
      estAvgPriceEurPerKwh: round2(avgAllIn),
      estMonthlySavingsPotential: eur(savings.reduce((a, s) => a + s.estMonthly.eur, 0)),
    },
    contract,
    savings,
    recommendations,
    latestSimulations,
    assets,
    upcoming,
    charts: {
      dailyCost,
      dailyKwh: kwhByDay,
      priceBreakdown: [
        { name: "Energia", value: round2(energyEur) },
        { name: "Võrk", value: round2(networkEur) },
        { name: "KM", value: round2(vatEur) },
        { name: "Kuutasu", value: round2(contract.baseFeeEurPerMonth) },
      ],
    },
  };
}

