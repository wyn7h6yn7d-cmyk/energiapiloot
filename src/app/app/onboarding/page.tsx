import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium tracking-wide text-foreground/60">
        Onboarding
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
        Build your baseline.
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70">
        We’ll capture household vs SMB, region (EE/LV/LT), contract preferences, and
        a baseline usage estimate to initialize your first scenario.
      </p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
        <p className="text-sm font-medium">Coming next</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/65">
          <li>Supabase-backed profile + scenario creation</li>
          <li>Consumption input (monthly kWh + optional peak window)</li>
          <li>Contract selection (fixed vs spot)</li>
        </ul>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <LinkButton href="/app">Back to dashboard</LinkButton>
        <LinkButton href="/app/simulators" variant="outline">
          Explore simulators
        </LinkButton>
      </div>
    </div>
  );
}

