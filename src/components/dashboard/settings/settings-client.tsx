"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  deleteAssetAction,
  deleteContractAction,
  deleteSiteAction,
  type AssetDTO,
  type ContractDTO,
  type SettingsProfileDTO,
  type SiteDTO,
  signOutAction,
  updateProfileAction,
  upsertAssetAction,
  upsertContractAction,
  upsertSiteAction,
} from "@/app/(app)/dashboard/settings/actions";
import { cn } from "@/lib/utils";

function labelForAssetType(t: string) {
  switch (t) {
    case "solar":
      return "Päike";
    case "battery":
      return "Aku";
    case "ev":
      return "EV";
    case "heat_pump":
      return "Soojuspump";
    default:
      return t;
  }
}

export function SettingsClient({
  userEmail,
  profile,
  sites,
  assets,
  contracts,
}: {
  userEmail: string | null;
  profile: SettingsProfileDTO | null;
  sites: SiteDTO[];
  assets: AssetDTO[];
  contracts: ContractDTO[];
}) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [companyName, setCompanyName] = useState(profile?.company_name ?? "");
  const [primarySiteId, setPrimarySiteId] = useState<string>(profile?.primary_site_id ?? sites[0]?.id ?? "");
  const prefs = (profile?.notification_prefs ?? {}) as any;
  const [prefWeekly, setPrefWeekly] = useState(Boolean(prefs.weekly_summary ?? true));
  const [prefAlerts, setPrefAlerts] = useState(Boolean(prefs.price_alerts ?? false));

  const [localSites, setLocalSites] = useState<SiteDTO[]>(sites);
  const [localAssets, setLocalAssets] = useState<AssetDTO[]>(assets);
  const [localContracts, setLocalContracts] = useState<ContractDTO[]>(contracts);

  useEffect(() => {
    setLocalSites(sites);
    setLocalAssets(assets);
    setLocalContracts(contracts);
  }, [assets, contracts, sites]);

  const currentSite = useMemo(
    () => localSites.find((s) => s.id === primarySiteId) ?? localSites[0] ?? null,
    [localSites, primarySiteId]
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground/60">Seaded</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">Profiil ja eelistused</h1>
          <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
            Halda profiili, objekte, varasid, lepinguid ja teavitusi. Kõik seotakse sinu objektiga, et arvutused ja
            aruanded oleksid järjepidevad.
          </p>
        </div>
        {toast ? (
          <div className="rounded-2xl border border-border/50 bg-card/25 px-4 py-3 text-sm text-foreground/75">
            {toast}
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="profile">Profiil</TabsTrigger>
          <TabsTrigger value="sites">Objektid</TabsTrigger>
          <TabsTrigger value="assets">Varad</TabsTrigger>
          <TabsTrigger value="contracts">Lepingud</TabsTrigger>
          <TabsTrigger value="notifications">Teavitused</TabsTrigger>
          <TabsTrigger value="billing">Arveldus</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <PanelHeader>
                <div>
                  <PanelTitle>Profiil</PanelTitle>
                  <PanelDescription>Põhiandmed ja kasutusviis.</PanelDescription>
                </div>
                <Badge variant="neutral">{profile?.user_type === "business" ? "Äri" : "Kodu"}</Badge>
              </PanelHeader>
              <div className="px-6 pb-6">
                <div className="grid gap-4">
                  <Field label="E-post" hint="Kontakt ja töölauda siduv identiteet.">
                    <Input value={userEmail ?? ""} disabled />
                  </Field>
                  <Field label="Nimi" hint="Kuidas sind töölaudas nimetame.">
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </Field>
                  {profile?.user_type === "business" ? (
                    <Field label="Ettevõtte nimi" hint="Kasutame raportitel ja ekspordis.">
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </Field>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="gradient"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await updateProfileAction({
                            display_name: displayName.trim() || null,
                            company_name: profile?.user_type === "business" ? companyName.trim() || null : null,
                            primary_site_id: primarySiteId || null,
                            notification_prefs: { weekly_summary: prefWeekly, price_alerts: prefAlerts },
                          });
                          flash("Salvestatud.");
                        });
                      }}
                    >
                      Salvesta
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDisplayName(profile?.display_name ?? "");
                        setCompanyName(profile?.company_name ?? "");
                        flash("Muudatused tühistatud.");
                      }}
                    >
                      Tühista
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader>
                <div>
                  <PanelTitle>Aktiivne objekt</PanelTitle>
                  <PanelDescription>See objekt määrab, millele seaded ja salvestused rakenduvad.</PanelDescription>
                </div>
              </PanelHeader>
              <div className="px-6 pb-6">
                <Field label="Vali objekt">
                  <select
                    value={primarySiteId}
                    onChange={(e) => setPrimarySiteId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
                  >
                    {localSites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="mt-4 rounded-2xl border border-border/50 bg-card/25 p-4">
                  <p className="text-xs font-medium tracking-wide text-foreground/60">Märkus</p>
                  <p className="mt-2 text-sm text-foreground/70">
                    Simulatsioonid, raportid ja lepingud seotakse objektiga. Kui haldad mitut objekti, vali siit aktiivne.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="sites">
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Objektid / Sites</PanelTitle>
                <PanelDescription>Lisa ja halda objekte (kodu, kontor, pood jne).</PanelDescription>
              </div>
            </PanelHeader>
            <div className="px-6 pb-6">
              <div className="grid gap-3">
                {localSites.map((s) => (
                  <SiteCard
                    key={s.id}
                    site={s}
                    isPrimary={s.id === primarySiteId}
                    onMakePrimary={() => {
                      setPrimarySiteId(s.id);
                      startTransition(async () => {
                        await updateProfileAction({
                          display_name: displayName.trim() || null,
                          company_name: profile?.user_type === "business" ? companyName.trim() || null : null,
                          primary_site_id: s.id,
                          notification_prefs: { weekly_summary: prefWeekly, price_alerts: prefAlerts },
                        });
                        flash("Aktiivne objekt uuendatud.");
                      });
                    }}
                    onSave={(next) => {
                      // optimistic
                      setLocalSites((prev) => prev.map((x) => (x.id === s.id ? { ...x, ...next } : x)));
                      startTransition(async () => {
                        await upsertSiteAction({ id: s.id, ...next });
                        flash("Objekt salvestatud.");
                      });
                    }}
                    onDelete={() => {
                      setLocalSites((prev) => prev.filter((x) => x.id !== s.id));
                      startTransition(async () => {
                        await deleteSiteAction({ id: s.id });
                        flash("Objekt kustutatud.");
                      });
                    }}
                  />
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-border/50 bg-card/20 p-5">
                <p className="text-xs font-medium tracking-wide text-foreground/60">Lisa uus objekt</p>
                <NewSiteForm
                  onCreate={(next) => {
                    startTransition(async () => {
                      await upsertSiteAction(next);
                      flash("Objekt lisatud.");
                      // full refresh happens via revalidate on server; keep UI snappy by asking user to reload is unnecessary
                      window.location.reload();
                    });
                  }}
                  disabled={pending}
                />
              </div>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="assets">
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Energiavarad</PanelTitle>
                <PanelDescription>Seadmed ja tootmis-/salvestusvarad, mis mõjutavad simulatsioone.</PanelDescription>
              </div>
              <Badge variant="neutral">{currentSite?.name ?? "—"}</Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              {!currentSite ? (
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  Lisa esmalt objekt.
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {localAssets.map((a) => (
                      <AssetCard
                        key={a.id}
                        asset={a}
                        onSave={(next) => {
                          setLocalAssets((prev) => prev.map((x) => (x.id === a.id ? { ...x, ...next } : x)));
                          startTransition(async () => {
                            await upsertAssetAction({ id: a.id, site_id: a.site_id, ...next });
                            flash("Vara salvestatud.");
                          });
                        }}
                        onDelete={() => {
                          setLocalAssets((prev) => prev.filter((x) => x.id !== a.id));
                          startTransition(async () => {
                            await deleteAssetAction({ id: a.id });
                            flash("Vara kustutatud.");
                          });
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-4 rounded-3xl border border-border/50 bg-card/20 p-5">
                    <p className="text-xs font-medium tracking-wide text-foreground/60">Lisa uus vara</p>
                    <NewAssetForm
                      siteId={currentSite.id}
                      onCreate={(next) => {
                        startTransition(async () => {
                          await upsertAssetAction({ site_id: currentSite.id, ...next });
                          flash("Vara lisatud.");
                          window.location.reload();
                        });
                      }}
                      disabled={pending}
                    />
                  </div>
                </>
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="contracts">
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Lepingud</PanelTitle>
                <PanelDescription>Hoia lepingu detailid ühes kohas — analüüs ja raportid kasutavad neid.</PanelDescription>
              </div>
              <Badge variant="neutral">{currentSite?.name ?? "—"}</Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              {!currentSite ? (
                <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
                  Lisa esmalt objekt.
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {localContracts.map((c) => (
                      <ContractCard
                        key={c.id}
                        contract={c}
                        onSave={(next) => {
                          setLocalContracts((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...next } : x)));
                          startTransition(async () => {
                            await upsertContractAction({ id: c.id, site_id: c.site_id, ...next });
                            flash("Leping salvestatud.");
                          });
                        }}
                        onDelete={() => {
                          setLocalContracts((prev) => prev.filter((x) => x.id !== c.id));
                          startTransition(async () => {
                            await deleteContractAction({ id: c.id });
                            flash("Leping kustutatud.");
                          });
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-4 rounded-3xl border border-border/50 bg-card/20 p-5">
                    <p className="text-xs font-medium tracking-wide text-foreground/60">Lisa uus leping</p>
                    <NewContractForm
                      siteId={currentSite.id}
                      onCreate={(next) => {
                        startTransition(async () => {
                          await upsertContractAction({ site_id: currentSite.id, ...next });
                          flash("Leping lisatud.");
                          window.location.reload();
                        });
                      }}
                      disabled={pending}
                    />
                  </div>
                </>
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="notifications">
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Teavitused</PanelTitle>
                <PanelDescription>Vali, milliseid signaale ja kokkuvõtteid soovid.</PanelDescription>
              </div>
              <Badge variant="neutral">Tulekul</Badge>
            </PanelHeader>
            <div className="px-6 pb-6">
              <div className="grid gap-3">
                <ToggleRow
                  title="Nädalakokkuvõte"
                  description="Saadame 1× nädalas lühikokkuvõtte (kulu + top soovitused)."
                  checked={prefWeekly}
                  onChange={setPrefWeekly}
                />
                <ToggleRow
                  title="Hinnahoiatus"
                  description="Teavitame, kui hind/riski signaal ületab läve (tulemas)."
                  checked={prefAlerts}
                  onChange={setPrefAlerts}
                />
              </div>
              <div className="mt-4">
                <Button
                  variant="gradient"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await updateProfileAction({
                        display_name: displayName.trim() || null,
                        company_name: profile?.user_type === "business" ? companyName.trim() || null : null,
                        primary_site_id: primarySiteId || null,
                        notification_prefs: { weekly_summary: prefWeekly, price_alerts: prefAlerts },
                      });
                      flash("Teavitused salvestatud.");
                    });
                  }}
                >
                  Salvesta teavitused
                </Button>
              </div>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="billing">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <PanelHeader>
                <PanelTitle>Arveldus</PanelTitle>
                <PanelDescription>Test-buildis on arveldus välja lülitatud.</PanelDescription>
              </PanelHeader>
              <div className="px-6 pb-6">
                <p className="text-sm text-foreground/70">
                  Selles versioonis saad kogu funktsionaalsust vabalt proovida. Kui lisame hiljem arveldusvoo, ilmuvad
                  siia tellimuse staatus, arved ja haldus.
                </p>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => (window.location.href = "/pricing")}>
                    Toote info
                  </Button>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Kontroll</PanelTitle>
                <PanelDescription>Audit ja rollid (Business) tulevad järgmises faasis.</PanelDescription>
              </PanelHeader>
              <div className="px-6 pb-6">
                <p className="text-sm text-foreground/70">
                  Ärikasutajatel lisanduvad organisatsioonid, rollid ja mitme tarbimiskoha haldus — andmemudel on
                  juba ette valmistatud.
                </p>
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="danger">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="border-[oklch(0.95_0.02_85_/26%)]">
              <PanelHeader>
                <PanelTitle>Logi välja</PanelTitle>
                <PanelDescription>Seansi lõpetamine selles seadmes.</PanelDescription>
              </PanelHeader>
              <div className="px-6 pb-6">
                <form action={signOutAction}>
                  <Button variant="outline" type="submit">
                    Logi välja
                  </Button>
                </form>
              </div>
            </Panel>

            <Panel className="border-[oklch(0.704_0.191_22.216_/40%)]">
              <PanelHeader>
                <PanelTitle>Ohtlik tsoon</PanelTitle>
                <PanelDescription>Toimingud, mida ei saa tagasi võtta (tulekul).</PanelDescription>
              </PanelHeader>
              <div className="px-6 pb-6">
                <p className="text-sm text-foreground/70">
                  Konto kustutamine (koos objektide ja andmetega) lisandub pärast auditilogide ja kinnituse voogu.
                </p>
                <div className="mt-4">
                  <Button variant="destructive" disabled onClick={() => {}}>
                    Kustuta konto (tulemas)
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-foreground/60">{label}</p>
        {hint ? <p className="text-xs text-foreground/55">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/50 bg-card/25 p-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-foreground/65">{description}</p>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
    </div>
  );
}

function SiteCard({
  site,
  isPrimary,
  onMakePrimary,
  onSave,
  onDelete,
}: {
  site: SiteDTO;
  isPrimary: boolean;
  onMakePrimary: () => void;
  onSave: (next: { name: string; object_type: string; country?: string | null; timezone?: string | null }) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(site.name);
  const [type, setType] = useState(site.object_type);
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/25 p-4", isPrimary && "border-[oklch(0.83_0.14_205_/55%)]")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{site.name}</p>
          <p className="mt-1 text-xs text-foreground/55">{site.object_type}</p>
          {isPrimary ? <Badge className="mt-2" variant="cyan">Aktiivne</Badge> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isPrimary ? (
            <Button variant="outline" onClick={onMakePrimary}>
              Tee aktiivseks
            </Button>
          ) : null}
          <Button variant="destructive" onClick={onDelete}>
            Kustuta
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Nimi">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Tüüp">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
          >
            <option value="apartment">Korter</option>
            <option value="house">Maja</option>
            <option value="office">Kontor</option>
            <option value="shop">Pood</option>
            <option value="warehouse">Ladu</option>
            <option value="other">Muu</option>
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Button variant="gradient" onClick={() => onSave({ name: name.trim() || site.name, object_type: type })}>
          Salvesta objekt
        </Button>
      </div>
    </div>
  );
}

function NewSiteForm({
  onCreate,
  disabled,
}: {
  onCreate: (next: { name: string; object_type: string }) => void;
  disabled?: boolean;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("other");
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-3">
      <Input placeholder="Objekti nimi" value={name} onChange={(e) => setName(e.target.value)} />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-10 rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
      >
        <option value="apartment">Korter</option>
        <option value="house">Maja</option>
        <option value="office">Kontor</option>
        <option value="shop">Pood</option>
        <option value="warehouse">Ladu</option>
        <option value="other">Muu</option>
      </select>
      <Button
        variant="outline"
        disabled={disabled || !name.trim()}
        onClick={() => {
          onCreate({ name: name.trim(), object_type: type });
          setName("");
          setType("other");
        }}
      >
        Lisa
      </Button>
    </div>
  );
}

function AssetCard({
  asset,
  onSave,
  onDelete,
}: {
  asset: AssetDTO;
  onSave: (next: { asset_type: string; name?: string | null }) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(asset.name ?? "");
  const [type, setType] = useState(asset.asset_type);
  return (
    <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{labelForAssetType(asset.asset_type)}</p>
          <p className="mt-1 text-xs text-foreground/55">{asset.name ?? "—"}</p>
        </div>
        <Button variant="destructive" onClick={onDelete}>
          Kustuta
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Tüüp">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
          >
            <option value="solar">Päike</option>
            <option value="battery">Aku</option>
            <option value="ev">EV</option>
            <option value="heat_pump">Soojuspump</option>
          </select>
        </Field>
        <Field label="Nimi (valikuline)">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="nt Garage EV" />
        </Field>
      </div>
      <div className="mt-4">
        <Button variant="gradient" onClick={() => onSave({ asset_type: type, name: name.trim() || null })}>
          Salvesta vara
        </Button>
      </div>
    </div>
  );
}

function NewAssetForm({
  siteId,
  onCreate,
  disabled,
}: {
  siteId: string;
  onCreate: (next: { asset_type: string; name?: string | null }) => void;
  disabled?: boolean;
}) {
  const [type, setType] = useState("solar");
  const [name, setName] = useState("");
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-3">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-10 rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
      >
        <option value="solar">Päike</option>
        <option value="battery">Aku</option>
        <option value="ev">EV</option>
        <option value="heat_pump">Soojuspump</option>
      </select>
      <Input placeholder="Nimi (valikuline)" value={name} onChange={(e) => setName(e.target.value)} />
      <Button
        variant="outline"
        disabled={disabled || !siteId}
        onClick={() => {
          onCreate({ asset_type: type, name: name.trim() || null });
          setName("");
          setType("solar");
        }}
      >
        Lisa
      </Button>
    </div>
  );
}

function ContractCard({
  contract,
  onSave,
  onDelete,
}: {
  contract: ContractDTO;
  onSave: (next: {
    provider_name?: string | null;
    contract_type: string;
    starts_on?: string | null;
    ends_on?: string | null;
    notes?: string | null;
  }) => void;
  onDelete: () => void;
}) {
  const [provider, setProvider] = useState(contract.provider_name ?? "");
  const [type, setType] = useState(contract.contract_type);
  const [starts, setStarts] = useState(contract.starts_on ?? "");
  const [ends, setEnds] = useState(contract.ends_on ?? "");
  const [notes, setNotes] = useState(contract.notes ?? "");
  return (
    <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{provider || "Leping"}</p>
          <p className="mt-1 text-xs text-foreground/55">{type}</p>
        </div>
        <Button variant="destructive" onClick={onDelete}>
          Kustuta
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Pakkuja">
          <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="nt Eesti Energia" />
        </Field>
        <Field label="Tüüp">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
          >
            <option value="spot">Börs</option>
            <option value="fixed">Fikseeritud</option>
            <option value="hybrid">Hübriid</option>
            <option value="unknown">Teadmata</option>
          </select>
        </Field>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Algus (YYYY-MM-DD)">
          <Input value={starts} onChange={(e) => setStarts(e.target.value)} placeholder="2026-01-01" />
        </Field>
        <Field label="Lõpp (YYYY-MM-DD)">
          <Input value={ends} onChange={(e) => setEnds(e.target.value)} placeholder="2027-01-01" />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Märkmed (valikuline)">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="nt lisatingimused" />
        </Field>
      </div>
      <div className="mt-4">
        <Button
          variant="gradient"
          onClick={() =>
            onSave({
              provider_name: provider.trim() || null,
              contract_type: type,
              starts_on: starts.trim() || null,
              ends_on: ends.trim() || null,
              notes: notes.trim() || null,
            })
          }
        >
          Salvesta leping
        </Button>
      </div>
    </div>
  );
}

function NewContractForm({
  siteId,
  onCreate,
  disabled,
}: {
  siteId: string;
  onCreate: (next: {
    provider_name?: string | null;
    contract_type: string;
    starts_on?: string | null;
    ends_on?: string | null;
    notes?: string | null;
  }) => void;
  disabled?: boolean;
}) {
  const [provider, setProvider] = useState("");
  const [type, setType] = useState("spot");
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-3">
      <Input placeholder="Pakkuja" value={provider} onChange={(e) => setProvider(e.target.value)} />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-10 rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
      >
        <option value="spot">Börs</option>
        <option value="fixed">Fikseeritud</option>
        <option value="hybrid">Hübriid</option>
        <option value="unknown">Teadmata</option>
      </select>
      <Button
        variant="outline"
        disabled={disabled || !siteId}
        onClick={() => {
          onCreate({ provider_name: provider.trim() || null, contract_type: type });
          setProvider("");
          setType("spot");
        }}
      >
        Lisa
      </Button>
    </div>
  );
}

