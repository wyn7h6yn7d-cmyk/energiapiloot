"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useMemo, useState } from "react";

import { PageTransition } from "@/components/motion/page-transition";
import { SiteSwitcher, SiteSwitcherItem } from "@/components/dashboard/site-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  description: string;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Ülevaade", description: "Peamised näitajad ja hetkeseis." },
  {
    href: "/dashboard/contracts",
    label: "Lepinguanalüüs",
    description: "Hinnad, risk, võrdlus.",
  },
  {
    href: "/dashboard/consumption",
    label: "Tarbimine",
    description: "Muster, tiputunnid, paindlikkus.",
  },
  {
    href: "/dashboard/simulations",
    label: "Simulatsioonid",
    description: "Investeeringute stsenaariumid.",
  },
  {
    href: "/dashboard/recommendations",
    label: "Soovitused",
    description: "Prioriseeritud järgmised sammud.",
  },
  { href: "/dashboard/reports", label: "Aruanded", description: "Kokkuvõtted ja eksport." },
  { href: "/dashboard/settings", label: "Seaded", description: "Profiil ja pakett." },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-border/70 bg-card/55 shadow-[var(--shadow-elev-1)]"
          : "border-border/40 bg-card/20 hover:border-border/70 hover:bg-card/35"
      )}
    >
      <span className="font-medium tracking-tight">{label}</span>
      <span
        className={cn(
          "h-2 w-2 rounded-full transition",
          active
            ? "bg-[color:var(--brand-cyan)] shadow-[0_0_0_4px_rgba(38,230,255,0.10)]"
            : "bg-foreground/20 group-hover:bg-foreground/35"
        )}
      />
    </Link>
  );
}

export function DashboardShell({
  children,
  userLabel,
  siteLabel,
}: PropsWithChildren<{ userLabel?: string | null; siteLabel?: string | null }>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteId, setSiteId] = useState("primary");

  const siteItems: SiteSwitcherItem[] = useMemo(() => {
    const name = (siteLabel ?? "").trim() || "Minu objekt";
    return [
      { id: "primary", name, subtitle: "Praegu üks tarbimiskoht. Mitme objekti tugi on tulemas." },
    ];
  }, [siteLabel]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background overlays (subtle premium depth) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 ep-grid-overlay opacity-[0.16]" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(38,230,255,0.10),transparent_55%),radial-gradient(900px_500px_at_80%_0%,rgba(46,242,181,0.08),transparent_52%)]"
      />

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[18.5rem] border-r border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md md:translate-x-0",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Külgmenüü"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <div className="min-w-0">
              <Link href="/" className="text-sm font-semibold tracking-tight">
                Energiapiloot
              </Link>
              <p className="mt-1 truncate text-xs text-foreground/55">
                {userLabel ? `Sisselogitud: ${userLabel}` : "Töölaud"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Sulge menüü"
            >
              Sulge
            </Button>
          </div>

          <div className="px-5">
            <div className="rounded-3xl border border-border/50 bg-card/25 p-4 shadow-[var(--shadow-elev-1)] backdrop-blur-md">
              <SiteSwitcher items={siteItems} value={siteId} onChange={setSiteId} />
            </div>
          </div>

          <nav className="mt-5 flex-1 space-y-2 px-5 pb-5">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}

            <div className="mt-6 rounded-3xl border border-border/40 bg-card/20 p-4">
              <p className="text-xs font-medium tracking-wide text-foreground/60">Järgmine samm</p>
              <p className="mt-2 text-sm text-foreground/70">
                Salvesta esimene stsenaarium ja vaata, kui palju investeering või muudatus võiks tuua.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Link href="/dashboard/simulations" className="w-full">
                  <Button className="w-full" variant="gradient">
                    Ava simulatsioonid
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="md:pl-[18.5rem]">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Ava menüü"
              >
                Menüü
              </Button>
              <div className="hidden sm:block">
                <p className="text-[11px] font-medium tracking-wide text-foreground/55">
                  Energiapiloot • Töölaud
                </p>
                <p className="text-sm font-medium tracking-tight text-foreground/80">
                  Selge ülevaade. Tõendatav otsus.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/pricing">
                <Button variant="outline">Paketid</Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="glow">Seaded</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8 md:py-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

