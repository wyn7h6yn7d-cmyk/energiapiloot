"use client";

import { useCallback, useState } from "react";

import { useUnlockSnapshot } from "@/hooks/use-unlock-snapshot";
import type { ReportType } from "@/lib/reports/types";

export type PremiumExportPhase = "idle" | "requesting" | "pipeline_pending" | "forbidden" | "error";

/**
 * Client orchestration for premium PDF export. Server still returns 403/501 until Stripe + generator ship.
 */
export function usePremiumReportExport(reportType: ReportType) {
  const { hasDownload } = useUnlockSnapshot();
  const [phase, setPhase] = useState<PremiumExportPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const startExport = useCallback(async () => {
    if (!hasDownload) {
      setPhase("forbidden");
      setMessage("Laaditav PDF kuulub eraldi oste — vali PDF-pakett hindade lehel.");
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
        setMessage(typeof data.message === "string" ? data.message : "PDF genereerimine lisandub järgmises versioonis.");
        return;
      }

      if (!res.ok) {
        setPhase("error");
        setMessage(typeof data.message === "string" ? data.message : "Päring ebaõnnestus.");
        return;
      }

      setPhase("pipeline_pending");
      setMessage("Päring õnnestus, kuid faili link pole veel valmis (eelversioon).");
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
