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
          Ava täielik Energiapiloot — ilma kontota.
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Energiapiloot on avalik energiaotsuste stuudio: leping, tarbimine ja simulatsioonid brauseris. Osaliselt näed
          tulemust kohe; sügav analüüs, salvestus ja PDF tulevad ühe ostu / avamisega. Stripe makse ja aruannete
          genereerimine ühendatakse API-dega, mis on juba eraldi marsruutides ette valmistatud.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Badge variant="cyan">Premium avamine</Badge>
          <Badge variant="neutral">Stripe (järgmine iteratsioon)</Badge>
          <span className="text-xs text-foreground/55">Seniks: demo avamine ja struktuurne ostu API.</span>
        </div>

        <section id="avamine" className="mt-12 scroll-mt-28 rounded-3xl border border-[oklch(0.83_0.14_205_/_0.28)] bg-card/30 p-8 shadow-[0_0_80px_-40px_oklch(0.83_0.14_205_/_0.55)] backdrop-blur-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[oklch(0.83_0.14_205)]">Avamine</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight">Mida premium avab?</h2>
          <ul className="mt-5 space-y-3 text-sm text-foreground/75">
            <li>• Täielik lepingu intelligentsus ja võrdlusgraafikud</li>
            <li>• Tarbimise draiverid, lipud ja säästuplaani täissügavus</li>
            <li>• Investeeringu domeenikiht, cashflow ja tundlikkuse graafikud</li>
            <li>• Tulevikus: kohene Stripe checkout + allalaaditav PDF raport</li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton href="/?unlock=demo" variant="gradient" className="shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.7)]">
              Proovi demo avamist
            </LinkButton>
          </div>
          <p className="mt-3 font-mono text-[11px] text-foreground/50">
            POST /api/checkout/unlock · POST /api/reports/premium (stubid, 501)
          </p>
          <p className="mt-4 text-xs text-foreground/55">
            Ostu API tagastab praegu 501; edasi ühendame Stripe Checkout Sessioni ja määrame{" "}
            <code className="rounded-md bg-card/50 px-1.5 py-0.5 text-[11px]">ep_unlock</code> küpsise.
          </p>
        </section>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <PricingCard
              key={p.id}
              name={p.name}
              price={formatPrice(p.id, interval)}
              badge={p.badge}
              description={p.tagline}
              features={p.features}
              cta={{
                label: p.id === "free" ? "Ava tööriistad" : "Vali see tase",
                href: "/pricing#avamine",
              }}
              highlight={p.highlight}
            />
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-border/50 bg-card/20 p-6">
          <p className="text-xs font-medium tracking-wide text-foreground/60">Miks mitte “tasuta konto”?</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/70">
            Kontovaba mudel vähendab hõõrdumist ja hoiab fookuse otsusel. Kui hiljem lisandub meeskonnatöö või
            salvestatud objektid, saame need ühendada sama premium avamise kihiga — ilma et peaksid kolima teise
            tootesse.
          </p>
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
