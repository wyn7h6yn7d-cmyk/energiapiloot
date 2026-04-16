import { InvestmentSimulationsModule } from "@/components/dashboard/simulations/simulator-ui";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PUBLIC_TOOL_ENTITLEMENTS } from "@/lib/billing/plans";
import { DEFAULT_PUBLIC_SIMULATION_CONTEXT } from "@/lib/product/default-public-sim-context";

export default function PublicSimulationsPage() {
  return (
    <MarketingShell>
      <InvestmentSimulationsModule
        variant="public"
        initialScenarios={[]}
        entitlements={PUBLIC_TOOL_ENTITLEMENTS}
        simulationContext={DEFAULT_PUBLIC_SIMULATION_CONTEXT}
      />
    </MarketingShell>
  );
}
