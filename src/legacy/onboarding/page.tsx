import Link from "next/link";
import { redirect } from "next/navigation";

import { AddressAutocomplete } from "@/legacy/onboarding/address-autocomplete";
import { BusinessLookupField } from "@/legacy/onboarding/business-lookup-field";
import { saveOnboardingAction } from "@/legacy/onboarding/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMyProfile } from "@/lib/supabase/profile";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const { user, profile } = await getMyProfile();
  if (!user) redirect("/login?next=/onboarding");
  if (profile?.onboarded) redirect("/dashboard");

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.45)]" />
          <span className="font-semibold tracking-tight">Energiapiloot</span>
        </Link>

        <div className="mt-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Seadista oma profiil</h1>
            <p className="mt-2 text-sm text-foreground/65">
              Mõned küsimused objekti ja lepingu kohta — nii saavad hinnangud ja soovitused olla sulle lähemale kohandatud.
            </p>
          </div>
          <Badge variant="cyan">~2 min</Badge>
        </div>

        <form action={saveOnboardingAction} className="mt-8 grid gap-4">
          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>1) Kasutajatüüp</CardTitle>
                <CardDescription>Kellele see objekt kuulub?</CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/25 p-4">
                <input type="radio" name="user_type" value="household" defaultChecked />
                <div>
                  <p className="text-sm font-medium">Kodu</p>
                  <p className="mt-1 text-xs text-foreground/60">Majapidamine</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/25 p-4">
                <input type="radio" name="user_type" value="business" />
                <div>
                  <p className="text-sm font-medium">Äri</p>
                  <p className="mt-1 text-xs text-foreground/60">Väikeettevõte</p>
                </div>
              </label>
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>2) Objekti nimi</CardTitle>
                <CardDescription>Näiteks “Kodu”, “Kontor”, “Pood”.</CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4">
              <Input name="object_name" placeholder="Nt. Kodu" required />
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>2b) Aadress</CardTitle>
                <CardDescription>
                  Vajalik päikese tootlikkuse ja ilma eelduste jaoks. Aadressiotsing käib läbi meie serveri
                  (võib olla demo- või live-režiimis).
                </CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4">
              <AddressAutocomplete />
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>2c) Äriandmed (kui valisid „Äri“)</CardTitle>
                <CardDescription>Registrikood ja ärinimi — äriregistri otsing võib demos olla lihtsustatud.</CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4">
              <BusinessLookupField />
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>3) Objekti tüüp</CardTitle>
                <CardDescription>Valime mudeli eeldused.</CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["apartment", "Korter"],
                ["house", "Maja"],
                ["office", "Kontor"],
                ["shop", "Pood"],
                ["warehouse", "Ladu"],
                ["other", "Muu"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-background/25 p-3 text-sm"
                >
                  <input type="radio" name="object_type" value={value} required />
                  {label}
                </label>
              ))}
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>4) Lepingu tüüp</CardTitle>
                <CardDescription>Kui ei tea, vali “Ei tea”.</CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["spot", "Börsihind"],
                ["fixed", "Fikseeritud"],
                ["hybrid", "Hübriid"],
                ["unknown", "Ei tea"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-background/25 p-3 text-sm"
                >
                  <input type="radio" name="contract_type" value={value} defaultChecked={value === "unknown"} />
                  {label}
                </label>
              ))}
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>5) Energiasüsteemi varad</CardTitle>
                <CardDescription>Vali kõik, mis kehtib.</CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["solar", "Päikesepaneelid"],
                ["battery", "Aku"],
                ["ev", "Elektriauto / laadija"],
                ["heat_pump", "Soojuspump"],
                ["none", "Pole midagi"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-background/25 p-3 text-sm"
                >
                  <input type="checkbox" name="assets" value={value} defaultChecked={value === "none"} />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-foreground/55">
              Kui valid “Pole midagi”, võid teised linnukesed eemaldada.
            </p>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>6) Eesmärk</CardTitle>
                <CardDescription>Mis on sinu peamine eesmärk?</CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["reduce_bill", "Vähenda arvet"],
                ["compare_contract", "Võrdle lepingut"],
                ["evaluate_investment", "Hinda investeeringut"],
                ["monitor_usage", "Jälgi tarbimist"],
                ["understand_risks", "Mõista riske"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-background/25 p-3 text-sm"
                >
                  <input type="radio" name="goal" value={value} required />
                  {label}
                </label>
              ))}
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <CardHeader>
              <div>
                <CardTitle>7) Andmeühendus (Estfeed / Datahub)</CardTitle>
                <CardDescription>
                  Salvestame ainult sinu eelistuse. Täielik turvaline ühendus lisandub teenuse
                  küpsedes.
                </CardDescription>
              </div>
            </CardHeader>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/25 p-4">
                <input type="radio" name="data_connection" value="none" defaultChecked />
                <div>
                  <p className="text-sm font-medium">Praegu ei ühenda</p>
                  <p className="mt-1 text-xs text-foreground/60">Saad hiljem seadetes ühendada.</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/25 p-4">
                <input type="radio" name="data_connection" value="estfeed_pending" />
                <div>
                  <p className="text-sm font-medium">Soovin ühendust (ootel)</p>
                  <p className="mt-1 text-xs text-foreground/60">Profiilis märgitakse ühendus ootele.</p>
                </div>
              </label>
            </div>
          </Card>

          {sp.error ? <p className="text-sm text-destructive">{sp.error}</p> : null}

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-foreground/55">
              Salvestame ainult seadistuse, et soovitused oleksid asjakohased.
            </p>
            <Button size="lg" type="submit" variant="gradient">
              Salvesta ja jätka
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

