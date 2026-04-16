"use client";

import { usePremiumAccess } from "@/hooks/use-premium-access";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";

type PremiumGateProps = {
  children: React.ReactNode;
  /** Tailwind min-height for peek area, e.g. min-h-[220px] */
  className?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function PremiumGate({
  children,
  className,
  title = "Täielik analüüs on lukus",
  description = "Ava premium, et näha detailset võrdlust, täpsemaid arve ja allalaaditavaid kokkuvõtteid. Makse ühendus (Stripe) tuleb kohe järele.",
  ctaLabel = "Ava Energiapiloot Pro",
  ctaHref = "/pricing#avamine",
}: PremiumGateProps) {
  const unlocked = usePremiumAccess();

  if (unlocked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[inherit]", className)}>
      <div className="relative max-h-[min(70vh,520px)] overflow-hidden">{children}</div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/55 to-background"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%] backdrop-blur-[14px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_45%,black_100%)]" />

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-8 pt-16">
        <div className="ep-unlock-aurora relative w-full max-w-lg rounded-3xl border border-[oklch(0.83_0.14_205_/_0.35)] bg-card/75 p-6 shadow-[0_0_60px_-20px_oklch(0.83_0.14_205_/_0.55)] backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-80 [background:radial-gradient(420px_180px_at_50%_-20%,oklch(0.83_0.14_205_/_0.25),transparent_65%)]"
          />
          <div className="relative text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[oklch(0.83_0.14_205)]">
              Premium
            </p>
            <h3 className="mt-2 text-balance text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/70">{description}</p>
            <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
              <LinkButton
                href={ctaHref}
                variant="gradient"
                className="shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.7)]"
              >
                {ctaLabel}
              </LinkButton>
              <LinkButton href="/?unlock=demo" variant="outline">
                Demo: eelvaade
              </LinkButton>
            </div>
            <p className="mt-3 text-[11px] text-foreground/50">
              Tulevikus: Stripe makse → kohene avamine + PDF aruanne.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
