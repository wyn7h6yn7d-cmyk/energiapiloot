"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";

import { ProductSiteNav } from "@/components/marketing/product-site-nav";
import { LinkButton } from "@/components/ui/link-button";

export function MarketingShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 ep-electric-gradient opacity-90 [background-size:120%_120%]"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 ep-grid-overlay" />
      <ProductSiteNav />

      <main className="relative mx-auto w-full max-w-6xl px-6 py-12">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="border-t border-border/60 pt-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold tracking-tight">Energiapiloot</p>
              <p className="mt-1 max-w-xl text-sm text-foreground/60">
                Avalik energiaotsuste stuudio — leping, tarbimine ja investeeringud ühes visuaalses narratiivis. Täielik
                sügavus avaneb ühe klikiga (tulevikus Stripe + PDF).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton href="/leping" variant="ghost">
                Leping
              </LinkButton>
              <LinkButton href="/tarbimine" variant="ghost">
                Tarbimine
              </LinkButton>
              <LinkButton href="/simulatsioonid" variant="ghost">
                Simulatsioonid
              </LinkButton>
              <LinkButton href="/security" variant="ghost">
                Turvalisus
              </LinkButton>
              <LinkButton href="/legal/privacy" variant="ghost">
                Privaatsus
              </LinkButton>
              <LinkButton href="/legal/terms" variant="ghost">
                Tingimused
              </LinkButton>
              <LinkButton href="/legal/cookies" variant="ghost">
                Küpsised
              </LinkButton>
            </div>
          </div>
          <p className="mt-6 text-xs text-foreground/50">
            © {new Date().getFullYear()} Energiapiloot. Kõik õigused kaitstud.
          </p>
        </div>
      </footer>
    </div>
  );
}

