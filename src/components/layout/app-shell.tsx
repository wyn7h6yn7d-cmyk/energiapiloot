import Link from "next/link";
import { PropsWithChildren } from "react";

import { LinkButton } from "@/components/ui/link-button";
import { Container } from "@/components/layout/container";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <Container className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              Energiapiloot
            </Link>
            <span className="hidden text-xs text-foreground/50 md:inline">
              Töölaud
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <LinkButton
              href="/dashboard/contracts"
              variant="ghost"
              className="hidden sm:inline-flex"
            >
              Lepingud
            </LinkButton>
            <LinkButton
              href="/dashboard/simulations"
              variant="ghost"
              className="hidden sm:inline-flex"
            >
              Simulatsioonid
            </LinkButton>
            <LinkButton
              href="/dashboard/recommendations"
              variant="ghost"
              className="hidden sm:inline-flex"
            >
              Soovitused
            </LinkButton>
            <LinkButton
              href="/dashboard/reports"
              variant="ghost"
              className="hidden sm:inline-flex"
            >
              Raportid
            </LinkButton>
            <LinkButton href="/dashboard/settings" variant="outline">
              Seaded
            </LinkButton>
          </nav>
        </Container>
      </header>

      <main>
        <Container className="py-10">{children}</Container>
      </main>
    </div>
  );
}

