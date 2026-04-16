"use client";

import { LinkButton } from "@/components/ui/link-button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { HeroUniverseCanvas } from "@/components/three/hero-universe-canvas";
import { ThreeOverlay } from "@/components/three/three-overlay";
import { ScrollSection } from "@/components/marketing/scroll-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerfMode, useScrollStory } from "@/lib/motion/use-scroll-story";
import { useScrollChoreography } from "@/lib/motion/use-scroll-choreography";
import { useRef } from "react";

export function Landing() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mode = usePerfMode();
  const sections = 12;
  const { progress, activeIndex } = useScrollStory({ container: containerRef, sectionCount: sections });

  useScrollChoreography({ container: containerRef, mode });

  return (
    <div ref={containerRef} className="relative w-full">
      <HeroUniverseCanvas progress={progress} mode={mode} heroRangeEnd={0.22} panels intensity={1} />

      <ThreeOverlay />

      <div className="relative z-10">
        <MarketingNav />

        <main>
          {/* HERO */}
          <section className="relative min-h-[100svh] pt-20 md:pt-28" data-section="hero">
            <div className="ep-container">
              <div className="grid items-start gap-10 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="max-w-2xl" data-hero-pin>
                    <div className="flex items-center gap-2" data-reveal>
                      <Badge variant="cyan">Energiaotsused, selgelt</Badge>
                      {mode === "lite" ? <Badge variant="warm">Kergem režiim</Badge> : null}
                    </div>
                    <p className="mt-6 text-sm font-medium tracking-wide text-foreground/70" data-reveal>
                      Energiapiloot — premium energiaintellekti platvorm kodudele ja väikestele ettevõtetele
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
                      <LinkButton href="/register" size="lg" variant="gradient">
                        Proovi tasuta
                      </LinkButton>
                      <LinkButton href="/pricing" size="lg" variant="outline">
                        Vaata pakette
                      </LinkButton>
                      <LinkButton href="/dashboard" size="lg" variant="glow" className="sm:ml-1">
                        Vaata töölauda
                      </LinkButton>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3" data-reveal>
                      <Kpi label="Fookus" value="EE · LV · LT" hint="Baltikumi energia reaalsus." />
                      <Kpi label="Stsenaariumid" value="kõrvuti" hint="Võrdle otsuseid ühe vaatega." />
                      <Kpi label="Soovitused" value="põhjendusega" hint="Näed miks, mitte ainult mida." />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <div data-reveal>
                    <HeroPreview />
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
            badge={{ label: "Tulem: kulud, mis oleks saanud väiksemad olla.", variant: "warm" }}
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
            eyebrow="03 — Lepinguintellekt"
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
            eyebrow="07 — Raportid ja stsenaariumid"
            title="Raportid, mida saad päriselt kasutada."
            body="Hoia stsenaariumid kõrvuti, jaga kokkuvõtteid ja tee otsus, mis on lihtne selgitada ka teisele poolele lauda."
            badge={{ label: "Raportid", variant: "warm" }}
            right={<ReportsPanel />}
          />

          <ScrollSection
            id="household"
            eyebrow="08 — Kodule"
            title="Kodule: vähem stressi, rohkem kontrolli."
            body="Leia, millal sul tekivad tipud, mis leping sobib sinu rutiiniga ja millal investeering päriselt tasub — ilma arvamise ja without Exceli kurnatuseta."
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
            body="Selge loogika, minimaalne andmekogumine ja turvaline arhitektuur. Siia lisanduvad peagi logod, kliendilood ja mõõdikud."
            right={<TrustPanel />}
          />

          <ScrollSection
            id="pricing-teaser"
            eyebrow="11 — Paketid"
            title="Alusta tasuta. Uuenda, kui vajad sügavust."
            body="Tasuta annab kiire ülevaate. Pro lisab piiramatu stsenaariumi, raportid ja täpsemad simulatsioonid."
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
                  Premium energiaintellekti platvorm, mis aitab vähendada kulusid ja teha põhjendatud energiaotsuseid.
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
    <Card variant="panel" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Kiirülevaade</CardTitle>
          <CardDescription>
            Alusta lihtsast sisendist. Me näitame, kus on suurim mõju ja mis on järgmine samm.
          </CardDescription>
        </div>
        <Badge variant="green">Demo</Badge>
      </CardHeader>

      <div className="mt-5 grid gap-3">
        <MiniStat label="Kuutarbimine" value="420 kWh" />
        <MiniStat label="Hinnanguline sääst" value="18–43 € / kuu" />
        <MiniStat label="Järgmine samm" value="Võrdle lepingut + nihuta tippe" />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-xs text-foreground/55">Loetav ka pimedas. Disainitud usalduseks.</p>
        <LinkButton href="/login" size="sm" variant="secondary">
          Logi sisse
        </LinkButton>
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/30 px-4 py-3">
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="mt-1 text-sm text-foreground/85">{value}</p>
    </div>
  );
}

function ProblemPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Miks see on keeruline?</CardTitle>
          <CardDescription>Õiged otsused nõuavad seoseid, mitte tabeleid.</CardDescription>
        </div>
        <Badge variant="warm">Valu</Badge>
      </CardHeader>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        <Bullet>Hinnariski on raske hinnata</Bullet>
        <Bullet>Lepingud ei ole “õun õunaga”</Bullet>
        <Bullet>Investeeringu tasuvus on ebaselge</Bullet>
        <Bullet>Tarbimise tipud jäävad varju</Bullet>
      </div>
    </Card>
  );
}

function SolutionPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Üks mudel</CardTitle>
          <CardDescription>Üks vaade. Üks stsenaarium. Üks põhjendatud otsus.</CardDescription>
        </div>
        <Badge variant="cyan">Lahendus</Badge>
      </CardHeader>

      <Tabs defaultValue="contracts" className="mt-6">
        <TabsList>
          <TabsTrigger value="contracts">Lepingud</TabsTrigger>
          <TabsTrigger value="sim">Simulatsioon</TabsTrigger>
          <TabsTrigger value="rec">Soovitus</TabsTrigger>
        </TabsList>
        <TabsContent value="contracts">
          <MiniStat label="Võrdlus" value="börs vs fikseeritud" />
        </TabsContent>
        <TabsContent value="sim">
          <MiniStat label="Mõju" value="enne/pärast" />
        </TabsContent>
        <TabsContent value="rec">
          <MiniStat label="Järgmine samm" value="põhjendusega" />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function FeaturePanel({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Loetav. Praktiline. Põhjendatav.</CardDescription>
        </div>
        <Badge variant="neutral">Funktsioon</Badge>
      </CardHeader>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        {lines.map((l) => (
          <Bullet key={l}>{l}</Bullet>
        ))}
      </div>
    </Card>
  );
}

function SimulationPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Investeeringu stsenaarium</CardTitle>
          <CardDescription>Simuleeri, salvesta ja võrdle otsuseid.</CardDescription>
        </div>
        <Badge variant="cyan">Sim</Badge>
      </CardHeader>
      <div className="mt-6 grid gap-3">
        <MiniStat label="Tasuvus (näide)" value="6–9 aastat" />
        <MiniStat label="Risk" value="keskmine" />
      </div>
      <div className="mt-7">
        <LinkButton href="/dashboard/simulations" variant="outline">
          Ava simulatsioonid
        </LinkButton>
      </div>
    </Card>
  );
}

function RecommendationsPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Soovitus</CardTitle>
          <CardDescription>“Mida teha järgmisena?” — koos mõju ja põhjendusega.</CardDescription>
        </div>
        <Badge variant="green">Nõuanne</Badge>
      </CardHeader>
      <div className="mt-6 space-y-3">
        <MiniStat label="Tegevus" value="Nihuta koormust 18–21" />
        <MiniStat label="Miks" value="Suurim mõju tipuhinnal" />
        <MiniStat label="Mõju" value="−8% / kuu (hinnang)" />
      </div>
    </Card>
  );
}

function ReportsPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Stsenaariumid ja raportid</CardTitle>
          <CardDescription>Üks kokkuvõte, mida on lihtne jagada.</CardDescription>
        </div>
        <Badge variant="warm">Raport</Badge>
      </CardHeader>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        <Bullet>Võrdlus enne/pärast</Bullet>
        <Bullet>Kokkuvõte otsuse põhjenduseks</Bullet>
        <Bullet>Salvestus ja ajalugu</Bullet>
      </div>
    </Card>
  );
}

function HouseholdPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Kodu</CardTitle>
          <CardDescription>Vähem üllatusi. Rohkem kontrolli.</CardDescription>
        </div>
        <Badge variant="green">Kodu</Badge>
      </CardHeader>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        <Bullet>Tiputunnid ja rutiinid nähtavaks</Bullet>
        <Bullet>Lepingu valik päris mõju järgi</Bullet>
        <Bullet>Investeeringu tasuvus selgeks</Bullet>
      </div>
    </Card>
  );
}

function BusinessPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Väikeettevõte</CardTitle>
          <CardDescription>Otsus, mida saab põhjendada ja korrata.</CardDescription>
        </div>
        <Badge variant="cyan">Äri</Badge>
      </CardHeader>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        <Bullet>Prognoositavam kulu</Bullet>
        <Bullet>Stsenaariumid ja raportid juhatusele/partnerile</Bullet>
        <Bullet>Soovitused, mis sobituvad tööpäevaga</Bullet>
      </div>
    </Card>
  );
}

function TrustPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Usaldusruum</CardTitle>
          <CardDescription>Logod, metrikad ja kliendilood lisame siia peagi.</CardDescription>
        </div>
        <Badge variant="warm">Varsti</Badge>
      </CardHeader>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="h-14 rounded-xl border border-border/60 bg-background/25" />
        <div className="h-14 rounded-xl border border-border/60 bg-background/25" />
        <div className="h-14 rounded-xl border border-border/60 bg-background/25" />
      </div>
      <p className="mt-5 text-sm text-foreground/65">
        Turvalisus ja läbipaistvus ei ole lisa — see on toote osa.
      </p>
    </Card>
  );
}

function PricingTeaserPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Paketid</CardTitle>
          <CardDescription>Vali, kui sügavale tahad minna.</CardDescription>
        </div>
        <Badge variant="neutral">Hinnad</Badge>
      </CardHeader>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        <Bullet>Tasuta: kiire ülevaade</Bullet>
        <Bullet>Pro: piiramatu stsenaarium + raportid</Bullet>
      </div>
      <div className="mt-7">
        <LinkButton href="/pricing" variant="outline">
          Vaata pakette
        </LinkButton>
      </div>
    </Card>
  );
}

function FinalCtaPanel() {
  return (
    <Card variant="panel" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Alusta nüüd</CardTitle>
          <CardDescription>Loo baasjoon ja salvesta esimene otsusevariant.</CardDescription>
        </div>
        <Badge variant="cyan">CTA</Badge>
      </CardHeader>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/register" size="lg" variant="gradient">
          Proovi tasuta
        </LinkButton>
        <LinkButton href="/pricing" size="lg" variant="outline">
          Vaata pakette
        </LinkButton>
      </div>
      <p className="mt-5 text-xs text-foreground/55">
        Mobiilis kasutame kergemat 3D režiimi, et tekst ja scroll oleksid alati sujuvad.
      </p>
    </Card>
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

