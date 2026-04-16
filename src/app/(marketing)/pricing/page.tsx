import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/ui/pricing-card";
import { PLANS, formatPrice, type BillingInterval } from "@/lib/billing/plans";

export default function PricingPage() {
  const interval: BillingInterval = "monthly";

  return (
    <MarketingShell>
      <div className="max-w-5xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">Hinnad</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Paketid, mis kasvavad koos sinu energiavajadusega.
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          MVP paywall töötab juba plaanide järgi (Free → Plus → Pro → Business).
          Stripe ühendame järgmises etapis; hinnastuse konfiguratsioon on selleks valmis.
        </p>

        <div className="mt-7 flex items-center gap-2">
          <Badge variant="cyan">Kuu</Badge>
          <Badge variant="neutral">Aasta (tulemas toggle)</Badge>
          <span className="text-xs text-foreground/55">
            MVP-s näitame kuu hinnastust; yearly toggle lisandub UX-ina järgmisena.
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <PricingCard
              key={p.id}
              name={p.name}
              price={formatPrice(p.id, interval)}
              badge={p.badge}
              description={p.tagline}
              features={p.features}
              cta={{
                label: p.id === "free" ? "Alusta tasuta" : "Uuenda",
                href: p.id === "free" ? "/register" : "/register",
              }}
              highlight={p.highlight}
            />
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-border/50 bg-card/20 p-6">
          <p className="text-xs font-medium tracking-wide text-foreground/60">Võrdlus (MVP)</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border/40 bg-card/25 p-4">
              <p className="text-sm font-semibold">Free vs Plus</p>
              <p className="mt-2 text-sm text-foreground/65">
                Plus avab rohkem simulaatoreid, rohkem salvestatud stsenaariume ja laiendab raportite valikut.
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/25 p-4">
              <p className="text-sm font-semibold">Pro vs Business</p>
              <p className="mt-2 text-sm text-foreground/65">
                Business on meeskonnale: organisatsioonid, mitme objekti tugi ja rollid (järgmised iteratsioonid).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <LinkButton href="/" variant="ghost">
            Tagasi avalehele
          </LinkButton>
        </div>

        <p className="mt-10 text-xs text-foreground/55">
          Detailid? Vaata{" "}
          <Link className="underline underline-offset-4" href="/security">
            Turvalisus
          </Link>{" "}
          ja{" "}
          <Link className="underline underline-offset-4" href="/legal/privacy">
            Privaatsuspoliitika
          </Link>
          .
        </p>
      </div>
    </MarketingShell>
  );
}
