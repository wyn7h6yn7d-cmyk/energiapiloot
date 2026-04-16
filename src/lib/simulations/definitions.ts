import { buildCashflow, buildSensitivity, paybackYears, safeNumber } from "@/lib/simulations/calc";
import type { SimulationDefinition, SimulationResult, SimulationType } from "@/lib/simulations/types";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function makeResult({
  upfrontEur,
  annualSavingsEur,
  summary,
  assumptions,
}: {
  upfrontEur: number;
  annualSavingsEur: number;
  summary: SimulationResult["summary"];
  assumptions: SimulationResult["assumptions"];
}): SimulationResult {
  const annual = Math.max(0, annualSavingsEur);
  return {
    monthlySavingsEur: round2(annual / 12),
    annualSavingsEur: round2(annual),
    paybackYears: paybackYears(Math.max(0, upfrontEur), annual),
    cashflow: buildCashflow({ upfrontEur, annualSavingsEur: annual, years: 15 }),
    sensitivity: buildSensitivity({ upfrontEur, baseAnnualSavingsEur: annual }),
    summary,
    assumptions,
  };
}

export type SolarInputs = {
  upfrontEur: number;
  systemKw: number;
  selfConsumptionShare: number; // 0..1
  annualYieldKwhPerKw: number; // e.g. 900-1100 in Baltics
  electricityPriceEurPerKwh: number; // all-in
};

const solar: SimulationDefinition<SolarInputs> = {
  type: "solar",
  title: "Päike",
  subtitle: "Tootmine, oma-tarbimine ja tasuvus.",
  defaultInputs: {
    upfrontEur: 6900,
    systemKw: 6,
    selfConsumptionShare: 0.38,
    annualYieldKwhPerKw: 980,
    electricityPriceEurPerKwh: 0.19,
  },
  calculate(inputs) {
    const upfrontEur = safeNumber(inputs.upfrontEur, 6900);
    const systemKw = Math.max(0, safeNumber(inputs.systemKw, 6));
    const self = Math.min(0.95, Math.max(0.15, safeNumber(inputs.selfConsumptionShare, 0.38)));
    const yieldKwhPerKw = Math.min(1300, Math.max(700, safeNumber(inputs.annualYieldKwhPerKw, 980)));
    const price = Math.min(0.55, Math.max(0.08, safeNumber(inputs.electricityPriceEurPerKwh, 0.19)));

    const annualProduction = systemKw * yieldKwhPerKw;
    // MVP: only value self-consumed kWh at retail; export value ignored for simplicity.
    const valuedKwh = annualProduction * self;
    const annualSavings = valuedKwh * price;

    return makeResult({
      upfrontEur,
      annualSavingsEur: annualSavings,
      summary: {
        title: "Päike tasub kõige paremini, kui oma-tarbimine on kõrge.",
        bestFit: "Kodu / äri, kus tarbimine on päevas ja suvel olemas.",
        bullets: [
          `Hinnanguline tootmine: ~${Math.round(annualProduction)} kWh/a.`,
          `Oma-tarbimine (eeldus): ${Math.round(self * 100)}%.`,
          "Praegu arvestame ainult oma-tarbimist; müügi tulu võrku lisandub hiljem.",
        ],
      },
      assumptions: [
        { label: "Tootlikkus", value: `${Math.round(yieldKwhPerKw)} kWh/kW/a` },
        { label: "Oma-tarbimine", value: `${Math.round(self * 100)}%` },
        { label: "Hind (all-in)", value: `${price.toFixed(3)} €/kWh` },
        { label: "Eluiga", value: "15 aastat (cashflow graafik)" },
      ],
    });
  },
};

export type BatteryInputs = {
  upfrontEur: number;
  capacityKwh: number;
  cyclesPerDay: number;
  efficiency: number; // 0..1
  valuePerKwhShiftedEur: number; // value of shifting 1 kWh from expensive to cheap
};

const battery: SimulationDefinition<BatteryInputs> = {
  type: "battery",
  title: "Aku",
  subtitle: "Ajastamine ja tipukoormuse vähendus.",
  defaultInputs: {
    upfrontEur: 5200,
    capacityKwh: 7,
    cyclesPerDay: 0.6,
    efficiency: 0.9,
    valuePerKwhShiftedEur: 0.06,
  },
  calculate(inputs) {
    const upfrontEur = safeNumber(inputs.upfrontEur, 5200);
    const cap = Math.min(40, Math.max(1, safeNumber(inputs.capacityKwh, 7)));
    const cycles = Math.min(1.2, Math.max(0.1, safeNumber(inputs.cyclesPerDay, 0.6)));
    const eff = Math.min(0.95, Math.max(0.7, safeNumber(inputs.efficiency, 0.9)));
    const value = Math.min(0.25, Math.max(0.01, safeNumber(inputs.valuePerKwhShiftedEur, 0.06)));

    const shiftedKwhAnnual = cap * cycles * 365 * eff;
    const annualSavings = shiftedKwhAnnual * value;

    return makeResult({
      upfrontEur,
      annualSavingsEur: annualSavings,
      summary: {
        title: "Aku annab kasu, kui hindade vahe on suur ja ajastad targalt.",
        bestFit: "Börsileping + õhtune tarbimine + tiputundide vältimine.",
        bullets: [
          `Eeldus: ${cap} kWh aku • ${cycles.toFixed(1)} tsüklit/päev • η=${Math.round(eff * 100)}%.`,
          `Hinna vahe (eeldus): ${value.toFixed(2)} €/kWh.`,
          "Akut käsitleme kui vahendit, mis nihutab kWh odavamatesse tundidesse.",
        ],
      },
      assumptions: [
        { label: "Nihutatud energia", value: `~${Math.round(shiftedKwhAnnual)} kWh/a` },
        { label: "Hinna vahe", value: `${value.toFixed(2)} €/kWh` },
        { label: "Efektiivsus", value: `${Math.round(eff * 100)}%` },
        { label: "Eluiga", value: "15 aastat (cashflow graafik)" },
      ],
    });
  },
};

export type EvChargerInputs = {
  upfrontEur: number;
  monthlyKwhCharged: number;
  smartChargingShare: number; // 0..1
  valuePerKwhShiftedEur: number;
};

const evCharger: SimulationDefinition<EvChargerInputs> = {
  type: "ev_charger",
  title: "EV laadija",
  subtitle: "Nutika laadimisajastuse sääst.",
  defaultInputs: {
    upfrontEur: 950,
    monthlyKwhCharged: 180,
    smartChargingShare: 0.75,
    valuePerKwhShiftedEur: 0.05,
  },
  calculate(inputs) {
    const upfrontEur = safeNumber(inputs.upfrontEur, 950);
    const monthlyKwh = Math.min(900, Math.max(20, safeNumber(inputs.monthlyKwhCharged, 180)));
    const smart = Math.min(0.95, Math.max(0.2, safeNumber(inputs.smartChargingShare, 0.75)));
    const value = Math.min(0.2, Math.max(0.01, safeNumber(inputs.valuePerKwhShiftedEur, 0.05)));

    const shiftedAnnual = monthlyKwh * 12 * smart;
    const annualSavings = shiftedAnnual * value;

    return makeResult({
      upfrontEur,
      annualSavingsEur: annualSavings,
      summary: {
        title: "EV sääst tuleb peamiselt ajastamisest, mitte “rohkem laadimisest”.",
        bestFit: "Börsileping + öine laadimine + selge reegel (odavad tunnid).",
        bullets: [
          `Laadimine: ~${Math.round(monthlyKwh)} kWh/kuu.`,
          `Nutika ajastamise osa: ${Math.round(smart * 100)}%.`,
          `Hinna vahe (eeldus): ${value.toFixed(2)} €/kWh.`,
        ],
      },
      assumptions: [
        { label: "Laadimise maht", value: `${Math.round(monthlyKwh)} kWh/kuu` },
        { label: "Ajastatav osa", value: `${Math.round(smart * 100)}%` },
        { label: "Hinna vahe", value: `${value.toFixed(2)} €/kWh` },
        { label: "Eluiga", value: "15 aastat (cashflow graafik)" },
      ],
    });
  },
};

export type HeatPumpInputs = {
  upfrontEur: number;
  monthlyHeatKwh: number; // useful heat
  cop: number;
  replacedFuelCostEurPerKwh: number; // what you replace (e.g. direct electric, gas)
  electricityPriceEurPerKwh: number;
};

const heatPump: SimulationDefinition<HeatPumpInputs> = {
  type: "heat_pump",
  title: "Soojuspump",
  subtitle: "Elektrikulu vähenemine läbi soojusfaktori (COP).",
  defaultInputs: {
    upfrontEur: 7800,
    monthlyHeatKwh: 850,
    cop: 3.2,
    replacedFuelCostEurPerKwh: 0.19,
    electricityPriceEurPerKwh: 0.19,
  },
  calculate(inputs) {
    const upfrontEur = safeNumber(inputs.upfrontEur, 7800);
    const heat = Math.min(4000, Math.max(200, safeNumber(inputs.monthlyHeatKwh, 850)));
    const cop = Math.min(5, Math.max(1.6, safeNumber(inputs.cop, 3.2)));
    const old = Math.min(0.6, Math.max(0.06, safeNumber(inputs.replacedFuelCostEurPerKwh, 0.19)));
    const elec = Math.min(0.6, Math.max(0.08, safeNumber(inputs.electricityPriceEurPerKwh, 0.19)));

    // Old cost: heat * old. New electric input: heat / COP * elec.
    const monthlyOld = heat * old;
    const monthlyNew = (heat / cop) * elec;
    const annualSavings = Math.max(0, (monthlyOld - monthlyNew) * 12);

    return makeResult({
      upfrontEur,
      annualSavingsEur: annualSavings,
      summary: {
        title: "Soojuspump tasub, kui asendad kallima soojuse odavama elektrikuluga.",
        bestFit: "Suurem soojusvajadus + hea COP + korrektne paigaldus.",
        bullets: [
          `Soojuse vajadus (eeldus): ~${Math.round(heat)} kWh/kuu.`,
          `COP (eeldus): ${cop.toFixed(1)}.`,
          `Vana vs uus kulu: ${round2(monthlyOld)} € → ${round2(monthlyNew)} € / kuu.`,
        ],
      },
      assumptions: [
        { label: "Soojuse vajadus", value: `${Math.round(heat)} kWh/kuu` },
        { label: "COP", value: `${cop.toFixed(1)}` },
        { label: "Vana soojuse hind", value: `${old.toFixed(2)} €/kWh` },
        { label: "Elektri hind", value: `${elec.toFixed(2)} €/kWh` },
      ],
    });
  },
};

export type PeakShavingInputs = {
  upfrontEur: number;
  peakKwReduced: number;
  networkChargeEurPerKwMonth: number;
  monthsPerYear: number;
};

const peakShaving: SimulationDefinition<PeakShavingInputs> = {
  type: "peak_shaving",
  title: "Peak shaving",
  subtitle: "Tipukoormuse vähendus võrgutasu mõjus.",
  defaultInputs: {
    upfrontEur: 2200,
    peakKwReduced: 3,
    networkChargeEurPerKwMonth: 6.5,
    monthsPerYear: 12,
  },
  calculate(inputs) {
    const upfrontEur = safeNumber(inputs.upfrontEur, 2200);
    const kw = Math.min(25, Math.max(0.5, safeNumber(inputs.peakKwReduced, 3)));
    const fee = Math.min(30, Math.max(0.5, safeNumber(inputs.networkChargeEurPerKwMonth, 6.5)));
    const months = Math.min(12, Math.max(6, Math.round(safeNumber(inputs.monthsPerYear, 12))));

    const annualSavings = kw * fee * months;
    return makeResult({
      upfrontEur,
      annualSavingsEur: annualSavings,
      summary: {
        title: "Peak shaving aitab siis, kui võrgutasu sõltub tipust.",
        bestFit: "Äriobjekt või EV/boiler koormus, kus tipp on kontrollitav.",
        bullets: [
          `Tipu vähenemine: ${kw.toFixed(1)} kW.`,
          `Võrgutasu: ${fee.toFixed(2)} €/kW/kuu • ${months} kuud/a.`,
          "Praegu arvestame ainult võrgutasu säästu.",
        ],
      },
      assumptions: [
        { label: "Tipu vähenemine", value: `${kw.toFixed(1)} kW` },
        { label: "Võrgutasu", value: `${fee.toFixed(2)} €/kW/kuu` },
        { label: "Arvestusperiood", value: `${months} kuud/a` },
      ],
    });
  },
};

export const SIM_DEFINITIONS: Record<SimulationType, SimulationDefinition<any>> = {
  solar,
  battery,
  ev_charger: evCharger,
  heat_pump: heatPump,
  peak_shaving: peakShaving,
};

export function listSimulators() {
  return (Object.values(SIM_DEFINITIONS) as SimulationDefinition<Record<string, unknown>>[]).map((d) => ({
    type: d.type,
    title: d.title,
    subtitle: d.subtitle,
  }));
}

