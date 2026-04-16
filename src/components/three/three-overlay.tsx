"use client";

import { cn } from "@/lib/utils";

export function ThreeOverlay({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0",
        "ep-electric-gradient",
        "after:absolute after:inset-0 after:content-[''] after:ep-grid-overlay",
        className
      )}
    />
  );
}

