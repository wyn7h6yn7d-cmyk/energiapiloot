import Link from "next/link";

import { LinkButton } from "@/components/ui/link-button";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium tracking-wide text-foreground/60">
        Seaded
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
        Profiil ja arveldus.
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70">
        Kohatäide. Siia tulevad profiil, pakett, arveldusportaal ja sessioonihaldus.
      </p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
        <p className="text-sm font-semibold">Pakett</p>
        <p className="mt-2 text-sm text-foreground/65">Tasuta (kohatäide)</p>
        <div className="mt-5">
          <LinkButton href="/pricing" variant="outline">
            Vaata hindu
          </LinkButton>
        </div>
      </div>

      <p className="mt-8 text-xs text-foreground/55">
        Usaldus ja õigus:{" "}
        <Link className="underline underline-offset-4" href="/security">
          Turvalisus
        </Link>
        .
      </p>
    </div>
  );
}

