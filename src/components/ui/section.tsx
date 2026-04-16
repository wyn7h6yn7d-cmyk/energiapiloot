"use client";

import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Section({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <section className={cn("ep-section", className)} {...props} />;
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
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

