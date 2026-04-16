"use client";

import { useCallback, useState } from "react";

import { FULL_ACCESS_TEST_MODE } from "@/lib/feature-flags";
import { useUnlockSnapshot } from "@/hooks/use-unlock-snapshot";
import type { ReportType } from "@/lib/reports/types";

export type PremiumExportPhase = "idle" | "requesting" | "pipeline_pending" | "forbidden" | "error";

/**
 * Client orchestration for report export.
 */
export function usePremiumReportExport(reportType: ReportType) {
  const { hasDownload } = useUnlockSnapshot();
  const [phase, setPhase] = useState<PremiumExportPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const startExport = useCallback(async () => {
    if (!FULL_ACCESS_TEST_MODE && !hasDownload) {
      setPhase("forbidden");
      setMessage("Ekspordi ligipääs puudub.");
      return;
    }

    setPhase("requesting");
    setMessage(null);

    try {
      const res = await fetch("/api/reports/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType }),
      });

      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

      if (res.status === 403) {
        setPhase("forbidden");
        setMessage(typeof data.message === "string" ? data.message : "Ligipääs puudub.");
        return;
      }

      if (res.status === 501) {
        setPhase("pipeline_pending");
        setMessage(typeof data.message === "string" ? data.message : "Ekspordi generaator ei ole veel saadaval.");
        return;
      }

      if (!res.ok) {
        setPhase("error");
        setMessage(typeof data.message === "string" ? data.message : "Päring ebaõnnestus.");
        return;
      }

      setPhase("pipeline_pending");
      setMessage(typeof data.message === "string" ? data.message : "Ekspordi demo on saadaval.");
    } catch {
      setPhase("error");
      setMessage("Võrgu viga. Proovi uuesti.");
    }
  }, [hasDownload, reportType]);

  const reset = useCallback(() => {
    setPhase("idle");
    setMessage(null);
  }, []);

  return { phase, message, hasDownload, startExport, reset };
}
