import { getAdapters } from "@/lib/api/adapters/registry";
import { globalMemoryCache } from "@/lib/api/cache/memory-cache";
import type { InvestmentSimulationInput, InvestmentSimulationOutput, WeatherSnapshot } from "@/lib/domain/models";
import type { Profile } from "@/lib/supabase/profile";
import type { SiteRow } from "@/lib/supabase/site";

import { profileToEnergySite } from "@/lib/server/repositories/user-energy-context";
import { getCachedDayAheadPrices } from "@/lib/server/services/nord-pool-service";

export type SolarSimulationServerResult = {
  pvgisAnnualKwh: number;
  selfConsumptionAssumption: number;
  spotEurPerKwh: number;
  output: InvestmentSimulationOutput;
  weather?: WeatherSnapshot | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export async function runSolarSimulationServer(input: {
  userId: string;
  profile: Profile | null;
  site: SiteRow;
  peakPowerKwp: number;
  tiltDeg?: number;
  azimuthDeg?: number;
  lossPercent?: number;
  upfrontEur: number;
  selfConsumptionRatio?: number;
}): Promise<SolarSimulationServerResult> {
  const { env, pvgis, openMeteo } = getAdapters();
  const energySite = profileToEnergySite(input.profile, input.site);
  const lat = energySite.coordinates?.lat ?? 59.437;
  const lng = energySite.coordinates?.lng ?? 24.7536;

  const tilt = input.tiltDeg ?? 30;
  const azimuth = input.azimuthDeg ?? 0;
  const loss = input.lossPercent ?? 14;

  const cacheKey = `pvgis:sim:${input.userId}:${lat.toFixed(3)}:${lng.toFixed(3)}:${input.peakPowerKwp}:${tilt}:${azimuth}:${loss}`;
  const estimate = await globalMemoryCache.getOrSet(cacheKey, env.CACHE_PVGIS_TTL_SEC, async () => {
    const r = await pvgis.estimateSolar({
      lat,
      lng,
      peakPowerKwp: input.peakPowerKwp,
      tiltDeg: tilt,
      azimuthDeg: azimuth,
      lossPercent: loss,
    });
    if (!r.ok) throw r.error;
    return r.data;
  });

  const { series: prices } = await getCachedDayAheadPrices({ days: 3 });
  const spotEurPerKwh =
    prices.points.length > 0
      ? prices.points.reduce((a, p) => a + p.value, 0) / prices.points.length / 1000
      : 0.12;

  const weatherResult = await openMeteo.getCurrent({ lat, lng });
  const weather = weatherResult.ok ? weatherResult.data : null;

  const selfConsumption = clamp(input.selfConsumptionRatio ?? 0.38, 0.12, 0.78);
  const displacedKwhYear = estimate.annualProductionKwh * selfConsumption;
  const annualSavingsEur = displacedKwhYear * spotEurPerKwh;
  const paybackYears = annualSavingsEur > 0 ? input.upfrontEur / annualSavingsEur : 99;

  const output: InvestmentSimulationOutput = {
    type: "solar",
    annualSavingsEur: Math.round(annualSavingsEur * 100) / 100,
    monthlySavingsEur: Math.round((annualSavingsEur / 12) * 100) / 100,
    paybackYears: Math.round(paybackYears * 10) / 10,
    assumptionsEt: [
      `PVGIS / ${estimate.source}: aastane toodang ~${Math.round(estimate.annualProductionKwh)} kWh.`,
      `Oma-tarbimise eeldus: ${Math.round(selfConsumption * 100)}%.`,
      `Keskmine börsi energia komponent (normaliseeritud): ~${spotEurPerKwh.toFixed(3)} €/kWh.`,
      weather
        ? `Open-Meteo: õhk ${weather.temperatureC.toFixed(1)} °C (kontekst, mitte PVGIS asendus).`
        : "Ilm: mock / puudub.",
    ],
    monthlyProductionKwh: estimate.monthlyKwh.map((m) => m.kwh),
  };

  return {
    pvgisAnnualKwh: estimate.annualProductionKwh,
    selfConsumptionAssumption: selfConsumption,
    spotEurPerKwh,
    output,
    weather,
  };
}

export function buildInvestmentSimulationInputFromDefaults(input: {
  profile: Profile | null;
  site: SiteRow;
}): InvestmentSimulationInput {
  const site = profileToEnergySite(input.profile, input.site);
  return {
    type: "solar",
    site,
    peakPowerKwp: 6,
    tiltDeg: 30,
    azimuthDeg: 0,
    upfrontEur: 8500,
    avgSpotEurPerKwh: 0.12,
  };
}
