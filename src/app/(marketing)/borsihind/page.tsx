import type { Metadata } from "next";

import { MarketPriceBoard } from "@/components/marketing/market-price-board";
import { MarketingShell } from "@/components/layout/marketing-shell";

export const metadata: Metadata = {
  title: "Börsihind — Energiapiloot",
  description: "Börsihinna live-vaade: hetkehinnang, tänane/homne graafik ja 15-min vaade (preview).",
};

export default function MarketPricePage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-5xl">
        <div className="ep-cinema-panel relative mb-10 overflow-hidden rounded-[1.75rem] p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[oklch(0.83_0.14_205_/_0.14)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.45)] to-transparent"
          />
          <p className="ep-eyebrow-caps text-foreground/50">Börsihind</p>
          <h1 className="ep-display mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Live-vaade hinnale, mis liigub.
          </h1>
          <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
            Näed tänase ja homse (kui avaldatud) börsihinna ning kiiret 15-min vaadet. Avalik test-build: eesmärk on anda
            üks selge signaal, mitte tekitada hõõrdumist.
          </p>
        </div>

        <MarketPriceBoard area="EE" />
      </div>
    </MarketingShell>
  );
}

