import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function PricingPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Pricing
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Simple plans that scale from household to SMB.
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          We’re wiring in Stripe-ready billing next. For now, this page is the
          structure your paywall will hang from.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="€0"
            blurb="Baseline modeling + 1 saved scenario."
            cta={{ label: "Start free", href: "/sign-up" }}
          />
          <PlanCard
            name="Pro"
            price="€12/mo"
            blurb="Unlimited scenarios + advanced simulators."
            cta={{ label: "Join waitlist", href: "/sign-up" }}
            highlight
          />
        </div>

        <div className="mt-10">
          <LinkButton href="/" variant="ghost">
            Back to home
          </LinkButton>
        </div>
      </div>
    </MarketingShell>
  );
}

function PlanCard({
  name,
  price,
  blurb,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  blurb: string;
  cta: { label: string; href: string };
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-card/40 p-6 backdrop-blur-md",
        highlight
          ? "border-[oklch(0.83_0.14_205_/60%)] shadow-[0_0_0_1px_oklch(0.83_0.14_205_/20%),0_12px_60px_-30px_oklch(0.83_0.14_205_/30%)]"
          : "border-border/60",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{name}</p>
        <p className="font-mono text-sm text-foreground/80">{price}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65">{blurb}</p>
      <div className="mt-6">
        <LinkButton href={cta.href} variant={highlight ? "default" : "outline"}>
          {cta.label}
        </LinkButton>
      </div>
    </div>
  );
}

