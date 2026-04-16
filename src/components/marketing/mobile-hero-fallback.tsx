"use client";

import { Badge } from "@/components/ui/badge";

export function MobileHeroFallback({ label }: { label?: string }) {
  return (
    <div className="ep-cinema-card relative overflow-hidden p-6 md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_340px_at_20%_10%,oklch(0.83_0.14_205_/_16%),transparent_62%),radial-gradient(560px_300px_at_85%_40%,oklch(0.82_0.16_145_/_12%),transparent_65%),radial-gradient(540px_300px_at_50%_110%,oklch(0.95_0.04_85_/_8%),transparent_55%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 ep-grid-overlay opacity-[0.14]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="cyan" className="border-[oklch(0.83_0.14_205_/_35%)] shadow-[0_0_18px_-6px_oklch(0.83_0.14_205_/_0.4)]">
            Intelligence Core
          </Badge>
          {label ? <Badge variant="warm">{label}</Badge> : null}
        </div>

        <div className="mt-6">
          <p className="ep-display text-base font-semibold tracking-tight">Energia fookuses. Tekst juhib.</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            3D stseen on siin kergem: säilib sügav kontrast ja elektriline signaal, ilma et see võtaks ekraani üle.
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

