import { redirect } from "next/navigation";

import { RecommendationsBoard } from "@/components/dashboard/recommendations/recommendations-board";
import { listScenariosAction } from "@/app/(app)/dashboard/simulations/actions";
import { getDecisionEngineOutputForUser } from "@/lib/server/services/decision-engine-service";
import { getMyProfile } from "@/lib/supabase/profile";
import { getOrCreateMyPrimarySite } from "@/lib/supabase/site";

export default async function RecommendationsPage() {
  const { user, profile } = await getMyProfile();
  if (!user) redirect("/");

  const site = await getOrCreateMyPrimarySite();
  const scenarios = await listScenariosAction();
  const decision = await getDecisionEngineOutputForUser({
    userId: user.id,
    profile,
    site,
    scenarios,
  });

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Soovitused
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
          Järgmised sammud — järjestatud ja ausalt öeldud.
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Soovitused põhinevad lepingu-, tarbimise- ja investeeringuanalüüsil. Kui andmed on nõrgad, ütleme
          seda otse ja tõstame andmete kogumise esikohale.
        </p>
      </div>

      <RecommendationsBoard decision={decision} />
    </div>
  );
}
