"use client";

import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ScrollSection({
  id,
  eyebrow,
  title,
  body,
  badge,
  children,
  right,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  badge?: { label: string; variant?: "neutral" | "cyan" | "green" | "warm" };
  children?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-section="story"
      className={cn(
        "relative min-h-[100svh] py-18 md:py-24",
        "flex items-center",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80 [mask-image:linear-gradient(180deg,black,transparent)]"
      >
        <div className="ep-signal-grid absolute inset-0" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.83_0.14_205_/35%)] to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.82_0.16_145_/22%)] to-transparent" />
      </div>

      <div className="ep-container relative z-10">
        <div className="grid items-start gap-10 md:grid-cols-12">
          <div className="md:col-span-6" data-reveal="left">
            <div className="relative max-w-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(700px_420px_at_20%_20%,oklch(0.12_0.01_255_/78%),transparent_62%)] blur-[2px]"
              />
              <p className="text-xs font-medium tracking-wide text-foreground/60">
                {eyebrow}
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                {title}
              </h2>
              <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/72 md:text-lg">
                {body}
              </p>

              {badge ? (
                <div className="mt-5">
                  <Badge variant={badge.variant ?? "neutral"}>{badge.label}</Badge>
                </div>
              ) : null}

              {children ? <div className="mt-8">{children}</div> : null}
            </div>
          </div>

          <div className="md:col-span-6" data-reveal="right">
            {right ? (
              right
            ) : (
              <div className="ep-signal-frame min-h-[220px] rounded-[1.75rem]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

