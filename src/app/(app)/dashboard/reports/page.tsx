import Link from "next/link";

import { deleteReportAction, generateReportAction, listReportsAction } from "@/app/(app)/dashboard/reports/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import type { ReportType } from "@/lib/reports/types";
import { getMyEntitlements } from "@/lib/billing/server";
import { PaywallCard } from "@/components/billing/paywall-card";

const REPORT_TEMPLATES: { type: ReportType; title: string; description: string }[] = [
  {
    type: "monthly_energy_summary",
    title: "Kuu energia kokkuvõte",
    description: "Kulu, baas-koormus ja peamised draiverid arusaadavalt.",
  },
  {
    type: "contract_risk_summary",
    title: "Lepingu riski kokkuvõte",
    description: "Riskiskoor + võrdlus fikseeritud/spot/hübriid.",
  },
  {
    type: "savings_opportunity_summary",
    title: "Säästu võimalused",
    description: "Top kohad, kus on kõige lihtsam ja kiirem võit.",
  },
  {
    type: "investment_simulation_report",
    title: "Investeeringu raport",
    description: "Valitud (või viimane) stsenaarium, cashflow ja eeldused.",
  },
];

function statusLabel(s: string) {
  if (s === "ready") return { label: "Valmis", variant: "green" as const };
  if (s === "failed") return { label: "Ebaõnnestus", variant: "warm" as const };
  if (s === "generating") return { label: "Genereerib", variant: "cyan" as const };
  return { label: "Järjekorras", variant: "neutral" as const };
}

export default async function ReportsPage() {
  const reports = await listReportsAction();
  const ent = await getMyEntitlements();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-foreground/60">Raportid</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
          Ülevaated, mida saad jagada.
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Raportid on export-ready: PDF-sõbralik layout, korduvkasutatavad sektsioonid ja
          selge “generated date” + staatus.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_TEMPLATES.map((t) => (
          <Panel key={t.type} className="overflow-hidden">
            <PanelHeader>
              <div>
                <PanelTitle>{t.title}</PanelTitle>
                <PanelDescription>{t.description}</PanelDescription>
              </div>
              <Badge variant={ent.reports.allowedTypes.includes(t.type) ? "green" : "neutral"}>
                {ent.reports.allowedTypes.includes(t.type) ? "Saadaval" : "Lukus"}
              </Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              <form
                action={async () => {
                  "use server";
                  await generateReportAction({ report_type: t.type });
                }}
              >
                <Button variant="gradient" type="submit" disabled={!ent.reports.allowedTypes.includes(t.type)}>
                  Genereeri raport
                </Button>
              </form>
              <p className="mt-3 text-xs text-foreground/55">
                Raport luuakse objektile. Äris toetab sama struktuur mitut objekti ja kasutajat.
              </p>
            </div>
          </Panel>
        ))}
      </div>

      {!ent.reports.allowedTypes.includes("contract_risk_summary") ? (
        <PaywallCard
          title="Raportid on paketipõhised"
          description="Free paketis saad luua ainult kuu energia kokkuvõtte. Uuenda Plus/Pro peale, et saada lepingu risk, säästu kokkuvõte ja investeeringu raport."
          requiredPlan="plus"
        />
      ) : null}

      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Sinu raportid</PanelTitle>
            <PanelDescription>Valmis detailvaated ja print/PDF.</PanelDescription>
          </div>
          <Badge variant="neutral">{reports.length}</Badge>
        </PanelHeader>
        <div className="px-6 pb-6">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
              <p className="text-sm font-semibold">Ühtegi raportit pole veel</p>
              <p className="mt-2 text-sm text-foreground/65">
                Genereeri üks ülal olevatest raportitest — detailvaates saad kohe printida PDF-iks.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {reports.map((r) => {
                const s = statusLabel(r.status);
                const date = r.generated_at ?? r.created_at;
                return (
                  <div key={r.id} className="rounded-2xl border border-border/50 bg-card/25 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold tracking-tight">{r.title}</p>
                        <p className="mt-1 text-xs text-foreground/55">
                          {r.report_type} • {new Date(date).toLocaleString("et-EE")}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant={s.variant}>{s.label}</Badge>
                          {r.payload?.site?.name ? <Badge variant="neutral">{r.payload.site.name}</Badge> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/reports/${r.id}`}>
                          <Button variant="outline">Ava</Button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteReportAction({ id: r.id });
                          }}
                        >
                          <Button variant="destructive" type="submit">
                            Kustuta
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Panel>

      <div className="rounded-3xl border border-border/40 bg-card/20 p-6">
        <p className="text-xs font-medium tracking-wide text-foreground/60">PDF-nipp</p>
        <p className="mt-2 text-sm text-foreground/70">
          Ava raport → “Prindi / PDF”. Print layout eemaldab taustad ja seab teksti kontrasti nii, et PDF jääks puhas.
        </p>
      </div>
    </div>
  );
}

