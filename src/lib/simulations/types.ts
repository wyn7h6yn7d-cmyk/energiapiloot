export type SimulationType = "solar" | "battery" | "ev_charger" | "heat_pump" | "peak_shaving";

export type SensitivityPoint = {
  label: string;
  monthlySavingsEur: number;
  paybackYears: number | null;
};

export type CashflowPoint = {
  year: number;
  cumulativeEur: number;
};

export type SimulationResult = {
  monthlySavingsEur: number;
  annualSavingsEur: number;
  paybackYears: number | null;
  cashflow: CashflowPoint[];
  sensitivity: SensitivityPoint[];
  summary: {
    title: string;
    bullets: string[];
    bestFit: string;
  };
  assumptions: { label: string; value: string }[];
};

export type SimulationDefinition<TInputs extends Record<string, unknown>> = {
  type: SimulationType;
  title: string;
  subtitle: string;
  defaultInputs: TInputs;
  calculate: (inputs: TInputs) => SimulationResult;
};

export type SavedScenario<TInputs extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  type: SimulationType;
  name: string;
  createdAt: number;
  inputs: TInputs;
  result: Pick<SimulationResult, "monthlySavingsEur" | "annualSavingsEur" | "paybackYears">;
};

