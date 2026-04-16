"use client";

import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import type { ReportSection } from "@/lib/reports/types";

export function ReportSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Panel className={cn("print:border-black/10 print:bg-white print:shadow-none", className)}>
      <PanelHeader className="print:border-b print:border-black/10 print:pb-4">
        <div>
          <PanelTitle className="print:text-black">{title}</PanelTitle>
          {description ? (
            <PanelDescription className="print:text-black/70">{description}</PanelDescription>
          ) : null}
        </div>
      </PanelHeader>
      <div className="px-6 pb-6 print:px-5 print:pb-5">{children}</div>
    </Panel>
  );
}

export function RenderReportSection({ section }: { section: ReportSection }) {
  if (section.kind === "kpis") {
    return (
      <ReportSectionCard title={section.title}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-border/50 bg-card/25 p-4 print:border-black/10 print:bg-white"
            >
              <p className="text-xs text-foreground/55 print:text-black/60">{k.label}</p>
              <p className="mt-2 font-mono text-lg font-semibold print:text-black">{k.value}</p>
              {k.hint ? (
                <p className="mt-2 text-xs text-foreground/55 print:text-black/60">{k.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </ReportSectionCard>
    );
  }

  if (section.kind === "bullets") {
    return (
      <ReportSectionCard title={section.title}>
        <ul className="space-y-2 text-sm text-foreground/70 print:text-black/80">
          {section.items.map((b, idx) => (
            <li key={idx}>• {b}</li>
          ))}
        </ul>
      </ReportSectionCard>
    );
  }

  if (section.kind === "table") {
    return (
      <ReportSectionCard title={section.title}>
        <div className="overflow-auto rounded-2xl border border-border/50 print:border-black/10">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-foreground/70 print:bg-white print:text-black/70">
              <tr>
                {section.columns.map((c) => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, idx) => (
                <tr key={idx} className="border-t border-border/40 print:border-black/10">
                  {row.map((cell, cidx) => (
                    <td
                      key={cidx}
                      className="px-4 py-3 text-foreground/75 print:text-black/80"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {section.note ? (
          <p className="mt-3 text-xs text-foreground/55 print:text-black/60">{section.note}</p>
        ) : null}
      </ReportSectionCard>
    );
  }

  if (section.kind === "simulation_snapshot") {
    return (
      <ReportSectionCard title={section.title} description="Salvestatud stsenaariumi kokkuvõte.">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="cyan">{section.simulation.type}</Badge>
          <Badge variant="neutral">{section.simulation.name}</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Mini label="Kuutine sääst" value={`${section.simulation.monthlySavingsEur.toFixed(2)} €`} />
          <Mini label="Aastane sääst" value={`${section.simulation.annualSavingsEur.toFixed(2)} €`} />
          <Mini
            label="Tasuvus"
            value={section.simulation.paybackYears === null ? "—" : `${section.simulation.paybackYears.toFixed(1)} a`}
          />
        </div>
        <div className="mt-4 rounded-2xl border border-border/50 bg-card/25 p-4 print:border-black/10 print:bg-white">
          <p className="text-xs font-medium tracking-wide text-foreground/60 print:text-black/60">
            Eeldused
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {section.assumptions.slice(0, 8).map((a) => (
              <div key={a.label} className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/20 px-3 py-2 print:border-black/10 print:bg-white">
                <p className="text-xs text-foreground/60 print:text-black/60">{a.label}</p>
                <p className="text-xs font-medium text-foreground/80 print:text-black/80">{a.value}</p>
              </div>
            ))}
          </div>
        </div>
      </ReportSectionCard>
    );
  }

  // chart_data: keep export-ready payload visible as note for now
  return (
    <ReportSectionCard title={section.title} description={section.note}>
      <div className="rounded-2xl border border-border/50 bg-card/25 p-4 font-mono text-xs text-foreground/70 print:border-black/10 print:bg-white print:text-black/70">
        <pre className="whitespace-pre-wrap break-words">
{JSON.stringify(section.data, null, 2)}
        </pre>
      </div>
      <p className="mt-3 text-xs text-foreground/55 print:text-black/60">
        Graafikud lisanduvad detailvaatesse järgmises versioonis; andmestruktuur on juba PDF-i jaoks sobiv.
      </p>
    </ReportSectionCard>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/25 p-4 print:border-black/10 print:bg-white">
      <p className="text-xs text-foreground/55 print:text-black/60">{label}</p>
      <p className="mt-2 font-mono text-lg font-semibold print:text-black">{value}</p>
    </div>
  );
}

