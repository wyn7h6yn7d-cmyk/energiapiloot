"use client";

import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
  {
    variants: {
      variant: {
        neutral: "border-[var(--border-subtle)] bg-background/30 text-foreground/75",
        cyan:
          "border-[oklch(0.83_0.14_205_/28%)] bg-[oklch(0.83_0.14_205_/10%)] text-[oklch(0.92_0.05_205)] shadow-[0_0_40px_-28px_oklch(0.83_0.14_205_/55%)]",
        green:
          "border-[oklch(0.82_0.16_145_/28%)] bg-[oklch(0.82_0.16_145_/10%)] text-[oklch(0.92_0.06_145)] shadow-[0_0_40px_-28px_oklch(0.82_0.16_145_/55%)]",
        warm:
          "border-[oklch(0.95_0.02_85_/26%)] bg-[oklch(0.95_0.02_85_/10%)] text-[oklch(0.96_0.02_85)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

