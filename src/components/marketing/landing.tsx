"use client";

import { LinkButton } from "@/components/ui/link-button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingCanvas } from "@/components/three/marketing-canvas";
import { ThreeOverlay } from "@/components/three/three-overlay";
import { ScrollSection } from "@/components/marketing/scroll-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerfMode, useScrollStory } from "@/lib/motion/use-scroll-story";
import { useRef } from "react";

export function Landing() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mode = usePerfMode();
  const sections = 8;
  const { progress, activeIndex } = useScrollStory({ container: containerRef, sectionCount: sections });

  return (
    <div ref={containerRef} className="relative w-full">
      <MarketingCanvas progress={progress} mode={mode} />

      <ThreeOverlay />

      <div className="relative z-10">
        <MarketingNav />

        <main>
          {/* HERO */}
          <section className="relative min-h-[100svh] pt-20 md:pt-28">
            <div className="ep-container">
              <div className="grid items-start gap-10 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Badge variant="cyan">Uus standard energiaotsustes</Badge>
                      {mode === "lite" ? <Badge variant="warm">Kergem režiim</Badge> : null}
                    </div>
                    <p className="mt-6 text-sm font-medium tracking-wide text-foreground/70">
                      Energiapiloot — premium energiaintellekti platvorm
                    </p>
                    <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                      Mõista oma energiat. Tee targemaid otsuseid.
                      <span className="block text-foreground/70">
                        Lepingud, tarbimine, investeeringud ja soovitused — ühes süsteemis.
                      </span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/75">
                      Scrolli ja vaata, kuidas hinnad, tipud ja investeeringud muutuvad
                      konkreetseteks valikuteks. Töökindel. Loetav. Mitte lärmakas.
                    </p>

                    <div className="pointer-events-auto mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <LinkButton href="/register" size="lg" variant="gradient">
                        Alusta tasuta
                      </LinkButton>
                      <LinkButton href="/pricing" size="lg" variant="outline">
                        Vaata hindu
                      </LinkButton>
                      <LinkButton href="/dashboard" size="lg" variant="glow" className="sm:ml-1">
                        Vaata töölauda
                      </LinkButton>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <Kpi label="Otsuseni" value="minutid" hint="Segadusest plaanini." />
                      <Kpi label="Stsenaariumid" value="ühes kohas" hint="Mis siis kui, koos riskiga." />
                      <Kpi label="Fookus" value="EE · LV · LT" hint="Baltikumi energia reaalsus." />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <HeroPreview />
                </div>
              </div>
            </div>
          </section>

          {/* STORY */}
          <ScrollSection
            id="problem"
            eyebrow="01 — Probleem"
            title="Elektriotsused on ülekoormavad."
            body="Hinnad, lepingud, tipud, investeeringud ja tarbimine elavad eri kohtades. Tulemuseks on otsused, mis põhinevad kõhutundel või Exceli väsimusel."
            badge={{ label: "Tüüpiline: “Ma ei tea, mida valida.”", variant: "warm" }}
            right={<ProblemPanel />}
          />

          <ScrollSection
            id="solution"
            eyebrow="02 — Lahendus"
            title="Energiapiloot teeb sellest süsteemi."
            body="Koondame lepingud, simulatsioonid, soovitused ja säästu üheks arusaadavaks mudeliks. Sa näed mõju enne, kui teed otsuse."
            badge={{ label: "Läbipaistvad eeldused + auditeeritav loogika", variant: "neutral" }}
            right={<SolutionPanel />}
          />

          <ScrollSection
            id="contracts"
            eyebrow="03 — Lepinguintellekt"
            title="Võrdle lepinguid päris mõju järgi."
            body="Fikseeritud vs börsihind ei ole usk — see on stsenaarium. Näitame tiputundide mõju ja hinnariski selgelt."
            badge={{ label: "Lepingud", variant: "cyan" }}
            right={<FeaturePanel title="Lepingud" lines={["Börs vs fikseeritud", "Tipukoormuse mõju", "Risk ja stabiilsus"]} />}
          />

          <ScrollSection
            id="consumption"
            eyebrow="04 — Tarbimise ülevaade"
            title="Tarbimine, mis selgitab ennast."
            body="Sa ei pea andmeid “lugema” — me visualiseerime mustrid, tipud ja rutiinid nii, et järgmine samm on ilmne."
            badge={{ label: "Tarbimine", variant: "green" }}
            right={<FeaturePanel title="Tarbimine" lines={["Mustrid ja tipud", "Koormuse nihutamine", "Mõju arvele"]} />}
          />

          <ScrollSection
            id="simulations"
            eyebrow="05 — Investeeringute simulatsioon"
            title="Päike, aku, EV laadimine, soojuspump."
            body="Simuleeri tasuvust ja riski ühe stsenaariumina. Võrdle “enne/pärast” ja salvesta otsusevariant."
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
            title="Järgmine parim samm — põhjendusega."
            body="Soovitused ei ole “tarkvara arvamus”. Need on reeglid ja mudelid, mida saad kontrollida ja usaldada."
            badge={{ label: "Soovitused", variant: "green" }}
            right={<RecommendationsPanel />}
          />

          <ScrollSection
            id="trust"
            eyebrow="07 — Usaldus"
            title="Koht sotsiaalse tõestuse jaoks."
            body="Siia tulevad metrikad, kliendilood, logod ja turvaprintsiibid. Me ehitame usalduse sama tõsiselt kui funktsioonid."
            right={<TrustPanel />}
          />

          <ScrollSection
            id="cta"
            eyebrow="08 — Alusta"
            title="Alusta tasuta ja ehita baasjoon."
            body="Kui sul on 2 minutit, saad esimese “mis siis kui” stsenaariumi. Kui sul on 20 minutit, saad plaani."
            badge={{ label: "Ilma kohustuseta", variant: "warm" }}
            right={<FinalCtaPanel />}
          />

          <footer className="ep-container pb-18 md:pb-20">
            <div className="flex flex-col items-start justify-between gap-6 border-t border-border/60 pt-10 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium">Energiapiloot</p>
                <p className="mt-1 text-sm text-foreground/60">
                  Premium energiaintellekti platvorm. Loodud Baltikumi jaoks.
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
            Sisesta kuine kWh hinnang ja näeme kohe, mis mõjutab arvet kõige rohkem.
          </CardDescription>
        </div>
        <Badge variant="green">Demo</Badge>
      </CardHeader>

      <div className="mt-5 grid gap-3">
        <MiniStat label="Kuutarbimine" value="420 kWh" />
        <MiniStat label="Võimalik sääst" value="18–43 € / kuu" />
        <MiniStat label="Järgmine samm" value="Nihuta tipukoormust" />
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
          <CardTitle>Mis teeb otsused raskeks?</CardTitle>
          <CardDescription>Palju muutujaid, vähe selgust.</CardDescription>
        </div>
        <Badge variant="warm">Valu</Badge>
      </CardHeader>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        <Bullet>Hinnad ja risk on segased</Bullet>
        <Bullet>Lepingud ei ole võrreldavad</Bullet>
        <Bullet>Investeeringud tunduvad “hasart”</Bullet>
        <Bullet>Tarbimine on nähtamatu</Bullet>
      </div>
    </Card>
  );
}

function SolutionPanel() {
  return (
    <Card variant="panel" hover="lift" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Üks süsteem</CardTitle>
          <CardDescription>Üks vaade. Üks stsenaarium. Üks otsus.</CardDescription>
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
          <CardDescription>Loetav, auditeeritav ja praktiline.</CardDescription>
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
          <CardDescription>Simuleeri, salvesta, võrdle.</CardDescription>
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
          <CardDescription>“Mida teha järgmisena?” — põhjendusega.</CardDescription>
        </div>
        <Badge variant="green">Nõuanne</Badge>
      </CardHeader>
      <div className="mt-6 space-y-3">
        <MiniStat label="Tegevus" value="Nihuta tipukoormust 18–21" />
        <MiniStat label="Miks" value="Suurim mõju arvele" />
        <MiniStat label="Mõju" value="−8% / kuu (hinnang)" />
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
          <CardDescription>Logod, metrikad, tagasiside (lisame siia).</CardDescription>
        </div>
        <Badge variant="warm">Soon</Badge>
      </CardHeader>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="h-14 rounded-xl border border-border/60 bg-background/25" />
        <div className="h-14 rounded-xl border border-border/60 bg-background/25" />
        <div className="h-14 rounded-xl border border-border/60 bg-background/25" />
      </div>
      <p className="mt-5 text-sm text-foreground/65">
        Me ehitame “trust architecture” sama rangelt kui arvutusmootori.
      </p>
    </Card>
  );
}

function FinalCtaPanel() {
  return (
    <Card variant="panel" className="pointer-events-auto">
      <CardHeader>
        <div>
          <CardTitle>Alusta nüüd</CardTitle>
          <CardDescription>Ehita baasjoon ja salvesta esimene stsenaarium.</CardDescription>
        </div>
        <Badge variant="cyan">CTA</Badge>
      </CardHeader>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/register" size="lg" variant="gradient">
          Alusta tasuta
        </LinkButton>
        <LinkButton href="/pricing" size="lg" variant="outline">
          Vaata hindu
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

