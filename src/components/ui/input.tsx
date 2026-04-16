"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground/90 placeholder:text-foreground/40",
          "ep-focus",
          "shadow-[inset_0_1px_0_oklch(1_0_0_/_4%)] hover:border-[var(--border-strong)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

