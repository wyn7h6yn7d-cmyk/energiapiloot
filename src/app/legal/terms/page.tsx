import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Legal
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Terms of service
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Placeholder terms for the MVP foundation. We’ll replace this with proper
          terms before launch.
        </p>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-foreground/65 backdrop-blur-md">
          <p className="font-medium text-foreground/80">MVP terms summary</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Energiapiloot provides decision support, not legal or financial advice.</li>
            <li>Simulation results are estimates and may differ from actual outcomes.</li>
            <li>You control your data; you can request deletion.</li>
          </ul>
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

