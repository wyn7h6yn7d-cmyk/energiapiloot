import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getMyProfile } from "@/lib/supabase/profile";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const { user, profile } = await getMyProfile();
  if (!user) redirect("/login?next=/dashboard");
  if (!profile?.onboarded) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}
