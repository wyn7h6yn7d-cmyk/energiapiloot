"use client";

import { LinkButton } from "@/components/ui/link-button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ScrollSection } from "@/components/marketing/scroll-section";
import { Badge } from "@/components/ui/badge";
import { useDeviceProfile, useScrollStory } from "@/lib/motion/use-scroll-story";
import { useScrollChoreography } from "@/lib/motion/use-scroll-choreography";
import { type ReactNode, useRef } from "react";
import { MobileHeroFallback } from "@/components/marketing/mobile-hero-fallback";
import { HeroSceneLazy } from "@/components/marketing/hero-scene-lazy";
import { CinematicFooter } from "@/components/marketing/cinematic-footer";
import { cn } from "@/lib/utils";

export function Landing() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const device = useDeviceProfile();
  const mode = device.mode;
  const storySections = 6;
  const { progress } = useScrollStory({ container: containerRef, sectionCount: storySections, mode });

  useScrollChoreography({ container: containerRef, mode });

  return (
    <div ref={containerRef} className="relative w-full">
      {!device.preferMobileFallback ? (
        <HeroSceneLazy
          progress={progress}
          mode={mode}
          heroRangeEnd={0.26}
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
          <section className="relative min-h-[100svh] overflow-hidden pt-20 md:pt-28" data-section="hero">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-[min(92%,640px)] bg-gradient-to-r from-[oklch(0.06_0.02_255_/_0.94)] via-[oklch(0.07_0.02_255_/_0.55)] to-transparent md:block"
            />
            <div aria-hidden className="ep-hero-field hidden md:block" />
            <div
              aria-hidden
              className="pointer-events-none absolute right-[8%] top-[18%] hidden h-[min(52vh,420px)] w-[min(42vw,380px)] opacity-[0.35] md:block"
            >
              <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M32 228 Q 128 72 200 132 T 368 168"
                  stroke="oklch(0.83 0.14 205 / 55%)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M48 268 Q 168 112 268 232 T 348 148"
                  stroke="oklch(0.82 0.16 145 / 40%)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="200" r="120" stroke="oklch(0.83 0.14 205 / 12%)" strokeWidth="1" />
                <circle cx="200" cy="200" r="88" stroke="oklch(0.82 0.16 145 / 10%)" strokeWidth="1" />
              </svg>
            </div>
            <div className="ep-container relative z-10">
              <div className="grid items-start gap-12 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-7">
                  <div className="relative max-w-2xl" data-hero-pin>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(900px_520px_at_18%_35%,oklch(0.83_0.14_205_/_12%),transparent_62%),radial-gradient(720px_480px_at_78%_65%,oklch(0.82_0.16_145_/_8%),transparent_58%)]"
                    />
                    <div className="flex flex-wrap items-center gap-2" data-reveal>
                      <Badge variant="cyan" className="border-[oklch(0.83_0.14_205_/_35%)] shadow-[0_0_20px_-6px_oklch(0.83_0.14_205_/_0.45)]">
                        Avalik premium
                      </Badge>
                      {mode === "lite" ? <Badge variant="warm">Kergem vaade</Badge> : null}
                    </div>
                    <p className="ep-eyebrow-caps mt-8 text-foreground/55" data-reveal>
                      Energiapiloot
                    </p>
                    <h1
                      className="ep-display mt-4 text-balance text-[2.35rem] font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-[3.35rem] md:leading-[1.02]"
                      data-reveal
                    >
                      <span className="ep-text-gradient">Energia, mis joonistub selgeks.</span>{" "}
                      <span className="text-foreground">Otsus, mille saad sõnades hoida.</span>
                    </h1>
                    <p className="mt-3 max-w-xl text-balance text-lg font-medium leading-snug text-foreground/78 md:text-xl" data-reveal>
                      Elekter, tarbimine ja investeering ühes vaates — nii kodus kui väikses ettevõttes.
                    </p>
                    <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/68 md:text-[1.05rem]" data-reveal>
                      Kui kerid, avaneb lugu: miks see keeruline tundub, kuidas me selle üheks jooneks tõmbame, ja kuidas
                      saad kohe proovida. Kontot ei küsita. Täisvaate ja laaditava PDF-i avad ühe ostuga, kui oled valmis.
                    </p>

                    <div className="pointer-events-auto mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" data-reveal>
                      <LinkButton
                        href="/simulatsioonid"
                        size="lg"
                        variant="gradient"
                        className="min-h-11 rounded-xl px-7 text-[0.95rem] font-semibold tracking-tight shadow-[0_0_44px_-10px_oklch(0.83_0.14_205_/_0.72)]"
                      >
                        Käivita simulatsioon
                      </LinkButton>
                      <LinkButton
                        href="/pricing#avamine"
                        size="lg"
                        variant="outline"
                        className="min-h-11 rounded-xl border-[oklch(1_0_0_/_16%)] bg-[oklch(1_0_0_/_5%)] px-6 text-[0.95rem] font-semibold tracking-tight"
                      >
                        Ava täisvaade
                      </LinkButton>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" data-reveal>
                      <Kpi label="1 · Ilma kontota" value="Kohe" hint="Tööriistad käivad brauseris." />
                      <Kpi label="2 · Esmalt selgus" value="Ülevaade" hint="Näed suunda enne kui maksad." />
                      <Kpi label="3 · Kui valmis" value="Üks kord" hint="Täisvaade ja PDF ühe ostuga." />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <div data-reveal>
                    {device.preferMobileFallback ? (
                      <MobileHeroFallback
                        label={device.reducedMotion ? "Staatiline vaade" : "Lihtsustatud vaade"}
                      />
                    ) : (
                      <HeroPreview progress={progress} reducedMotion={device.reducedMotion} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STORY — single continuum */}
          <div className="ep-story-continuum">
            <ScrollSection
              beat={1}
              totalBeats={storySections}
              id="problem"
              accent="warm"
              eyebrow="Miks see nii keeruline tundub"
              title="Elekter jääb tihti pooleli — “umbes” ja “äkki”."
              body="Hinnad liiguvad, lepinguid on raske kõrvuti panna ja investeering tundub õnnemänguna. Tiputunnid ja tegelik mõju jäävad sageli varju — kuni arve üllatab."
              badge={{ label: "Otsus vajab selget jutustust, mitte killustatud tabeleid.", variant: "warm" }}
              right={<ProblemPanel />}
            />

            <ScrollSection
              beat={2}
              totalBeats={storySections}
              id="solution"
              accent="cyan"
              eyebrow="Kuidas me aitame"
              title="Üks loogika kogu pildi jaoks."
              body="Leping, tarbimine ja investeering ei ela eraldi kaustades — need kohtuvad samas mudelis. Näed mõju enne kui kirjutad alla; põhjendus jääb sulle."
              badge={{ label: "Eeldused lauale · arusaadav joon", variant: "neutral" }}
              right={<SolutionPanel />}
            />

            <ScrollSection
              beat={3}
              totalBeats={storySections}
              id="proovi"
              accent="cyan"
              eyebrow="Proovi kohe"
              title="Kolm tööriista, üks ja sama selgus."
              body="Simulatsioon, leping või tarbimine — kõik avanevad kohe. Näed kohe peamisi näitajaid ja suunda; graafikud, täishinnang ja eksport tulevad täisvaatega."
              badge={{ label: "Registreerimist ei küsita", variant: "cyan" }}
              right={<TryToolsPanel />}
            />

            <ScrollSection
              beat={4}
              totalBeats={storySections}
              id="premium"
              accent="warm"
              eyebrow="Täisvaade"
              title="Esmalt näed suunda — siis avad kogu pildi."
              body="Me ei müü tühja lehte: osa jääb näha, ülejäänu kutsub avama. Täisvaade, interaktiivne kokkuvõte ja laaditav PDF ühe ostuga, kui oled veendunud."
              badge={{ label: "Ühekordne ost · tellimust ei sunni", variant: "warm" }}
              right={<PremiumJourneyPanel />}
            />

            <ScrollSection
              beat={5}
              totalBeats={storySections}
              id="trust"
              accent="neutral"
              eyebrow="Usaldus"
              title="Selge arhitektuur, mitte tühi lubadus."
              body="Loogika on lahti seletatav, kogume ainult seda, mis otsust toetab, ja makse käib turvaliselt. Täisvaade tähendab sügavamat väljundit — mitte musta kasti."
              right={<TrustPanel />}
            />

            <ScrollSection
              beat={6}
              totalBeats={storySections}
              id="cta"
              accent="green"
              eyebrow="Järgmine samm"
              title="Alusta täna — kaks minutit piisab."
              body="Käivita simulatsioon või ava lepingu labor. Näed kohe, kas suund tundub õige. Täisvaate avad siis, kui oled valmis."
              badge={{ label: "Tasuta katse · täisvaade sinu valik", variant: "green" }}
              right={<FinalCtaPanel />}
            />
          </div>

          <CinematicFooter />
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
    <div className="ep-stat-plinth">
      <p className="ep-eyebrow-caps text-[0.58rem] text-foreground/45">{label}</p>
      <p className="ep-display mt-3 text-lg font-semibold tracking-tight text-foreground/95">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-foreground/55">{hint}</p>
    </div>
  );
}

function smoothstepHero(x: number) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

function HeroPreview({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const heroT = Math.min(1, Math.max(0, progress / 0.26));
  const clarity = smoothstepHero(heroT);
  const chaos = 1 - clarity;

  return (
    <div className="ep-holo-panel pointer-events-auto p-6 md:p-8">
      <div
        className="relative z-10"
        style={
          reducedMotion
            ? undefined
            : {
                transform: `perspective(1200px) rotateY(${-4 + clarity * 3}deg) rotateX(${2 - clarity * 2.5}deg)`,
                transition: "transform 0.35s ease-out",
              }
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="ep-eyebrow-caps text-foreground/50">Elav ülevaade</p>
            <p className="ep-display mt-3 text-xl font-semibold tracking-tight md:text-2xl">Signaal tõmbub fookusesse</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/68">
              Müra taandub — struktuur tuleb esile. Näed, kuhu tähelepanu kõigepealt panna, enne kui süvened täisvaatesse.
            </p>
          </div>
          <div className="relative hidden shrink-0 sm:block">
            <div
              className="rounded-full border border-[oklch(0.83_0.14_205_/_32%)] bg-[oklch(0.83_0.14_205_/_10%)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-[oklch(0.88_0.08_205)] shadow-[0_0_24px_-6px_oklch(0.83_0.14_205_/_0.5)]"
              style={{ opacity: 0.55 + clarity * 0.45 }}
            >
              Uuenev mudel
            </div>
            <svg
              viewBox="0 0 80 96"
              className="pointer-events-none absolute -right-1 top-full mt-2 h-20 w-16"
              fill="none"
              aria-hidden
              style={{ opacity: 0.12 + chaos * 0.58 }}
            >
              <path
                d="M8 4 L22 38 L18 40 L34 88 L40 86 L52 44 L48 42 L62 8"
                stroke="oklch(0.88 0.12 200)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={reducedMotion ? "" : "animate-[ep-flicker-soft_2.8s_ease-in-out_infinite]"}
              />
            </svg>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-wider text-foreground/45">
            <span>Selgus</span>
            <span className="font-mono text-[oklch(0.82_0.14_205)]">{Math.round(clarity * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[oklch(0_0_0_/_35%)] shadow-[inset_0_0_0_1px_oklch(1_0_0_/_6%)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.83_0.14_205)] via-[oklch(0.82_0.16_145)] to-[oklch(0.83_0.14_205)]"
              style={{
                width: `${Math.round(clarity * 100)}%`,
                boxShadow: "0 0 18px oklch(0.83 0.14 205 / 0.45)",
                transition: "width 0.25s ease-out",
              }}
            />
          </div>
        </div>

        <div className="mt-7 grid gap-3">
          <MiniStat label="Kuu tarbimine" value="420 kWh" dim={chaos > 0.45} />
          <MiniStat label="Säästu vahemik" value="18–43 € / kuu" dim={chaos > 0.25} />
          <MiniStat label="Soovitus" value="Lepingu + tipu vaade" dim={false} />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[oklch(1_0_0_/_10%)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-foreground/50">
            Kerimine toob stuudio fookusesse: kaos kahaneb, joon tugevneb.
          </p>
          <LinkButton
            href="/simulatsioonid"
            size="sm"
            variant="secondary"
            className="shrink-0 border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]"
          >
            Proovi kohe
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)] transition-[border-color,background-color,opacity] duration-300",
        dim
          ? "border-[oklch(0.83_0.14_205_/_12%)] bg-[oklch(0_0_0_/_18%)] opacity-75"
          : "border-[oklch(0.83_0.14_205_/_22%)] bg-[oklch(0_0_0_/_28%)]"
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-foreground/88">{value}</p>
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
    <div className={cn("ep-cinema-panel ep-story-panel-frame rounded-[1.75rem] p-6 md:p-7", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="ep-eyebrow-caps text-foreground/48">{kicker}</p>
          <p className="ep-display mt-3 text-xl font-semibold tracking-tight">{title}</p>
          {subtitle ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground/68">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-12 items-end gap-[3px] rounded-lg border border-[oklch(1_0_0_/_6%)] bg-[oklch(0_0_0_/_18%)] px-2 pb-2 pt-3">
      {values.map((v, idx) => (
        <div
          key={`${idx}-${v}`}
          className="ep-spark-bar w-1.5 min-h-[6px] rounded-full"
          style={{ height: `${Math.max(14, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function ProblemPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="Ülevaade"
      title="Miks see pea ringi käib?"
      subtitle="Hea otsus vajab seoseid — mitte killustatud Excelit, mis homme juba vale on."
      right={<Badge variant="warm">Reaalsus</Badge>}
    >
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <Sparkline values={[12, 18, 16, 22, 31, 27, 35, 29, 33, 41, 38, 44]} />
          <p className="mt-3 text-xs text-foreground/55">
            Hinnad ja tiputunnid liiguvad kiiremini kui mälu mahutab.
          </p>
        </div>
        <div className="md:col-span-3 space-y-2 text-sm text-foreground/70">
          <Bullet staggerReveal>Hinnariski tabad alles siis, kui on hilja</Bullet>
          <Bullet staggerReveal>Lepinguid ei saa võrrelda nagu õunu</Bullet>
          <Bullet staggerReveal>Investeeringu tasuvus jääb udusse</Bullet>
          <Bullet staggerReveal>Tarbimise tipud jäävad märkamata</Bullet>
        </div>
      </div>
    </PanelChrome>
  );
}

function SolutionPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="Mudel"
      title="Üks joon läbi lepingu, tarbimise ja investeeringu."
      subtitle="Sama loogika, sama keel — otsus, mida saab teisel päeval uuesti seletada."
      right={<Badge variant="cyan">Kontroll</Badge>}
    >
      <div className="space-y-3">
        <MiniStat label="Leping" value="börs või fikseeritud — päris mõju, mitte loosung" />
        <MiniStat label="Simulatsioon" value="enne ja pärast samade eeldustega" />
        <MiniStat label="Soovitus" value="põhjus laual, mitte õhk" />
      </div>
    </PanelChrome>
  );
}

function TryToolsPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="Tööriistad"
      title="Alusta sealt, kust sul täna põletab."
      subtitle="Kõik kolm annavad kohe suuna. Täisvaade lisab sügavuse, graafikud ja dokumendi, mida jagada."
      right={<Badge variant="cyan">Kohe</Badge>}
    >
      <div className="grid gap-3">
        <LinkButton href="/simulatsioonid" variant="gradient" className="w-full shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.55)]">
          Simulatsioonid
        </LinkButton>
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkButton href="/leping" variant="outline" className="w-full border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]">
            Lepingu vaade
          </LinkButton>
          <LinkButton href="/tarbimine" variant="outline" className="w-full border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]">
            Tarbimise vaade
          </LinkButton>
        </div>
      </div>
    </PanelChrome>
  );
}

function PremiumJourneyPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="Täisvaade"
      title="Esmalt näed joont — siis avad terve pildi."
      subtitle="Osaliselt nähtav, ülejäänu kutsub avama. Ühe ostuga graafikud, täiskokkuvõte ja PDF, kui oled valmis."
      right={<Badge variant="warm">Avamine</Badge>}
    >
      <div className="space-y-2 text-sm text-foreground/72">
        <Bullet staggerReveal>Osaliselt jääb näha — me ei müü musta lehte</Bullet>
        <Bullet staggerReveal>Kerge hägu, mitte tüli: täisvaade peab tunduma väärtuslik, mitte pealetükkiv</Bullet>
        <Bullet staggerReveal>Üks ost või eraldi kihid — makse ühendame turvaliselt, kui oled valmis</Bullet>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <LinkButton
          href="/pricing#avamine"
          variant="gradient"
          className="min-h-10 rounded-xl font-semibold sm:flex-1"
        >
          Vaata hindu ja avamine
        </LinkButton>
        <LinkButton href="/?unlock=demo" variant="outline" className="border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)] sm:flex-1">
          Proovi täisvaadet (demo)
        </LinkButton>
      </div>
    </PanelChrome>
  );
}

function TrustPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="Usaldus"
      title="Ausus on siin struktuuris, mitte slaidil."
      subtitle="Loogika on lahti räägitav, andmeid küsime ainult vajalikku, makse käib turvaliselt."
      right={<Badge variant="warm">Põhimõtted</Badge>}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { t: "Loogika laual", s: "Eeldused ja arvutus on jälgitavad." },
          { t: "Vähe, aga täpselt", s: "Kogume ainult seda, mis otsust kannab." },
          { t: "Turvaline makse", s: "Tuntud maksena ja selged piirid." },
        ].map((x) => (
          <div
            key={x.t}
            data-reveal-stagger=""
            className="rounded-xl border border-[oklch(1_0_0_/_8%)] bg-[oklch(0_0_0_/_20%)] px-4 py-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_5%)]"
          >
            <p className="text-xs font-semibold tracking-tight text-foreground/85">{x.t}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground/55">{x.s}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-foreground/62">
        Partnerlused ja mõõdikud kasvavad edasi; toode on mõeldud juba täna päris otsusteks, mitte ainult mänguks.
      </p>
    </PanelChrome>
  );
}

function FinalCtaPanel() {
  return (
    <PanelChrome
      className="pointer-events-auto"
      kicker="Kohe"
      title="Tee täna esimene samm."
      subtitle="Käivita simulatsioon või ava leping — kaks minutit annavad suuna. Täisvaate avad siis, kui see mõistlik tundub."
      right={<Badge variant="cyan">Jätka</Badge>}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div data-reveal-stagger="" className="sm:flex-1">
          <LinkButton
            href="/simulatsioonid"
            size="lg"
            variant="gradient"
            className="min-h-11 w-full rounded-xl px-6 text-[0.95rem] font-semibold sm:w-auto"
          >
            Käivita simulatsioon
          </LinkButton>
        </div>
        <div data-reveal-stagger="" className="sm:flex-1">
          <LinkButton
            href="/leping"
            size="lg"
            variant="outline"
            className="min-h-11 w-full rounded-xl px-6 text-[0.95rem] font-semibold sm:w-auto"
          >
            Ava lepingu labor
          </LinkButton>
        </div>
      </div>
      <p className="mt-5 text-xs text-foreground/55">
        Täisvaade jääb sinu otsuseks — enne näed, kas joon on piisavalt konkreetne.
      </p>
    </PanelChrome>
  );
}


function Bullet({ children, staggerReveal }: { children: string; staggerReveal?: boolean }) {
  return (
    <div className="flex items-start gap-2" {...(staggerReveal ? { "data-reveal-stagger": "" } : {})}>
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.45)]" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

