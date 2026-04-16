import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";
import { PricingCard } from "@/components/ui/pricing-card";

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
          <PricingCard
            name="Tasuta"
            price="0 €"
            description="Kiire baasanalüüs ja lihtsad otsused."
            features={[
              "Baasjoon ja kiire ülevaade",
              "1 salvestatud stsenaarium",
              "Põhilised soovitused",
            ]}
            cta={{ label: "Alusta tasuta", href: "/register" }}
          />
          <PricingCard
            name="Pro"
            price="12 € / kuu"
            badge="Soovitus"
            description="Täielik tööriistakast investeeringute ja lepingute jaoks."
            features={[
              "Piiramatu stsenaarium",
              "Täiendatud simulaatorid",
              "Raportid ja eksport",
            ]}
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
