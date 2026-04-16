"use client";

import { LinkButton } from "@/components/ui/link-button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ScrollSection } from "@/components/marketing/scroll-section";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeviceProfile, useScrollStory } from "@/lib/motion/use-scroll-story";
import { useScrollChoreography } from "@/lib/motion/use-scroll-choreography";
import { type ReactNode, useRef } from "react";
import { MobileHeroFallback } from "@/components/marketing/mobile-hero-fallback";
import { HeroSceneLazy } from "@/components/marketing/hero-scene-lazy";
import { cn } from "@/lib/utils";

export function Landing() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const device = useDeviceProfile();
  const mode = device.mode;
  const sections = 12;
  const { progress } = useScrollStory({ container: containerRef, sectionCount: sections, mode });

  useScrollChoreography({ container: containerRef, mode });

  return (
    <div ref={containerRef} className="relative w-full">
      {!device.preferMobileFallback ? (
        <HeroSceneLazy
          progress={progress}
          mode={mode}
          heroRangeEnd={0.22}
          panels={!device.isMobile}
          intensity={device.lowEnd ? 0.75 : 1}
        />
      ) : null}

      {!device.preferMobileFallback ? (
        <>
          <div className="pointer-events-none fixed inset-0 z-[1] ep-readability-scrim" />
          <div className="pointer-events-none fixed inset-0 z-[2] ep-hero-vignette" />
        </>
      ) : null}

      <div className="relative z-10">
        <MarketingNav />

        <main>
          {/* HERO */}
          <section className="relative min-h-[100svh] pt-20 md:pt-28" data-section="hero">
            <div className="ep-container">
              <div className="grid items-start gap-10 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="relative max-w-2xl" data-hero-pin>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(900px_520px_at_18%_35%,oklch(0.12_0.01_255_/84%),transparent_65%)]"
                    />
                    <div className="flex items-center gap-2" data-reveal>
                      <Badge variant="cyan">Energiaotsused, selgelt</Badge>
                      {mode === "lite" ? <Badge variant="warm">Kergem režiim</Badge> : null}
                    </div>
                    <p className="mt-6 text-sm font-medium tracking-wide text-foreground/70" data-reveal>
                      Energiapiloot — energiaotsuste platvorm kodudele ja väikeettevõtetele
                    </p>
                    <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl" data-reveal>
                      Mõista oma energiat. Tee targemaid otsuseid.
                      <span className="block text-foreground/70">
                        Lepingud, tarbimine ja investeeringud — üheks selgeks plaaniks.
                      </span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/75" data-reveal>
                      Analüüsi lepinguid, mõista tarbimist, simuleeri investeeringuid ja saa
                      personaalseid soovitusi — nii, et otsus on põhjendatud ja mõõdetav.
                    </p>

                    <div className="pointer-events-auto mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" data-reveal>
                      <LinkButton href="/leping" size="lg" variant="gradient">
                        Ava lepingu labor
                      </LinkButton>
                      <LinkButton href="/pricing#avamine" size="lg" variant="outline">
                        Ava täielik analüüs
                      </LinkButton>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3" data-reveal>
                      <Kpi label="Fookus" value="EE · LV · LT" hint="Baltikumi energia reaalsus." />
                      <Kpi label="Stsenaariumid" value="kõrvuti" hint="Võrdle otsuseid ühe vaatega." />
                      <Kpi label="Soovitused" value="põhjendusega" hint="Näed ka „miks“, mitte ainult „mida“." />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <div data-reveal>
                    {device.preferMobileFallback ? (
                      <MobileHeroFallback
                        label={device.reducedMotion ? "Vaikne animatsioon" : "Kerge vaade"}
                      />
                    ) : (
                      <HeroPreview />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STORY */}
          <ScrollSection
            id="problem"
            eyebrow="01 — Probleem"
            title="Elektriotsused on liiga sageli “umbes”."
            body="Hinnad kõiguvad, lepingud on raskesti võrreldavad ja investeeringud tunduvad loteriina. Tarbimise mustrid jäävad peitu — kuni arve saabub."
            badge={{ label: "Tulemus: kulud, mida oleks saanud vähendada.", variant: "warm" }}
            right={<ProblemPanel />}
          />

          <ScrollSection
            id="solution"
            eyebrow="02 — Lahendus"
            title="Energiapiloot teeb keerulisest selge otsuse."
            body="Koondame lepingud, tarbimise ja investeeringud üheks mudeliks. Näed mõju enne, kui teed otsuse — ja saad tulemuse põhjendada."
            badge={{ label: "Selged eeldused. Kontrollitav loogika.", variant: "neutral" }}
            right={<SolutionPanel />}
          />

          <ScrollSection
            id="contracts"
            eyebrow="03 — Lepingu analüüs"
            title="Lepingud: võrdle mõju, mitte lubadusi."
            body="Fikseeritud vs börs ei ole ideoloogia. Me näitame hinnariski, tiputundide mõju ja päris säästu samas vaates."
            badge={{ label: "Lepingud", variant: "cyan" }}
            right={<FeaturePanel title="Lepingud" lines={["Börs vs fikseeritud", "Tipukoormuse mõju", "Risk ja stabiilsus"]} />}
          />

          <ScrollSection
            id="consumption"
            eyebrow="04 — Tarbimise ülevaade"
            title="Tarbimine: näe mustrit ja leia raha laualt."
            body="Visualiseerime tipud ja rutiinid nii, et saad teada, mis tegelikult arvet juhib — ja mida on mõistlik muuta."
            badge={{ label: "Tarbimine", variant: "green" }}
            right={<FeaturePanel title="Tarbimine" lines={["Mustrid ja tipud", "Koormuse nihutamine", "Mõju arvele"]} />}
          />

          <ScrollSection
            id="simulations"
            eyebrow="05 — Investeeringute simulatsioon"
            title="Simulatsioonid: investeering pole enam pime usk."
            body="Päike, aku, EV laadimine, soojuspump — simuleeri tasuvust ja riski, võrdle variante ja salvesta otsuseplaan."
            badge={{ label: "Simulatsioonid", variant: "cyan" }}
            right={<SimulationPanel />}
          >
            <div className="pointer-events-auto grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-foreground/60">Kuutarbimine (näide)</p>
                <Input defaultValue="420" inputMode="numeric" />
              </div>
              <div>
                <p className="text-xs text-foreground/60">Päikese võimsus (kWp)</p>
                <Input defaultValue="6.0" inputMode="decimal" />
              </div>
            </div>
          </ScrollSection>

          <ScrollSection
            id="recommendations"
            eyebrow="06 — Personaalsed soovitused"
            title="Soovitused: “mida teha” koos “miksiga”."
            body="Saad konkreetsed sammud, millel on põhjendus, hinnanguline mõju ja risk. Ei udujuttu. Ei musta kasti."
            badge={{ label: "Soovitused", variant: "green" }}
            right={<RecommendationsPanel />}
          />

          <ScrollSection
            id="reports"
            eyebrow="07 — Aruanded ja stsenaariumid"
            title="Aruanded, mida julged edasi anda."
            body="Hoia stsenaariumid kõrvuti, jaga kokkuvõtteid ja tee otsus, mida on lihtne selgitada ka teisele poole laua taga."
            badge={{ label: "Aruanded", variant: "warm" }}
            right={<ReportsPanel />}
          />

          <ScrollSection
            id="household"
            eyebrow="08 — Kodule"
            title="Kodule: vähem stressi, rohkem kontrolli."
            body="Leia, millal tekivad tipud, milline elektripakett sobib sinu rutiiniga ja millal investeering päriselt tasub — ilma pimesikku arvamise ja Exceli väsimuseta."
            badge={{ label: "Kodu", variant: "green" }}
            right={<HouseholdPanel />}
          />

          <ScrollSection
            id="business"
            eyebrow="09 — Väikeettevõttele"
            title="Ärile: kulud kontrolli alla ja otsus põhjendatuks."
            body="Tee lepingute ja investeeringute otsused nii, et need on mõõdetavad, jagatavad ja auditeeritavad. Vähem üllatusi, rohkem prognoositavust."
            badge={{ label: "Väikeettevõte", variant: "cyan" }}
            right={<BusinessPanel />}
          />

          <ScrollSection
            id="trust"
            eyebrow="10 — Usaldus"
            title="Ehitatud usalduseks, mitte trikkideks."
            body="Selge loogika, mõistlik andmekogumine ja turvaline tehniline alus. Lähitulevikus lisanduvad partnerid ja tulemused — kuni nendeni on fookus ausal tootel."
            right={<TrustPanel />}
          />

          <ScrollSection
            id="pricing-teaser"
            eyebrow="11 — Paketid"
            title="Alusta tasuta. Uuenda, kui vajad sügavust."
            body="Tasuta paketiga saad kiire ülevaate. Pro paketiga tulevad piiramatu arv stsenaariume, aruanded ja kõik simulaatorid."
            badge={{ label: "Hinnad", variant: "neutral" }}
            right={<PricingTeaserPanel />}
          />

          <ScrollSection
            id="cta"
            eyebrow="12 — Alusta"
            title="Tee esimene otsus täna."
            body="Kui sul on 2 minutit, saad esimese stsenaariumi. Kui sul on 20 minutit, saad plaani, mida on lihtne järgida."
            badge={{ label: "Ilma kohustuseta", variant: "warm" }}
            right={<FinalCtaPanel />}
          />

          <footer className="ep-container pb-18 md:pb-20">
            <div className="flex flex-col items-start justify-between gap-6 border-t border-border/60 pt-10 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium">Energiapiloot</p>
                <p className="mt-1 text-sm text-foreground/60">
                  Platvorm kodudele ja väikeettevõtetele: vähem äraarvamisi, rohkem selgeid energiaotsuseid.
                </p>
              </div>
              <div className="pointer-events-auto flex items-center gap-3">
                <LinkButton href="/security" variant="ghost">
                  Turvalisus
                </LinkButton>
                <LinkButton href="/legal/privacy" variant="ghost">
                  Privaatsus
                </LinkButton>
                <LinkButton href="/legal/terms" variant="ghost">
                  Tingimused
                </LinkButton>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 px-4 py-4 backdrop-blur-md shadow-[var(--shadow-elev-1)]">
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-foreground/55">{hint}</p>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="ep-signal-frame pointer-events-auto rounded-[1.75rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-foreground/55">
            SIGNAAL · ÜLEVAADE
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight">Kiirülevaade</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            Alusta väikesest sisendist. Näitame, kus on suurim mõju — ja mis on järgmine samm.
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="rounded-full border border-border/60 bg-background/25 px-3 py-1 text-[11px] text-foreground/65">
            Reaalajas · mudel
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <MiniStat label="Kuutarbimine" value="420 kWh" />
        <MiniStat label="Hinnanguline sääst" value="18–43 € / kuu" />
        <MiniStat label="Järgmine samm" value="Võrdle lepingut + nihuta tippe" />
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-foreground/55">
          Tekst jääb loetavaks: me hoiame kontrasti ja rütmi kontrolli all.
        </p>
        <LinkButton href="/pricing#avamine" size="sm" variant="secondary">
          Ava sügavus
        </LinkButton>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/25 px-4 py-3">
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="mt-1 text-sm text-foreground/85">{value}</p>
    </div>
  );
}

function PanelChrome({
  kicker,
  title,
  subtitle,
  right,
  children,
  className,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ep-signal-frame rounded-[1.75rem] p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-foreground/55">{kicker}</p>
          <p className="mt-2 text-lg font-semibold tracking-tight">{title}</p>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((v, idx) => (
        <div
          key={`${idx}-${v}`}
          className="w-1.5 rounded-full bg-[oklch(0.83_0.14_205_/0.55)]"
          style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function ProblemPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="PROBLEEM · ÜLEVAADE"
      title="Miks see on keeruline?"
      subtitle="Õiged otsused nõuavad seoseid — mitte tabeleid, mis elavad oma elu."
      right={<Badge variant="warm">Valu</Badge>}
    >
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <Sparkline values={[12, 18, 16, 22, 31, 27, 35, 29, 33, 41, 38, 44]} />
          <p className="mt-3 text-xs text-foreground/55">
            Hinnad ja tipud liiguvad — inimese töömälu mitte.
          </p>
        </div>
        <div className="md:col-span-3 space-y-2 text-sm text-foreground/70">
          <Bullet>Hinnariski on raske hinnata</Bullet>
          <Bullet>Lepingud ei ole “õun õunaga”</Bullet>
          <Bullet>Investeeringu tasuvus on ebaselge</Bullet>
          <Bullet>Tarbimise tipud jäävad varju</Bullet>
        </div>
      </div>
    </PanelChrome>
  );
}

function SolutionPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="MUDEL · KONTROLL"
      title="Üks mudel. Üks narratiiv."
      subtitle="Leping + tarbimine + investeering → üks selge otsus, mida saab korrata."
      right={<Badge variant="cyan">Lahendus</Badge>}
    >
      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts">Lepingud</TabsTrigger>
          <TabsTrigger value="sim">Simulatsioon</TabsTrigger>
          <TabsTrigger value="rec">Soovitused</TabsTrigger>
        </TabsList>
        <TabsContent value="contracts">
          <MiniStat label="Võrdlus" value="börs vs fikseeritud (mõju, mitte slogan)" />
        </TabsContent>
        <TabsContent value="sim">
          <MiniStat label="Mõju" value="enne/pärast — samade eeldustega" />
        </TabsContent>
        <TabsContent value="rec">
          <MiniStat label="Järgmine samm" value="põhjendusega, mitte “proovi õnne”" />
        </TabsContent>
      </Tabs>
    </PanelChrome>
  );
}

function FeaturePanel({ title, lines }: { title: string; lines: string[] }) {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="MOODUL"
      title={title}
      subtitle="Tööriist, mis näitab seoseid — mitte “feature boxi” teksti."
      right={
        <div className="rounded-full border border-border/60 bg-background/25 px-3 py-1 text-[11px] text-foreground/65">
          SIGNAAL
        </div>
      }
    >
      <div className="space-y-2 text-sm text-foreground/70">
        {lines.map((l) => (
          <Bullet key={l}>{l}</Bullet>
        ))}
      </div>
    </PanelChrome>
  );
}

function SimulationPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="SIM · OTSUS"
      title="Investeering pole enam pime usk."
      subtitle="Vaata tasuvust, tundlikkust ja “mis siis, kui” — enne kui allkirjastad."
      right={<Badge variant="cyan">Simulatsioon</Badge>}
    >
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <Sparkline values={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]} />
          <p className="mt-3 text-xs text-foreground/55">Näidisrida: sääst kasvab aeglaselt, aga stabiilselt.</p>
        </div>
        <div className="md:col-span-3 grid gap-3">
          <MiniStat label="Tasuvus (näide)" value="6–9 aastat" />
          <MiniStat label="Risk" value="keskmine (hinnanguline)" />
        </div>
      </div>
      <div className="mt-7">
        <LinkButton href="/simulatsioonid" variant="outline">
          Ava simulatsioonid
        </LinkButton>
      </div>
    </PanelChrome>
  );
}

function RecommendationsPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="JÄRGMINE · SAMM"
      title="Soovitus, mis ei aja udu"
      subtitle="Konkreetne tegevus + põhjus + hinnanguline mõju."
      right={<Badge variant="green">Nõuanne</Badge>}
    >
      <div className="space-y-3">
        <MiniStat label="Tegevus" value="Nihuta koormust 18–21" />
        <MiniStat label="Miks" value="Suurim mõju tipuhinnal" />
        <MiniStat label="Mõju" value="−8% / kuu (hinnang)" />
      </div>
    </PanelChrome>
  );
}

function ReportsPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="VÄLJUND · JAGAMINE"
      title="Raport, mis kõlbab päriselt edasi anda."
      subtitle="Üks kokkuvõte, mis seletab otsuse loogika — mitte ekraanipilt Excelist."
      right={<Badge variant="warm">Aruanne</Badge>}
    >
      <div className="space-y-2 text-sm text-foreground/70">
        <Bullet>Võrdlus enne/pärast</Bullet>
        <Bullet>Kokkuvõte otsuse põhjenduseks</Bullet>
        <Bullet>Salvestus ja ajalugu</Bullet>
      </div>
    </PanelChrome>
  );
}

function HouseholdPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="KODU · RÜTM"
      title="Kodus on energia sageli harjumuste küsimus."
      subtitle="Näe tippe ja rutiine nii, et muudatused on mõistlikud — mitte fanatism."
      right={<Badge variant="green">Kodu</Badge>}
    >
      <div className="space-y-2 text-sm text-foreground/70">
        <Bullet>Tiputunnid ja rutiinid nähtavaks</Bullet>
        <Bullet>Lepingu valik päris mõju järgi</Bullet>
        <Bullet>Investeeringu tasuvus selgeks</Bullet>
      </div>
    </PanelChrome>
  );
}

function BusinessPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="ÄRI · PROGNOOS"
      title="Väikeettevõte vajab otsust, mida saab korrata."
      subtitle="Numbrid, stsenaariumid ja raportid — ilma “powerpointi müstikata”."
      right={<Badge variant="cyan">Äri</Badge>}
    >
      <div className="space-y-2 text-sm text-foreground/70">
        <Bullet>Prognoositavam kulu</Bullet>
        <Bullet>Stsenaariumid ja raportid juhatusele/partnerile</Bullet>
        <Bullet>Soovitused, mis sobituvad tööpäevaga</Bullet>
      </div>
    </PanelChrome>
  );
}

function TrustPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="USALDUS · SÜSTEEM"
      title="Usaldus ei ole turunduslause — see on arhitektuur."
      subtitle="Läbipaistev loogika, minimaalne andmekogumine ja turvaline alus."
      right={<Badge variant="warm">Varsti</Badge>}
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="h-14 rounded-xl border border-border/60 bg-background/20" />
        <div className="h-14 rounded-xl border border-border/60 bg-background/20" />
        <div className="h-14 rounded-xl border border-border/60 bg-background/20" />
      </div>
      <p className="mt-5 text-sm text-foreground/65">
        Partnerite ja mõõdikute plokk täieneb; toode on mõeldud juba praegu pärisotsuste jaoks, mitte ainult demoks.
      </p>
    </PanelChrome>
  );
}

function PricingTeaserPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="PAKETT · SÜGAVUS"
      title="Alusta väikselt. Kasva, kui vajad sügavust."
      subtitle="Tasuta annab suuna. Tasulised paketid annavad töövoogu."
      right={<Badge variant="neutral">Hinnad</Badge>}
    >
      <div className="space-y-2 text-sm text-foreground/70">
        <Bullet>Avalik: interaktiivsed tööriistad kohe brauseris</Bullet>
        <Bullet>Premium: täissügavus, salvestus ja PDF (Stripe voog tulekul)</Bullet>
      </div>
      <div className="mt-7">
        <LinkButton href="/pricing" variant="outline">
          Vaata pakette
        </LinkButton>
      </div>
    </PanelChrome>
  );
}

function FinalCtaPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="ALUSTA · KOHE"
      title="Tee esimene otsus täna."
      subtitle="Salvesta esimene stsenaarium. Kui see on selge, on kogu energia jutt kergem."
      right={<Badge variant="cyan">Alusta</Badge>}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/simulatsioonid" size="lg" variant="gradient">
          Käivita simulatsioon
        </LinkButton>
        <LinkButton href="/pricing#avamine" size="lg" variant="outline">
          Ava premium
        </LinkButton>
      </div>
      <p className="mt-5 text-xs text-foreground/55">
        Mobiilis hoitakse 3D kontrolli all — et scroll ja tekst jääksid “premium”, mitte “demo”.
      </p>
    </PanelChrome>
  );
}


function Bullet({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.45)]" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

