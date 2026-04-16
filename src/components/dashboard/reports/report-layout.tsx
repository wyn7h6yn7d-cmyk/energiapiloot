"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportLayout({
  title,
  subtitle,
  metaLeft,
  metaRight,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  metaLeft: string;
  metaRight: string;
}>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/60 bg-card/20 p-6 shadow-[var(--shadow-elev-2)] backdrop-blur-md",
        "print:border-none print:bg-white print:p-0 print:text-black print:shadow-none"
      )}
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row print:hidden">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-foreground/60">{subtitle}</p>
          <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground/55">
            <Badge variant="neutral">{metaLeft}</Badge>
            <Badge variant="neutral">{metaRight}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Prindi / PDF
          </Button>
          <Link href="/dashboard/reports">
            <Button variant="glow">Tagasi</Button>
          </Link>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <div className="border-b border-black/10 pb-4">
          <p className="text-xs text-black/70">{subtitle}</p>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-xs text-black/60">
            {metaLeft} • {metaRight}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4 print:mt-4">{children}</div>
    </div>
  );
}

