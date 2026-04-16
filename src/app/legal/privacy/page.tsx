import Link from "next/link";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Privaatsuspoliitika — Energiapiloot",
  description: "Kuidas Energiapiloot kogub ja töötleb andmeid ning kuidas kaitseme sinu privaatsust.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Õigus
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Privaatsuspoliitika
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Allolev on startup-ready struktuur (MVP). Enne lansseerimist täpsustame andmekategooriad,
          alatöötlejad ja kontaktandmed vastavalt reaalsele tooteseadistusele.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-foreground/70 backdrop-blur-md">
          <section>
            <p className="font-medium text-foreground/85">1) Andmete vastutav töötleja</p>
            <p className="mt-2">
              Energiapiloot (edaspidi “Teenusepakkuja”). Täpsed juriidilised andmed lisanduvad enne lansseerimist.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">2) Milliseid andmeid kogume</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Kontoandmed: e-post, sisselogimise info (sessiooniküpsised).</li>
              <li>Profiil: kasutajatüüp (kodu/äri), objekti nimi/tüüp, eelistused.</li>
              <li>Sisendid: lepingute detailid, simulatsioonide konfiguratsioon, stsenaariumid.</li>
              <li>Tehnilised logid: turvalisuse ja veaotsingu minimaalsed logid.</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">3) Milleks me andmeid kasutame</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Teenuse osutamine: analüüsid, simulatsioonid, raportid.</li>
              <li>Turvalisus: pettuse ja kuritarvituse ennetus.</li>
              <li>Toote kvaliteet: veaparandus ja jõudluse jälgimine (vajaduspõhiselt).</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">4) Õiguslik alus</p>
            <p className="mt-2">
              Teenuse osutamine (leping), õigustatud huvi (turvalisus), ning vajadusel nõusolek (küpsised/analüütika).
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">5) Säilitamine</p>
            <p className="mt-2">
              Säilitame andmeid ainult nii kaua, kui see on teenuse osutamiseks ja turvalisuseks vajalik.
              Konto sulgemisel saad taotleda andmete kustutamist.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">6) Sinu õigused</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Ligipääs, parandamine, kustutamine ja töötlemise piiramine.</li>
              <li>Andmete ülekantavus (kui kohaldub).</li>
              <li>Nõusoleku tagasivõtmine (kui kasutame nõusolekut).</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">7) Kontakt</p>
            <p className="mt-2">
              Küsimuste korral kirjuta: <span className="underline underline-offset-4">privacy@energiapiloot.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <LinkButton href="/legal/terms" variant="outline">
            Tingimused
          </LinkButton>
          <LinkButton href="/legal/cookies" variant="outline">
            Küpsised
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            Tagasi avalehele
          </LinkButton>
        </div>
      </div>
    </MarketingShell>
  );
}

