"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateMyPrimarySite } from "@/lib/supabase/site";
import { getMyEntitlements } from "@/lib/billing/server";
import { buildDomainReportSections } from "@/lib/domain/reports/sections";
import { buildReportPayload } from "@/lib/reports/generate";
import { getDecisionEngineOutputForUser } from "@/lib/server/services/decision-engine-service";
import { buildIntegratedReportContext } from "@/lib/server/services/report-context-service";
import { getMyProfile } from "@/lib/supabase/profile";
import type { ReportPayload, ReportType, ReportStatus } from "@/lib/reports/types";
import type { SimulationType } from "@/lib/simulations/types";
import type { ScenarioDTO } from "@/app/(app)/dashboard/simulations/actions";

export type ReportDTO = {
  id: string;
  site_id: string;
  scenario_id: string | null;
  title: string;
  report_type: ReportType;
  status: ReportStatus;
  generated_at: string | null;
  payload: ReportPayload;
  created_at: string;
  updated_at: string;
};

export async function listReportsAction(): Promise<ReportDTO[]> {
  const supabase = await createSupabaseServerClient();
  const site = await getOrCreateMyPrimarySite();
  const { data, error } = await supabase
    .from("reports")
    .select("id,site_id,scenario_id,title,report_type,status,generated_at,payload,created_at,updated_at")
    .eq("site_id", site.id)
    .order("generated_at", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as ReportDTO[]) ?? [];
}

export async function getReportAction(id: string): Promise<ReportDTO | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id,site_id,scenario_id,title,report_type,status,generated_at,payload,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as ReportDTO | null) ?? null;
}

export async function deleteReportAction(input: { id: string }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reports").delete().eq("id", input.id);
  if (error) throw error;
  revalidatePath("/dashboard/reports");
}

export async function generateReportAction(input: {
  report_type: ReportType;
  scenario_id?: string | null;
}): Promise<ReportDTO> {
  const supabase = await createSupabaseServerClient();
  const site = await getOrCreateMyPrimarySite();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const ent = await getMyEntitlements();
  if (!ent.reports.allowedTypes.includes(input.report_type)) {
    throw new Error("Sinu pakett ei sisalda seda raportit.");
  }

  const { profile } = await getMyProfile();

  const { data: scenarios } = await supabase
    .from("saved_scenarios")
    .select("id,simulation_type,name,config")
    .eq("site_id", site.id)
    .order("is_favorite", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(10);

  const scenarioRows =
    (scenarios ?? []) as {
      id: string;
      simulation_type: SimulationType;
      name: string;
      config: Record<string, unknown> | null;
    }[];

  const ctx = await buildIntegratedReportContext({
    userId: auth.user.id,
    profile,
    site,
    scenarios: scenarioRows.map((s) => ({
      id: s.id,
      simulation_type: s.simulation_type,
      name: s.name,
      config: s.config ?? {},
    })),
  });

  const title =
    input.report_type === "monthly_energy_summary"
      ? "Kuu energia kokkuvõte"
      : input.report_type === "contract_risk_summary"
        ? "Lepingu riski kokkuvõte"
        : input.report_type === "savings_opportunity_summary"
          ? "Säästu võimaluste kokkuvõte"
          : "Investeeringu aruanne";

  const payload = buildReportPayload(input.report_type, ctx);

  const scenariosForEngine: ScenarioDTO[] = scenarioRows.map((s) => ({
    id: s.id,
    site_id: site.id,
    simulation_type: s.simulation_type,
    name: s.name,
    description: null,
    config: s.config ?? {},
    is_favorite: false,
    created_at: "",
    updated_at: "",
  }));

  const decision = await getDecisionEngineOutputForUser({
    userId: auth.user.id,
    profile,
    site,
    scenarios: scenariosForEngine,
  });
  const domainSections = buildDomainReportSections(input.report_type, decision);
  payload.sections = [...domainSections, ...payload.sections];

  const { data, error } = await supabase
    .from("reports")
    .insert({
      site_id: site.id,
      scenario_id: input.scenario_id ?? null,
      title,
      report_type: input.report_type,
      status: "ready",
      generated_at: new Date().toISOString(),
      payload,
      created_by: auth.user.id,
    })
    .select("id,site_id,scenario_id,title,report_type,status,generated_at,payload,created_at,updated_at")
    .single();

  if (error) throw error;
  revalidatePath("/dashboard/reports");
  return data as ReportDTO;
}

