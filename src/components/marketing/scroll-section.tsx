"use client";

import { type CSSProperties, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const accentVia: Record<string, string> = {
  cyan: "via-[oklch(0.83_0.14_205_/_42%)]",
  green: "via-[oklch(0.82_0.16_145_/_35%)]",
  warm: "via-[oklch(0.95_0.04_85_/_38%)]",
  neutral: "via-[oklch(1_0_0_/_22%)]",
};

const accentLayerClass: Partial<Record<string, string>> = {
  green: "ep-story-section--green",
  warm: "ep-story-section--warm",
  neutral: "ep-story-section--neutral",
};

export function ScrollSection({
  id,
  eyebrow,
  title,
  body,
  badge,
  children,
  right,
  className,
  accent = "cyan",
  beat = 1,
  totalBeats = 12,
  flipLayout,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  badge?: { label: string; variant?: "neutral" | "cyan" | "green" | "warm" };
  children?: ReactNode;
  right?: ReactNode;
  className?: string;
  accent?: "cyan" | "green" | "warm" | "neutral";
  /** Story beat index (1-based) — drives atmosphere position and optional column flip */
  beat?: number;
  totalBeats?: number;
  /** Override alternating art-directed layout (even beats flip visual to the left) */
  flipLayout?: boolean;
}) {
  const via = accentVia[accent] ?? accentVia.cyan;
  const layerClass = accentLayerClass[accent];
  const flipped = flipLayout ?? beat % 2 === 0;
  const storyT = totalBeats > 1 ? (beat - 1) / (totalBeats - 1) : 0;
  const beatLabel = String(beat).padStart(2, "0");

  return (
    <section
      id={id}
      data-section="story"
      data-story-beat={beat}
      data-story-accent={accent}
      style={{ "--story-t": storyT } as CSSProperties}
      className={cn(
        "ep-story-section",
        layerClass,
        "relative flex min-h-[min(100svh,920px)] scroll-mt-24 items-center py-20 md:min-h-[100svh] md:scroll-mt-28 md:py-28",
        className
      )}
    >
      <div className="ep-story-section-layers" aria-hidden>
        <div className="ep-story-aurora" />
        <div className="ep-story-depth" />
        <div className="ep-story-horizon" />
        <div
          className={cn(
            "ep-signal-grid ep-story-grid-shift absolute inset-0 opacity-[0.2] [mask-image:radial-gradient(ellipse_72%_58%_at_50%_20%,black,transparent_78%)]"
          )}
        />
        <div
          className={cn(
            "absolute inset-y-[10%] left-[max(0px,calc(50%-23rem))] w-px bg-gradient-to-b from-transparent to-transparent shadow-[0_0_24px_oklch(0.83_0.14_205_/_0.2)]",
            via
          )}
        />
        <div
          className={cn(
            "absolute inset-y-[14%] right-[max(0px,calc(50%-21rem))] w-px bg-gradient-to-b from-transparent to-transparent opacity-70",
            accent === "cyan" ? "via-[oklch(0.82_0.16_145_/_30%)]" : via
          )}
        />
      </div>

      <div className="ep-story-bridge ep-story-bridge--top" />
      <div className="ep-story-bridge ep-story-bridge--bottom" />
      <div aria-hidden className="ep-section-glow opacity-80" />

      <div className="ep-container relative z-10">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-14 lg:gap-16">
          <div
            className={cn("md:col-span-6", flipped && "md:order-2")}
            data-reveal="left"
          >
            <div className="relative max-w-xl md:pl-1">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-2 top-10 hidden h-36 w-px bg-gradient-to-b from-[oklch(0.83_0.14_205_/_50%)] via-[oklch(0.82_0.16_145_/_22%)] to-transparent md:block"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-10 -z-10 rounded-[2rem] bg-[radial-gradient(760px_460px_at_10%_15%,oklch(0.83_0.14_205_/_10%),transparent_62%),radial-gradient(640px_420px_at_92%_85%,oklch(0.82_0.16_145_/_7%),transparent_58%)]"
              />

              <div className="flex flex-wrap items-center gap-3">
                <span className="ep-story-beat-pill">{beatLabel}</span>
                <p className="ep-eyebrow-caps text-foreground/50">{eyebrow}</p>
              </div>

              <h2 className="ep-display mt-5 text-balance text-3xl font-semibold leading-[1.06] tracking-tight md:text-[2.75rem] md:leading-[1.05]">
                {title}
              </h2>
              <p className="mt-6 text-pretty text-base leading-[1.65] text-foreground/72 md:text-lg md:leading-relaxed">
                {body}
              </p>

              {badge ? (
                <div className="mt-7" data-reveal-stagger="">
                  <Badge
                    variant={badge.variant ?? "neutral"}
                    className="shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.4)]"
                  >
                    {badge.label}
                  </Badge>
                </div>
              ) : null}

              {children ? <div className="mt-10">{children}</div> : null}
            </div>
          </div>

          <div
            className={cn("md:col-span-6", flipped && "md:order-1")}
            data-reveal="right"
            data-story-parallax="panel"
          >
            {right ? (
              <div className="relative md:pr-1 md:pl-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(680px_440px_at_65%_25%,oklch(0.83_0.14_205_/_14%),transparent_66%),radial-gradient(520px_360px_at_30%_90%,oklch(0.82_0.16_145_/_8%),transparent_62%)] opacity-95"
                />
                <div className="ep-story-visual-shell">
                  <div className="ep-story-visual-shell-inner">{right}</div>
                </div>
              </div>
            ) : (
              <div className="ep-story-visual-shell">
                <div className="ep-story-visual-shell-inner">
                  <div className="ep-cinema-panel min-h-[240px] rounded-[1.75rem]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
