import Link from "next/link";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Turvalisus — Energiapiloot",
  description:
    "Energiapiloot on ehitatud turvalise autentimise, RLS reeglite ja auditeeritava andmemudeliga.",
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
            Energiapilooti ehitame tootmiskindla arhitektuuriga: turvaline autentimine, vähimõiguse põhimõte ja
            auditeeritavad andmevood.
          </p>
        </div>

        <div className="mt-2 grid gap-4">
          <SecurityCard
            title="Autentimine"
            body="Supabase Auth, turvaline sessioonihaldus ja selge eraldus avalehe ning rakenduse vahel."
          />
          <SecurityCard
            title="Andmepääs"
            body="Row-level security (RLS) reeglid kaitsevad kogu kasutajaandmestikku. Ei jagatud stsenaariume, ei juhuslikku lekkimist."
          />
          <SecurityCard
            title="Maksed"
            body="Stripe-valmis arvelduse struktuur webhooki verifitseerimisega ja minimaalse makseinfo talletamisega."
          />
        </div>

        <div className="mt-10 flex items-center gap-3">
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

