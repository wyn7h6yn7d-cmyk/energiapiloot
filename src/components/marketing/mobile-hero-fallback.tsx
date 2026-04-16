"use client";

import { Badge } from "@/components/ui/badge";

export function MobileHeroFallback({ label }: { label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/20 p-6 shadow-[var(--shadow-elev-2)] backdrop-blur-md">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_340px_at_20%_10%,rgba(38,230,255,0.18),transparent_62%),radial-gradient(560px_300px_at_85%_40%,rgba(46,242,181,0.14),transparent_65%),radial-gradient(540px_300px_at_50%_110%,rgba(245,239,196,0.08),transparent_55%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 ep-grid-overlay opacity-[0.18]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="cyan">Premium mobiilrežiim</Badge>
          {label ? <Badge variant="warm">{label}</Badge> : null}
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold tracking-tight">Lightning Intelligence Core</p>
          <p className="mt-2 text-sm text-foreground/65">
            Kergem renderdus, sama lugu. Tekst jääb alati loetavaks ja scroll sujuvaks.
          </p>
        </div>

        <svg
          className="mt-6 h-36 w-full"
          viewBox="0 0 560 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M20 92 C 110 22, 170 142, 260 78 C 330 30, 380 130, 470 70 C 510 44, 530 58, 540 66"
            stroke="rgba(38,230,255,0.85)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M34 118 C 120 56, 180 138, 266 96 C 336 62, 390 128, 478 92"
            stroke="rgba(46,242,181,0.75)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M300 18 L 260 78 L 312 78 L 268 148"
            stroke="rgba(245,239,196,0.8)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="280" cy="82" r="26" stroke="rgba(38,230,255,0.35)" strokeWidth="2" />
          <circle cx="280" cy="82" r="52" stroke="rgba(46,242,181,0.22)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

