import Link from "next/link";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Kasutustingimused — Energiapiloot",
  description: "Energiapiloodi kasutustingimused ja teenuse üldised reeglid (eelversioon).",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Õigus
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Kasutustingimused
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Allolev on eelversioon, mida täiendame enne ametlikku kasutuselevõttu. Enne lansseerimist täpsustame juriidilise
          isiku, hinnastuse, vastutuse ja teenuse SLA detailid.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-foreground/70 backdrop-blur-md">
          <section>
            <p className="font-medium text-foreground/85">1) Teenuse kirjeldus</p>
            <p className="mt-2">
              Energiapiloot on energiaotsuste platvorm (otsustustugi), mis aitab võrrelda lepinguid,
              mõista tarbimist ja hinnata investeeringuid.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">2) Oluline piirang</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Teenuse väljundid on hinnangud, mitte garanteeritud tulemus.</li>
              <li>Energiapiloot ei ole juriidiline, finants- ega maksunõustamine.</li>
              <li>Otsus ja vastutus jääb kasutajale.</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">3) Konto ja kasutus</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Sa vastutad oma konto turvalisuse eest (parool, ligipääs).</li>
              <li>Sa ei tohi teenust kuritarvitada (nt ründe- või pettuskatsed).</li>
              <li>Business paketis võivad lisanduda rollid ja auditilogid.</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">4) Hinnastamine ja arveldus</p>
            <p className="mt-2">
              Pakettide hinnad ja arveldus toimuvad vastavalt hinnastuse lehele. Stripe arveldusportaal lisandub hiljem.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">5) Lõpetamine</p>
            <p className="mt-2">
              Sa võid konto sulgeda. Enne automaatset konto kustutamist lisame kinnituse ja auditijälje.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">6) Kontakt</p>
            <p className="mt-2">
              Küsimuste korral kirjuta: <span className="underline underline-offset-4">support@energiapiloot.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <LinkButton href="/legal/privacy" variant="outline">
            Privaatsus
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

