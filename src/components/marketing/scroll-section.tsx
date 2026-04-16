"use client";

import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      className={cn(
        "relative min-h-[100svh] py-18 md:py-24",
        "flex items-center",
        className
      )}
    >
      <div className="ep-container relative z-10">
        <div className="grid items-start gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="max-w-xl">
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

          <div className="md:col-span-6">
            {right ? (
              right
            ) : (
              <Card variant="panel" hover="lift" className="min-h-[220px]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

