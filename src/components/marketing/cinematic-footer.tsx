"use client";

import Link from "next/link";

import { LinkButton } from "@/components/ui/link-button";

export function CinematicFooter({ variant = "full" }: { variant?: "full" | "compact" }) {
  return (
    <footer className="relative mt-8 overflow-hidden border-t border-[oklch(1_0_0_/_8%)] ep-footer-aurora">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.55)] to-transparent"
      />
      <div className="ep-container relative py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(1_0_0_/_12%)] bg-[oklch(1_0_0_/_4%)] shadow-[0_0_32px_-8px_oklch(0.83_0.14_205_/_0.45)]">
                <span className="h-3 w-3 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_20px_oklch(0.83_0.14_205_/_0.6)]" />
              </span>
              <div>
                <p className="ep-display text-lg font-semibold tracking-tight">Energiapiloot</p>
                <p className="ep-eyebrow-caps mt-1 text-[0.6rem] text-[oklch(0.72_0.06_205)]">Energy intelligence</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-pretty text-sm leading-relaxed text-foreground/65">
              Energiapiloot on praegu avatud testimiseks täisversioonina: simulatsioonid, lepingu- ja tarbimise labor —
              kõik ühes voos.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:col-span-7 md:grid-cols-3">
            <div>
              <p className="ep-eyebrow-caps text-[0.6rem] text-foreground/45">Avalik teekond</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/simulatsioonid">
                    Simulatsioonid
                  </Link>
                </li>
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/leping">
                    Lepingu labor
                  </Link>
                </li>
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/tarbimine">
                    Tarbimise labor
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="ep-eyebrow-caps text-[0.6rem] text-foreground/45">Info</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/pricing">
                    Toote info
                  </Link>
                </li>
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/security">
                    Turvalisus
                  </Link>
                </li>
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/legal/privacy">
                    Privaatsus
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="ep-eyebrow-caps text-[0.6rem] text-foreground/45">Juriidika</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/legal/privacy">
                    Privaatsus
                  </Link>
                </li>
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/legal/terms">
                    Tingimused
                  </Link>
                </li>
                <li>
                  <Link className="text-foreground/75 transition hover:text-[oklch(0.88_0.1_205)]" href="/legal/cookies">
                    Küpsised
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {variant === "full" ? (
          <div className="mt-12 flex flex-col items-stretch justify-between gap-6 border-t border-[oklch(1_0_0_/_6%)] pt-10 sm:flex-row sm:items-center">
            <p className="text-xs text-foreground/45">
              © {new Date().getFullYear()} Energiapiloot. EE · LV · LT.
            </p>
            <div className="flex flex-wrap gap-2">
              <LinkButton
                href="/simulatsioonid"
                variant="gradient"
                size="sm"
                className="shadow-[0_0_24px_-8px_oklch(0.83_0.14_205_/_0.55)]"
              >
                Alusta testimist
              </LinkButton>
              <LinkButton href="/pricing" variant="outline" size="sm">
                Info
              </LinkButton>
            </div>
          </div>
        ) : (
          <p className="mt-10 border-t border-[oklch(1_0_0_/_6%)] pt-8 text-xs text-foreground/45">
            © {new Date().getFullYear()} Energiapiloot.
          </p>
        )}
      </div>
    </footer>
  );
}
