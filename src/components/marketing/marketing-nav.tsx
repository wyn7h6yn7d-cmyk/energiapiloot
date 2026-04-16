"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/90 to-background/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-card/40">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.82_0.16_145)] shadow-[0_0_18px_oklch(0.82_0.16_145_/_0.45)]" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Energiapiloot</span>
          </Link>
          <span className="hidden text-xs text-foreground/50 md:inline">
            Baltic energy decisions, simplified
          </span>
        </div>

        <nav className="pointer-events-auto flex items-center gap-2">
          <LinkButton href="/pricing" variant="ghost" className="hidden md:inline-flex">
            Pricing
          </LinkButton>
          <LinkButton href="/security" variant="ghost" className="hidden md:inline-flex">
            Security
          </LinkButton>
          <LinkButton href="/sign-in" variant="outline">
            Sign in
          </LinkButton>
          <LinkButton href="/sign-up">Start free</LinkButton>
        </nav>
      </div>
    </header>
  );
}

