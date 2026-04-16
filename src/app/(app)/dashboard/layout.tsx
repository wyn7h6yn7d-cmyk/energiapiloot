import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getMyProfile } from "@/lib/supabase/profile";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const { user, profile } = await getMyProfile();
  if (!user) redirect("/");
  if (!profile?.onboarded) redirect("/");

  return (
    <AppShell userLabel={user.email ?? null} siteLabel={profile.object_name ?? null}>
      {children}
    </AppShell>
  );
}
