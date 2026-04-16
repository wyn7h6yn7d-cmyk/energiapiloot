import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function AccountPage() {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium tracking-wide text-foreground/60">
        Account
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
        Profile & billing
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70">
        This page will hold profile settings, plan details, and billing management.
        Stripe + Supabase will connect here.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
          <p className="text-sm font-semibold">Plan</p>
          <p className="mt-2 text-sm text-foreground/65">Free (placeholder)</p>
          <div className="mt-5">
            <LinkButton href="/pricing" variant="outline">
              View pricing
            </LinkButton>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
          <p className="text-sm font-semibold">Session</p>
          <p className="mt-2 text-sm text-foreground/65">
            Supabase session wiring comes next.
          </p>
          <div className="mt-5">
            <Button variant="outline" disabled>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

