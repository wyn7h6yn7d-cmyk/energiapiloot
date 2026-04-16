import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function SecurityPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Turvalisus
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Usaldus vaikimisi.
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Energiapilooti ehitame tootmiskindla arhitektuuriga: turvaline autentimine,
          vähimõiguse põhimõte ja auditeeritavad andmevood.
        </p>

        <div className="mt-8 grid gap-4">
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
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65">{body}</p>
    </div>
  );
}

