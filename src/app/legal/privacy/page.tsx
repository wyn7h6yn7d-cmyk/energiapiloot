import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Legal
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Privacy policy
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Placeholder policy for the MVP foundation. We’ll replace this with a proper
          policy before launch.
        </p>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-foreground/65 backdrop-blur-md">
          <p className="font-medium text-foreground/80">In short</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>We collect the minimum data required to provide the service.</li>
            <li>Your scenarios and inputs are private by default.</li>
            <li>We do not sell personal data.</li>
          </ul>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <LinkButton href="/legal/terms" variant="outline">
            Terms
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            Back to home
          </LinkButton>
        </div>
      </div>
    </MarketingShell>
  );
}

