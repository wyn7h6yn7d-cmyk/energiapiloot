import { InvestmentSimulationsModule } from "@/components/dashboard/simulations/simulator-ui";
import { listScenariosAction } from "@/app/(app)/dashboard/simulations/actions";
import { getMyEntitlements } from "@/lib/billing/server";

export default async function SimulationsPage() {
  const scenarios = await listScenariosAction();
  const entitlements = await getMyEntitlements();
  return <InvestmentSimulationsModule initialScenarios={scenarios} entitlements={entitlements} />;
}

