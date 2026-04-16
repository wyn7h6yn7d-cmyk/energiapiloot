import Link from "next/link";
import { PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm font-semibold tracking-tight">
              Energiapiloot
            </Link>
            <span className="hidden text-xs text-foreground/50 md:inline">
              App
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <LinkButton href="/app/scenarios" variant="ghost" className="hidden sm:inline-flex">
              Scenarios
            </LinkButton>
            <LinkButton href="/app/simulators" variant="ghost" className="hidden sm:inline-flex">
              Simulators
            </LinkButton>
            <LinkButton href="/app/recommendations" variant="ghost" className="hidden sm:inline-flex">
              Recommendations
            </LinkButton>
            <LinkButton href="/app/account" variant="outline">
              Account
            </LinkButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

