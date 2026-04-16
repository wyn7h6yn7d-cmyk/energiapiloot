"use client";

import type { ReactNode } from "react";

import { LinkButton } from "@/components/ui/link-button";
import { UnlockCheckoutButton } from "@/components/product/unlock-checkout-button";
import type { UnlockOfferId } from "@/lib/unlock/types";
import { cn } from "@/lib/utils";

export type PremiumTeaseVariant = "featured" | "compact";

export type LockedCta = {
  label: string;
  href: string;
  /** Triggers POST `/api/checkout/unlock` (Stripe placeholder); falls back to `href` until live. */
  checkoutOfferId?: UnlockOfferId;
};

export const DEFAULT_PREMIUM_VALUE_POINTS = [
  "Säästu ja riski sügavam kiht — samad eeldused, täpsem joon",
  "Stsenaariumid kõrvuti, et võrrelda ilma ära eksimata",
  "PDF-kokkuvõte, mida jagada või arhiivi panna",
  "Soovituste kiht põhjendustega — mitte üldistust",
  "Investeeringu ja lepingu juhis, mis jääb sõnades püsima",
] as const;

function PlasmaArc({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute text-[oklch(0.83_0.14_205_/_0.32)]", className)}
      viewBox="0 0 400 120"
      fill="none"
      aria-hidden
    >
      <path
        d="M0 96 C 80 24, 160 112, 240 56 C 300 16, 340 88, 400 40"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        className="opacity-80"
      />
      <path
        d="M20 72 C 100 28, 180 96, 260 48"
        stroke="oklch(0.82 0.16 145 / 45%)"
        strokeWidth="1"
        strokeLinecap="round"
        className="opacity-70"
      />
    </svg>
  );
}

function LockGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn("h-3.5 w-3.5", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

export function PremiumLockedBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.83_0.14_205_/_0.38)]",
        "bg-[linear-gradient(135deg,oklch(0.83_0.14_205_/_0.14),oklch(0_0_0_/_0.45))] px-3 py-1",
        "text-[10px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.88_0.08_205)]",
        "shadow-[0_0_28px_-6px_oklch(0.83_0.14_205_/_0.45),inset_0_1px_0_0_oklch(1_0_0_/_0.12)]",
        className
      )}
    >
      <LockGlyph className="text-[oklch(0.82_0.12_205)]" />
      <span>Täisvaade</span>
    </div>
  );
}

export function PremiumTeaseCard({
  variant = "featured",
  headline,
  subline,
  valuePoints,
  primaryCta,
  secondaryCta,
  tertiaryCta,
  showDemoCta = true,
  reportDeliverable,
}: {
  variant?: PremiumTeaseVariant;
  headline: string;
  subline?: string;
  valuePoints: readonly string[] | string[];
  primaryCta: LockedCta;
  secondaryCta?: LockedCta;
  tertiaryCta?: LockedCta;
  showDemoCta?: boolean;
  /** Optional block below CTAs — e.g. locked PDF / deliverable teaser */
  reportDeliverable?: ReactNode;
}) {
  const compact = variant === "compact";

  return (
    <div
      className={cn(
        "ep-premium-tease-card ep-unlock-aurora relative w-full rounded-3xl border border-[oklch(0.83_0.14_205_/_0.42)]",
        "bg-[oklch(0.09_0.02_255_/_0.94)] shadow-[0_0_88px_-28px_oklch(0.83_0.14_205_/_0.5),inset_0_1px_0_0_oklch(1_0_0_/_0.08)]",
        compact ? "max-w-md p-5 md:p-6" : "max-w-lg p-6 pb-8 md:p-8"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-90 [background:radial-gradient(520px_220px_at_50%_-35%,oklch(0.83_0.14_205_/_0.2),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.65)] to-transparent"
      />
      <div className="relative text-center sm:text-left">
        <p
          className={cn(
            "ep-eyebrow-caps text-[oklch(0.78_0.08_205)]",
            compact ? "text-[0.58rem]" : undefined
          )}
        >
          Täisvaate tulemused
        </p>
        <h3
          className={cn(
            "ep-display mt-3 text-balance font-semibold tracking-tight text-foreground/95",
            compact ? "text-lg md:text-xl" : "text-xl md:text-2xl"
          )}
        >
          {headline}
        </h3>
        {subline ? (
          <p
            className={cn(
              "mt-3 text-pretty leading-relaxed text-foreground/68",
              compact ? "text-xs md:text-sm" : "text-sm md:text-[0.95rem]"
            )}
          >
            {subline}
          </p>
        ) : null}

        <ul
          className={cn(
            "mt-5 space-y-2.5 text-left text-foreground/72",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {valuePoints.map((point) => (
            <li key={point} className="flex gap-2.5">
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_14px_oklch(0.83_0.14_205_/_0.55)]"
                aria-hidden
              />
              <span className="leading-snug">{point}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col gap-2.5 sm:gap-3">
          {primaryCta.checkoutOfferId ? (
            <UnlockCheckoutButton
              offerId={primaryCta.checkoutOfferId}
              variant="gradient"
              fallbackHref={primaryCta.href}
              size="lg"
              className="min-h-11 w-full rounded-xl px-7 text-[0.95rem] font-semibold tracking-tight shadow-[0_0_40px_-8px_oklch(0.83_0.14_205_/_0.78)] sm:w-auto sm:self-center sm:px-10"
            >
              {primaryCta.label}
            </UnlockCheckoutButton>
          ) : (
            <LinkButton
              href={primaryCta.href}
              variant="gradient"
              size="lg"
              className="min-h-11 w-full rounded-xl px-7 text-[0.95rem] font-semibold tracking-tight shadow-[0_0_40px_-8px_oklch(0.83_0.14_205_/_0.78)] sm:w-auto sm:self-center sm:px-10"
            >
              {primaryCta.label}
            </LinkButton>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
            {secondaryCta ? (
              secondaryCta.checkoutOfferId ? (
                <UnlockCheckoutButton
                  offerId={secondaryCta.checkoutOfferId}
                  variant="outline"
                  fallbackHref={secondaryCta.href}
                  className="w-full flex-1 border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)] sm:w-auto"
                >
                  {secondaryCta.label}
                </UnlockCheckoutButton>
              ) : (
                <LinkButton
                  href={secondaryCta.href}
                  variant="outline"
                  className="w-full flex-1 border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)] sm:w-auto"
                >
                  {secondaryCta.label}
                </LinkButton>
              )
            ) : null}
            {tertiaryCta ? (
              tertiaryCta.checkoutOfferId ? (
                <UnlockCheckoutButton
                  offerId={tertiaryCta.checkoutOfferId}
                  variant="outline"
                  fallbackHref={tertiaryCta.href}
                  className="w-full flex-1 border-[oklch(1_0_0_/_12%)] bg-[oklch(1_0_0_/_3%)] text-foreground/85 sm:w-auto"
                >
                  {tertiaryCta.label}
                </UnlockCheckoutButton>
              ) : (
                <LinkButton
                  href={tertiaryCta.href}
                  variant="outline"
                  className="w-full flex-1 border-[oklch(1_0_0_/_12%)] bg-[oklch(1_0_0_/_3%)] text-foreground/85 sm:w-auto"
                >
                  {tertiaryCta.label}
                </LinkButton>
              )
            ) : null}
          </div>
          {showDemoCta ? (
            <LinkButton
              href="/?unlock=demo"
              variant="ghost"
              className="text-foreground/55 hover:text-foreground/75"
            >
              Proovi täisvaadet (demo, ilma ostuta)
            </LinkButton>
          ) : null}
        </div>

        {reportDeliverable}

        <p className="mt-4 text-[11px] leading-relaxed text-foreground/48">
          Makse ja PDF jäävad samasse voogu. Struktuur on juba näha — täisvaade avad ühe ostuga, kui oled valmis.
        </p>
      </div>
    </div>
  );
}

export type LockedResultZoneProps = {
  locked: boolean;
  children: React.ReactNode;
  className?: string;
  /** Max height of peek content when locked */
  peekMaxHeightClass?: string;
  showBadge?: boolean;
  showPlasma?: boolean;
  /** Add backdrop blur on veil (default off — enable when ready to test obfuscation) */
  useObfuscationBlur?: boolean;
  teaseVariant?: PremiumTeaseVariant;
  headline: string;
  subline?: string;
  valuePoints?: readonly string[] | string[];
  primaryCta: LockedCta;
  secondaryCta?: LockedCta;
  tertiaryCta?: LockedCta;
  showDemoCta?: boolean;
  reportDeliverable?: ReactNode;
};

export function LockedResultZone({
  locked,
  children,
  className,
  peekMaxHeightClass = "max-h-[min(72vh,560px)]",
  showBadge = true,
  showPlasma = true,
  useObfuscationBlur = false,
  teaseVariant = "featured",
  headline,
  subline,
  valuePoints = [...DEFAULT_PREMIUM_VALUE_POINTS],
  primaryCta,
  secondaryCta,
  tertiaryCta,
  showDemoCta = true,
  reportDeliverable,
}: LockedResultZoneProps) {
  if (!locked) {
    return (
      <div className={cn("ep-locked-zone-root", className)} data-locked-result="open">
        <div className="ep-locked-reveal-content ep-locked-reveal-content--unlocked">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn("ep-locked-zone-root relative overflow-hidden rounded-[inherit]", className)}
      data-locked-result="closed"
    >
      {showBadge ? <PremiumLockedBadge className="absolute right-4 top-4 z-20 sm:right-5 sm:top-5" /> : null}

      <div className={cn("ep-locked-peek relative overflow-hidden", peekMaxHeightClass)}>
        <div className="ep-locked-peek-mask">{children}</div>
      </div>

      {/* Veil: gradient-only obfuscation (no blur unless useObfuscationBlur) */}
      <div className="ep-locked-veil ep-locked-veil--wash" aria-hidden />
      <div className="ep-locked-veil ep-locked-veil--depth" aria-hidden />
      {useObfuscationBlur ? (
        <div
          className="ep-locked-veil ep-locked-veil--blur pointer-events-none absolute inset-0 z-[8]"
          aria-hidden
        />
      ) : (
        <div className="ep-locked-veil ep-locked-veil--blur-responsive" aria-hidden />
      )}
      <div className="ep-locked-veil-aura pointer-events-none absolute inset-0 z-[9]" aria-hidden />

      {showPlasma ? (
        <PlasmaArc className="absolute -right-8 bottom-[min(28%,200px)] z-[10] w-[min(100%,380px)] opacity-55 md:bottom-[min(32%,220px)]" />
      ) : null}

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[11] flex flex-col items-center px-4 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] pt-16 sm:px-6 sm:pb-8 sm:pt-20">
        <PremiumTeaseCard
          variant={teaseVariant}
          headline={headline}
          subline={subline}
          valuePoints={valuePoints}
          primaryCta={primaryCta}
          secondaryCta={secondaryCta}
          tertiaryCta={tertiaryCta}
          showDemoCta={showDemoCta}
          reportDeliverable={reportDeliverable}
        />
      </div>
    </div>
  );
}
