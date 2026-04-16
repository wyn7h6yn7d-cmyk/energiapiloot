import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function AppHomePage() {
  return (
    <div className="grid gap-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground/60">
            Dashboard
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
            Your next best energy decision.
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-foreground/70">
            This is the SaaS foundation. Next we’ll connect Supabase auth + onboarding,
            then ship the first working simulator and scenario persistence.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <LinkButton href="/app/onboarding">Run onboarding</LinkButton>
          <LinkButton href="/pricing" variant="outline">
            Upgrade
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Baseline" value="Not set" hint="Complete onboarding." />
        <Card title="Potential savings" value="—" hint="Requires a scenario." />
        <Card title="Peak impact" value="—" hint="Add interval data later." />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          title="Saved scenarios"
          body="Store what-if upgrades and compare outcomes."
          cta={{ label: "Open scenarios", href: "/app/scenarios" }}
        />
        <Panel
          title="Simulators"
          body="Solar, battery, EV charging, heat pump, peak shaving."
          cta={{ label: "Open simulators", href: "/app/simulators" }}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
      <p className="text-xs text-foreground/60">{title}</p>
      <p className="mt-2 font-mono text-xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-foreground/55">{hint}</p>
    </div>
  );
}

function Panel({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65">{body}</p>
      <div className="mt-5">
        <LinkButton href={cta.href} variant="outline">
          {cta.label}
        </LinkButton>
      </div>
    </div>
  );
}

