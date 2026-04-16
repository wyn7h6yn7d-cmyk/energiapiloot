"use client";

import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Section({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <section className={cn("ep-section ep-narrative-gap", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <p className="ep-eyebrow-caps text-foreground/50">{eyebrow}</p>
      ) : null}
      <h2 className="ep-display mt-4 text-balance text-2xl font-semibold leading-[1.08] tracking-tight text-foreground/95 md:text-3xl md:leading-[1.06]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/72 md:text-lg md:leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}

