import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

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
          MVP vundamendi ajutine tekst. Asendame selle enne lansseerimist korrektse
          poliitikaga.
        </p>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-foreground/65 backdrop-blur-md">
          <p className="font-medium text-foreground/80">Lühidalt</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Kogume ainult teenuse osutamiseks vajaliku minimaalse andmestiku.</li>
            <li>Sinu stsenaariumid ja sisendid on vaikimisi privaatsed.</li>
            <li>Me ei müü isikuandmeid.</li>
          </ul>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <LinkButton href="/legal/terms" variant="outline">
            Tingimused
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            Tagasi avalehele
          </LinkButton>
        </div>
      </div>
    </MarketingShell>
  );
}

