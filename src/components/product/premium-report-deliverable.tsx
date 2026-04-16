"use client";

import { Button } from "@/components/ui/button";
import { usePremiumReportExport } from "@/hooks/use-premium-report-export";
import { FULL_ACCESS_TEST_MODE } from "@/lib/feature-flags";
import { PREMIUM_REPORT_BUNDLE_ITEMS, defaultTitleForReportType } from "@/lib/reports/export/bundles";
import type { ReportType } from "@/lib/reports/types";
import { cn } from "@/lib/utils";

function DocGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn("h-8 w-8", className)} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M8 5.5h9.2L23.5 11.8V26.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-19a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M17 5.5v6.3h6.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M10.5 18h11M10.5 22h8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity={0.55} />
    </svg>
  );
}

function PhaseLabel({ phase }: { phase: ReturnType<typeof usePremiumReportExport>["phase"] }) {
  switch (phase) {
    case "idle":
      return <span className="text-[oklch(0.78_0.08_205)]">Valmis koostamiseks</span>;
    case "requesting":
      return <span className="text-[oklch(0.82_0.12_205)]">Koostan dokumenti…</span>;
    case "pipeline_pending":
      return <span className="text-[oklch(0.82_0.14_145)]">Ekspordi töövoog käib</span>;
    case "forbidden":
      return <span className="text-[oklch(0.85_0.12_85)]">Ligipääs puudub</span>;
    case "error":
      return <span className="text-destructive">Viga</span>;
    default:
      return null;
  }
}

/**
 * Deliverable teaser (kept for future, shown as demo in test mode).
 */
export function PremiumReportDeliverableTease({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mt-8 overflow-hidden rounded-2xl border border-[oklch(0.83_0.14_205_/_0.28)]",
        "bg-[linear-gradient(145deg,oklch(0.12_0.03_255_/_0.92),oklch(0.08_0.02_255_/_0.88))]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0_/_0.06)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.65] [background:linear-gradient(125deg,oklch(0.83_0.14_205_/_0.07),transparent_55%)]"
      />
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch sm:gap-5">
        <div className="relative flex min-h-[120px] flex-1 flex-col justify-between overflow-hidden rounded-xl border border-[oklch(1_0_0_/_8%)] bg-[oklch(0_0_0_/_0.35)] p-4">
          <div className="space-y-2 opacity-45">
            <div className="h-2 w-3/4 rounded bg-[oklch(1_0_0_/_12%)]" />
            <div className="h-2 w-full rounded bg-[oklch(1_0_0_/_8%)]" />
            <div className="h-2 w-5/6 rounded bg-[oklch(1_0_0_/_8%)]" />
            <div className="h-2 w-2/3 rounded bg-[oklch(1_0_0_/_6%)]" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,oklch(0.06_0.02_255_/_0.92)_100%)]" />
          <p className="relative text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/50">
            PDF · struktureeritud mälu
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center text-left">
          <div className="flex items-start gap-3">
            <DocGlyph className="shrink-0 text-[oklch(0.83_0.14_205_/_0.85)]" />
            <div>
              <p className="ep-eyebrow-caps text-[0.58rem] text-[oklch(0.78_0.08_205)]">Kokkuvõte</p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground/92">
                Professionaalne kokkuvõte otsustajale
              </p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/58">
                Sama loogika, mida näed ekraanil — pakendatud selgeks, jagatavaks dokumendiks: KPI-d, eeldused ja
                kokkuvõtte struktuur.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[oklch(0.83_0.14_205_/_0.35)] bg-[oklch(0.83_0.14_205_/_0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.88_0.08_205)]">
              PDF
            </span>
            <span className="rounded-full border border-[oklch(1_0_0_/_12%)] px-2.5 py-1 text-[10px] text-foreground/55">
              ~12–18 lk (hinnang)
            </span>
            <span className="rounded-full border border-[oklch(1_0_0_/_12%)] px-2.5 py-1 text-[10px] text-foreground/55">
              test-build
            </span>
          </div>

          <div className="mt-4 text-xs text-foreground/55">
            {FULL_ACCESS_TEST_MODE ? "Kõik kihid on avatud — saad aruande printida või salvestada PDF-ina brauserist." : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-width panel after premium results unlock — download sub-gate + placeholder export states.
 */
export function PremiumReportExportPanel({
  reportType,
  title,
  description,
  className,
}: {
  reportType: ReportType;
  title?: string;
  description?: string;
  className?: string;
}) {
  const { phase, message, hasDownload, startExport, reset } = usePremiumReportExport(reportType);
  const bundle = PREMIUM_REPORT_BUNDLE_ITEMS[reportType];
  const docTitle = title ?? defaultTitleForReportType(reportType);

  return (
    <section
      className={cn(
        "ep-premium-report-panel relative overflow-hidden rounded-[1.75rem] border border-[oklch(0.83_0.14_205_/_0.22)]",
        "bg-[linear-gradient(165deg,oklch(0.14_0.04_250_/_0.55),oklch(0.1_0.03_255_/_0.42))]",
        "shadow-[0_0_80px_-40px_oklch(0.83_0.14_205_/_0.45)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.45)] to-transparent"
      />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-xl">
            <div className="flex items-center gap-3">
              <DocGlyph className="text-[oklch(0.83_0.14_205_/_0.9)]" />
              <div>
                <p className="ep-eyebrow-caps text-[0.58rem] text-[oklch(0.78_0.08_205)]">Eksporditav mälu</p>
                <h3 className="ep-display mt-1 text-xl font-semibold tracking-tight text-foreground/95 md:text-2xl">
                  {docTitle}
                </h3>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/68">
              {description ??
                "See on sama analüüs, mida näed ekraanil — pakendatud selgeks, jagatavaks dokumendiks. Test-buildis saad selle printida või salvestada PDF-ina brauserist."}
            </p>

            <ul className="mt-5 space-y-2.5 text-sm text-foreground/72">
              {bundle.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_12px_oklch(0.83_0.14_205_/_0.45)]"
                    aria-hidden
                  />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_0.25)] p-5 lg:w-[320px]">
            {FULL_ACCESS_TEST_MODE || hasDownload ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-foreground/55">Olek</span>
                  <span className="font-medium">
                    <PhaseLabel phase={phase} />
                  </span>
                </div>

                <div className="rounded-xl border border-[oklch(1_0_0_/_8%)] bg-[oklch(1_0_0_/_3%)] p-3">
                  <p className="font-mono text-[11px] text-foreground/50">energiapiloot-{reportType}-v1.pdf</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-foreground/45">
                    Test-build: saad sama sisu printida või salvestada PDF-ina brauseri “Print” funktsiooniga. Serveripoolne
                    generaator lisandub hiljem.
                  </p>
                </div>

                {message ? (
                  <p
                    className={cn(
                      "text-xs leading-relaxed",
                      phase === "error" || phase === "forbidden" ? "text-[oklch(0.85_0.12_85)]" : "text-foreground/60"
                    )}
                  >
                    {message}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="gradient"
                    className="w-full shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.55)]"
                    disabled={phase === "requesting"}
                    onClick={() => void startExport()}
                  >
                    {phase === "requesting" ? "Koostan…" : "Käivita ekspordi demo"}
                  </Button>
                  {phase !== "idle" ? (
                    <Button type="button" variant="ghost" size="sm" className="text-foreground/55" onClick={reset}>
                      Lähtesta olek
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold tracking-tight text-foreground/90">Ekspordi vaade</p>
                <p className="text-sm leading-relaxed text-foreground/65">
                  Ekspordi ligipääs ei ole selles keskkonnas aktiveeritud.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
