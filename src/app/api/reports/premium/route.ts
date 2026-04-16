import { NextResponse } from "next/server";

import type { ReportType } from "@/lib/reports/types";
import { FULL_ACCESS_TEST_MODE } from "@/lib/feature-flags";
import { getServerUnlockGrants, isUnlockGrantedOnServer } from "@/lib/unlock/server-snapshot";

const REPORT_TYPES = new Set<ReportType>([
  "monthly_energy_summary",
  "contract_risk_summary",
  "savings_opportunity_summary",
  "investment_simulation_report",
]);

/**
 * Future: generate signed URL or stream PDF for export.
 * Body: { reportType: ReportType }
 */
export async function POST(req: Request) {
  let reportType: ReportType | null = null;
  try {
    const body = (await req.json()) as { reportType?: string };
    if (typeof body.reportType === "string" && REPORT_TYPES.has(body.reportType as ReportType)) {
      reportType = body.reportType as ReportType;
    }
  } catch {
    /* empty body ok */
  }

  if (FULL_ACCESS_TEST_MODE) {
    return NextResponse.json(
      {
        ok: true,
        reportType,
        message: "Ekspordi demo on test-buildis saadaval. Täisgeneraator lisandub järgmises etapis.",
        nextStep: "demo_export_ready",
      },
      { status: 200 }
    );
  }

  const grants = await getServerUnlockGrants();
  if (!isUnlockGrantedOnServer(grants, "download")) {
    return NextResponse.json(
      {
        ok: false,
        error: "download_locked",
        message: "Ekspordi ligipääs ei ole selles keskkonnas aktiveeritud.",
        reportType,
      },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "pdf_not_live",
      message: "Ekspordi generaator ei ole selles keskkonnas veel sisse lülitatud.",
      reportType,
      nextStep: "enqueue_pdf_job",
    },
    { status: 501 }
  );
}
