"use client";

import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border backdrop-blur-md shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)] dark:shadow-[inset_0_1px_0_0_oklch(1_0_0_/_4%)]",
  {
    variants: {
      variant: {
        surface: "ep-card",
        glass: "ep-glass rounded-2xl",
        panel:
          "ep-card bg-[color-mix(in_oklab,var(--surface-2)_84%,transparent)] shadow-[var(--shadow-elev-2),inset_0_1px_0_0_oklch(1_0_0_/_5%)] ring-1 ring-inset ring-white/[0.03]",
      },
      hover: {
        none: "",
        lift: "ep-card-hover",
      },
      padding: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "surface",
      hover: "none",
      padding: "md",
    },
  }
);

export function Card({
  className,
  variant,
  hover,
  padding,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>) {
  return (
    <div className={cn(cardVariants({ variant, hover, padding }), className)} {...props} />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm font-semibold tracking-tight text-foreground/90", className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-2 text-sm leading-relaxed text-foreground/65", className)} {...props} />
  );
}

