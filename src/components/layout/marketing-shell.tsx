"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";

import { LinkButton } from "@/components/ui/link-button";

export function MarketingShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/90 to-background/50 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-card/40">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.45)]" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Energiapiloot</span>
          </Link>
          <div className="flex items-center gap-2">
            <LinkButton href="/pricing" variant="ghost" className="hidden md:inline-flex">
              Hinnad
            </LinkButton>
            <LinkButton href="/security" variant="ghost" className="hidden md:inline-flex">
              Turvalisus
            </LinkButton>
            <LinkButton href="/login" variant="outline">
              Logi sisse
            </LinkButton>
            <LinkButton href="/register">Alusta tasuta</LinkButton>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}

