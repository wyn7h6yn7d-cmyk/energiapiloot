import type { Metadata } from "next";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Turvalisus — Energiapiloot",
  description:
    "Turvapõhimõtted avalikus test-buildis: minimaalne ligipääs, jälgitav loogika ja kontrollitud integratsioonid.",
};

export default function SecurityPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <div className="ep-cinema-panel relative mb-10 overflow-hidden rounded-[1.75rem] p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[oklch(0.82_0.16_145_/_0.12)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.45)] to-transparent"
          />
          <p className="ep-eyebrow-caps text-foreground/50">Turvalisus</p>
          <h1 className="ep-display mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Usaldus vaikimisi.
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
            See build on avalik testrežiim (ilma konto- ja ostuvoota). Turvapõhimõtted on samad: minimaalne ligipääs,
            jälgitav loogika ja kontrollitud integratsioonid. Kui mingi osa on testis lihtsustatud, ütleme seda otse.
          </p>
        </div>

        <div className="mt-2 grid gap-4">
          <SecurityCard
            title="Minimaalne ligipääs"
            body="Serveripoolsed adapterid ja validaatorid hoiavad integratsioonide loogika serveris. Kliendile jõuab ainult vajalik väljund."
          />
          <SecurityCard
            title="Privaatsus ja läbipaistvus"
            body="Sa sisestad ise eeldused; me kasutame neid tulemuse arvutamiseks. Eesmärk on eemaldada “musta kasti” tunne ja hoida otsus arusaadav."
          />
          <SecurityCard
            title="Töökindlus"
            body="Välised teenused on kapseldatud adapteritesse (timeout + retry), et viga ei lõhuks kogu kasutajakogemust."
          />
          <SecurityCard
            title="Logid ja jälgimine"
            body="Kasutame minimaalseid tehnilisi logisid turvalisuse ja veaotsingu jaoks. Me ei tee avalikus test-buildis väiteid “täieliku auditi” kohta enne, kui vastavad süsteemid on päriselt kasutusel."
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <LinkButton href="/legal/privacy" variant="outline">
            Privaatsus
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            Tagasi avalehele
          </LinkButton>
        </div>
      </div>
    </MarketingShell>
  );
}

function SecurityCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="ep-cinema-card relative p-6 md:p-7">
      <div className="relative z-10">
        <p className="text-sm font-semibold tracking-tight text-foreground/90">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/65">{body}</p>
      </div>
    </div>
  );
}

