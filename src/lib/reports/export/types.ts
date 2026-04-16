import type { ReportType } from "@/lib/reports/types";

/** Where in the product the user starts PDF / structured export (maps to report templates later). */
export type PremiumReportExportSurface = ReportType;

/** Future: server job lifecycle for async PDF generation. */
export type ReportExportJobStatus = "queued" | "building" | "ready" | "failed";

/** Request body for POST /api/reports/premium (extensible for Stripe + worker). */
export type PremiumReportExportRequest = {
  reportType: PremiumReportExportSurface;
  /** Future: locale, site id, simulation id */
  format?: "pdf";
};

/** Future: signed URL or base64 from API when pipeline is live. */
export type PremiumReportExportResponse = {
  ok: boolean;
  downloadUrl?: string;
  filename?: string;
  jobId?: string;
  error?: string;
  message?: string;
};
