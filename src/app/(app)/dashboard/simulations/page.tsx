import { redirect } from "next/navigation";

import { InvestmentSimulationsModule } from "@/components/dashboard/simulations/simulator-ui";
import { listScenariosAction } from "@/app/(app)/dashboard/simulations/actions";
import { getMyEntitlements } from "@/lib/billing/server";
import { getSimulationInvestmentContextForUser } from "@/lib/server/services/decision-engine-service";
import { getSolarIntegrationHints } from "@/lib/server/services/solar-hints-service";
import { getMyProfile } from "@/lib/supabase/profile";
import { getOrCreateMyPrimarySite } from "@/lib/supabase/site";

export default async function SimulationsPage() {
  const { user, profile } = await getMyProfile();
  if (!user) redirect("/");

  const site = await getOrCreateMyPrimarySite();
  const scenarios = await listScenariosAction();
  const entitlements = await getMyEntitlements();
  const solarHints = await getSolarIntegrationHints({ userId: user.id, profile, site });
  const simulationContext = await getSimulationInvestmentContextForUser({
    userId: user.id,
    profile,
    site,
  });

  return (
    <InvestmentSimulationsModule
      initialScenarios={scenarios}
      entitlements={entitlements}
      solarHints={solarHints}
      simulationContext={simulationContext}
    />
  );
}

