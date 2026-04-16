"use client";

import { PropsWithChildren } from "react";

import { CinematicFooter } from "@/components/marketing/cinematic-footer";
import { ProductSiteNav } from "@/components/marketing/product-site-nav";

export function MarketingShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 ep-electric-gradient opacity-95 [background-size:140%_140%]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.83_0.14_205_/_8%),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_72%_48%_at_50%_108%,oklch(0.06_0.02_255_/_78%),transparent_55%)]"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 ep-grid-overlay opacity-[0.72]" />
      <ProductSiteNav />

      <main className="relative mx-auto w-full max-w-6xl px-6 pb-[max(3.5rem,env(safe-area-inset-bottom,0px))] pt-[max(6.25rem,env(safe-area-inset-top,0px))] md:pb-20 md:pt-[7.25rem]">
        {children}
      </main>

      <CinematicFooter variant="compact" />
    </div>
  );
}

