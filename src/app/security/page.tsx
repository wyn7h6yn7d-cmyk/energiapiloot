import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function SecurityPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Security
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Trust by default.
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Energiapiloot is being built with a production-grade architecture: secure
          authentication, least-privilege access, and auditable data flows.
        </p>

        <div className="mt-8 grid gap-4">
          <SecurityCard
            title="Authentication"
            body="Supabase Auth, secure session handling, and clear separation between marketing and app routes."
          />
          <SecurityCard
            title="Data access"
            body="Row-level security (RLS) policies will gate all user data. No shared scenarios, no accidental exposure."
          />
          <SecurityCard
            title="Payments"
            body="Stripe-ready billing structure with webhook verification and minimal stored payment data."
          />
        </div>

        <div className="mt-10 flex items-center gap-3">
          <LinkButton href="/legal/privacy" variant="outline">
            Privacy
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            Back to home
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

