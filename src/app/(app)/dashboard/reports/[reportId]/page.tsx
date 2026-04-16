import { notFound } from "next/navigation";

import { getReportAction } from "@/app/(app)/dashboard/reports/actions";
import { ReportLayout } from "@/components/dashboard/reports/report-layout";
import { RenderReportSection } from "@/components/dashboard/reports/report-sections";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReportAction(reportId);
  if (!report) notFound();

  const payload = report.payload;
  const metaLeft = `${payload.site.name} • ${payload.site.object_type}`;
  const metaRight = `Genereeritud: ${new Date(payload.generated_at).toLocaleString("et-EE")}`;

  return (
    <div className="grid gap-6">
      <ReportLayout
        title={payload.title}
        subtitle="Raport"
        metaLeft={metaLeft}
        metaRight={metaRight}
      >
        {payload.meta?.inputs_summary?.length ? (
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4 text-sm text-foreground/70 print:border-black/10 print:bg-white print:text-black/80">
            <p className="text-xs font-medium tracking-wide text-foreground/60 print:text-black/60">
              Sisendite kokkuvõte
            </p>
            <ul className="mt-3 space-y-1.5">
              {payload.meta.inputs_summary.map((x, idx) => (
                <li key={idx}>• {x}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {payload.sections.map((s, idx) => (
          <RenderReportSection key={idx} section={s} />
        ))}
      </ReportLayout>
    </div>
  );
}

