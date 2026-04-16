import { PropsWithChildren } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export function AppShell({
  children,
  userLabel,
  siteLabel,
}: PropsWithChildren<{ userLabel?: string | null; siteLabel?: string | null }>) {
  return (
    <DashboardShell userLabel={userLabel} siteLabel={siteLabel}>
      {children}
    </DashboardShell>
  );
}

