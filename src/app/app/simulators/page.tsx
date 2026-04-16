import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function SimulatorsPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium tracking-wide text-foreground/60">
        Simulators
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
        Evaluate upgrades with scenarios.
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70">
        We’ll ship the first working simulator next (solar savings). Then we expand to
        battery, EV charging, heat pump, and peak shaving.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <SimulatorCard
          title="Solar"
          body="Estimate production and payback using a simple baseline model."
          href="/app/simulators/solar"
        />
        <SimulatorCard
          title="Battery"
          body="Peak shaving and spot arbitrage. Coming soon."
          disabled
        />
        <SimulatorCard
          title="EV charging"
          body="Shift charging windows and compare contract types. Coming soon."
          disabled
        />
        <SimulatorCard
          title="Heat pump"
          body="Load impact and savings estimate. Coming soon."
          disabled
        />
      </div>
    </div>
  );
}

function SimulatorCard({
  title,
  body,
  href,
  disabled,
}: {
  title: string;
  body: string;
  href?: string;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65">{body}</p>
      <div className="mt-5">
        {href && !disabled ? (
          <LinkButton href={href} variant="outline">
            Open
          </LinkButton>
        ) : (
          <Button variant="outline" disabled>
            Coming soon
          </Button>
        )}
      </div>
    </div>
  );
}

