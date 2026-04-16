import { getSettingsDataAction } from "@/app/(app)/dashboard/settings/actions";
import { SettingsClient } from "@/components/dashboard/settings/settings-client";

export default async function SettingsPage() {
  const data = await getSettingsDataAction();
  return (
    <SettingsClient
      userEmail={data.userEmail}
      profile={data.profile}
      sites={data.sites}
      assets={data.assets}
      contracts={data.contracts}
    />
  );
}

