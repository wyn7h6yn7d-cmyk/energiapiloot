"use client";

import Link from "next/link";

import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";

type ProductSiteNavProps = {
  className?: string;
};

/**
 * Primary navigation for the public product experience (no auth CTAs).
 */
export function ProductSiteNav({ className }: ProductSiteNavProps) {
  return (
    <header className={cn("sticky top-0 z-30", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/92 via-background/55 to-transparent backdrop-blur supports-[backdrop-filter]:backdrop-blur-md" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.35)] to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <div className="pointer-events-auto flex min-w-0 items-center gap-3">
          <Link href="/" className="inline-flex min-w-0 items-center gap-2">
            <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card/40 shadow-[0_0_24px_-8px_oklch(0.83_0.14_205_/_0.55)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.55)]" />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight">Energiapiloot</span>
          </Link>
          <span className="hidden text-xs text-foreground/50 lg:inline">Energiaotsused, kinematograafiliselt selged</span>
        </div>

        <nav className="pointer-events-auto flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <LinkButton href="/leping" variant="ghost" className="hidden sm:inline-flex text-xs md:text-sm">
            Leping
          </LinkButton>
          <LinkButton href="/tarbimine" variant="ghost" className="hidden sm:inline-flex text-xs md:text-sm">
            Tarbimine
          </LinkButton>
          <LinkButton href="/simulatsioonid" variant="ghost" className="hidden md:inline-flex text-xs md:text-sm">
            Simulatsioonid
          </LinkButton>
          <LinkButton href="/pricing" variant="ghost" className="hidden lg:inline-flex text-xs md:text-sm">
            Hinnad
          </LinkButton>
          <LinkButton href="/security" variant="ghost" className="hidden xl:inline-flex text-xs md:text-sm">
            Turvalisus
          </LinkButton>
          <LinkButton href="/pricing#avamine" variant="gradient" className="text-xs shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.65)] sm:text-sm">
            Ava täielik analüüs
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
