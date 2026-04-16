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
    <header className={cn("sticky top-0 z-30 border-b border-[oklch(1_0_0_/_6%)]", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[oklch(0.06_0.02_255_/_96%)] via-[oklch(0.07_0.02_255_/_78%)] to-transparent backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.5)] to-transparent opacity-80 shadow-[0_0_20px_oklch(0.83_0.14_205_/_0.2)]" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <div className="pointer-events-auto flex min-w-0 items-center gap-3">
          <Link href="/" className="group inline-flex min-w-0 items-center gap-3">
            <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[oklch(1_0_0_/_12%)] bg-[oklch(1_0_0_/_5%)] shadow-[0_0_28px_-6px_oklch(0.83_0.14_205_/_0.5)] transition group-hover:shadow-[0_0_36px_-4px_oklch(0.83_0.14_205_/_0.55)]">
              <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_30%,oklch(0.83_0.14_205_/_25%),transparent_65%)] opacity-70" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_16px_oklch(0.83_0.14_205_/_0.65)]" />
            </span>
            <span className="ep-display truncate text-sm font-semibold tracking-tight">Energiapiloot</span>
          </Link>
        </div>

        <nav className="pointer-events-auto flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <LinkButton href="/#problem" variant="ghost" className="hidden md:inline-flex text-xs md:text-sm">
            Teekond
          </LinkButton>
          <LinkButton href="/simulatsioonid" variant="ghost" className="hidden sm:inline-flex text-xs md:text-sm">
            Simulatsioonid
          </LinkButton>
          <LinkButton href="/leping" variant="ghost" className="hidden sm:inline-flex text-xs md:text-sm">
            Leping
          </LinkButton>
          <LinkButton href="/tarbimine" variant="ghost" className="hidden lg:inline-flex text-xs md:text-sm">
            Tarbimine
          </LinkButton>
          <LinkButton href="/pricing#avamine" variant="ghost" className="hidden lg:inline-flex text-xs md:text-sm">
            Premium
          </LinkButton>
          <LinkButton
            href="/simulatsioonid"
            variant="gradient"
            className="rounded-[min(var(--radius-md),12px)] px-3.5 text-xs font-semibold shadow-[0_0_36px_-8px_oklch(0.83_0.14_205_/_0.68)] sm:px-4 sm:text-sm"
          >
            Alusta tasuta
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
