import type { ContractIntelligence } from "@/lib/domain/contracts/intelligence";
import type { ConsumptionIntelligence } from "@/lib/domain/consumption/intelligence";
import { round2 } from "@/lib/domain/utils/math";

export function explainContractHeadline(ci: ContractIntelligence): string {
  if (ci.isMarginalDifference) {
    return "Lepingu tüübi vahet ei tasu praegu üle tähtsustada — numbrid on liiga lähedal.";
  }
  if (ci.analysis.current.type !== ci.analysis.recommendation.bestFit) {
    return `Leping: mudel näitab, et ${typeEt(ci.analysis.recommendation.bestFit)} võiks olla parem kooskõla sinu mustriga.`;
  }
  return "Leping: praegune valik on suhteliselt mõistlik — fookus võib olla käitumisel ja mõõdul.";
}

function typeEt(t: string) {
  if (t === "spot") return "börsihind";
  if (t === "fixed") return "fikseeritud hind";
  return "hübriid";
}

export function explainPeakHoursPlain(peak0to100: number): string {
  if (peak0to100 >= 72) {
    return "Suur osa elektrist kulub tõenäoliselt kallimatesse tundidesse — see teeb börsilepingu kallimaks ja ebastabiilsemaks kui paljudel teistel sarnasel tarbimisel.";
  }
  if (peak0to100 >= 52) {
    return "Sul on märgatav tipu-mõju: väike ajastus (boiler, laadimine) võib kuu kulu märgatavalt pehmendada.";
  }
  return "Tipu-sõltuvus pole domineeriv — lepingu valik ja baas-tarbimine mängivad suuremat rolli.";
}

export function explainInvestmentVerdictPlain(verdict: string, payback: number | null): string {
  if (verdict === "wait") {
    return payback !== null
      ? `Tasuvus (~${payback.toFixed(1)} a) ja riskid ei anna veel selget “tee kohe” signaali.`
      : "Eeldused ei toeta veel selget investeeringu sammu — täpsusta numbreid.";
  }
  if (verdict === "do_now") {
    return "Numbrite ja sobivuse järgi võiks see olla realistlik järgmine suurem samm — kinnita ikkagi 2–3 pakkumisega.";
  }
  return "See on pigem “uurime edasi” kui automaatne otsus — väärib pakkumisi, aga mitte kiirustamist.";
}

export function formatSavingsRange(low: number, high: number): string {
  if (high - low < 1.5) return `~${round2((low + high) / 2)} €/kuu`;
  return `${round2(low)}–${round2(high)} €/kuu`;
}
