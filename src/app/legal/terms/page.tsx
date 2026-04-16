import type { Metadata } from "next";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Kasutustingimused — Energiapiloot",
  description: "Energiapiloodi kasutustingimused ja teenuse üldised reeglid (avalik test-build).",
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
          Need tingimused kirjeldavad avalikku test-buildi. Enne ametlikku lansseerimist täpsustame juriidilise isiku,
          hinnastuse, vastutuse ja teenuse SLA detailid.
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
            <p className="font-medium text-foreground/85">3) Kasutusreeglid</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Teenust ei tohi kuritarvitada (nt ründe- või pettuskatsed, automaatpäringud, mis segavad teenust).</li>
              <li>Väljundid on abivahend otsuseks; lõplik vastutus jääb kasutajale.</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">4) Konto ja sisselogimine</p>
            <p className="mt-2">
              Avalikus test-buildis ei ole konto loomine ega sisselogimine vajalik. Kui hiljem lisandub konto (nt salvestus,
              objektid, rollid), täpsustame siin konto reeglid ja vastutused.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">5) Hinnastamine ja arveldus</p>
            <p className="mt-2">
              Hetkel on teenus avatud testimiseks täisversioonina. Hinnastamine ja arveldus täpsustuvad enne ametlikku lansseerimist.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">6) Lõpetamine</p>
            <p className="mt-2">
              Testrežiimis võid kasutamise igal ajal lõpetada. Tootmisse minnes lisame selge protsessi andmete kustutamiseks ja eksportimiseks.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">7) Kontakt</p>
            <p className="mt-2">
              Küsimuste korral kirjuta:{" "}
              <span className="break-all underline underline-offset-4">support@energiapiloot.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
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

