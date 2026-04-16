import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";

export default function PricingPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">Hinnad</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Lihtsad paketid kodust kuni väikeettevõtteni.
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Stripe-valmis arvelduse lisame järgmisena. See leht defineerib paketid, mille
          külge tasuline ligipääs kinnitub.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <PlanCard
            name="Tasuta"
            price="€0"
            blurb="Baasmodelleerimine + 1 salvestatud stsenaarium."
            cta={{ label: "Alusta tasuta", href: "/register" }}
          />
          <PlanCard
            name="Pro"
            price="€12/mo"
            blurb="Piiramatu stsenaarium + täpsemad simulaatorid."
            cta={{ label: "Liitu ootenimekirjaga", href: "/register" }}
            highlight
          />
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
