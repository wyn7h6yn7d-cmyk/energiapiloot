"use client";

import { LinkButton } from "@/components/ui/link-button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { useDeviceProfile } from "@/lib/motion/use-scroll-story";
import { MobileHeroFallback } from "@/components/marketing/mobile-hero-fallback";
import { HeroSceneLazy } from "@/components/marketing/hero-scene-lazy";
import { CinematicFooter } from "@/components/marketing/cinematic-footer";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

export function Landing() {
  const device = useDeviceProfile();
  const mode = device.mode;

  return (
    <div className="relative w-full">
      {!device.preferMobileFallback ? (
        <HeroSceneLazy
          progress={0}
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
          <section className="relative overflow-hidden pt-8 md:pt-10" data-section="hero">
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
              <div className="grid items-start gap-10 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-7">
                  <div className="relative max-w-2xl">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(900px_520px_at_18%_35%,oklch(0.83_0.14_205_/_12%),transparent_62%),radial-gradient(720px_480px_at_78%_65%,oklch(0.82_0.16_145_/_8%),transparent_58%)]"
                    />
                    <div className="flex flex-wrap items-center gap-2" data-reveal>
                      <Badge variant="cyan" className="border-[oklch(0.83_0.14_205_/_35%)] shadow-[0_0_20px_-6px_oklch(0.83_0.14_205_/_0.45)]">
                        Avalik test
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
                      Selge mudel aitab näha, mida “leping”, “tipp” ja “investeering” päriselt tähendavad. Kontot ei küsita.
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
                        href="/leping"
                        size="lg"
                        variant="outline"
                        className="min-h-11 rounded-xl border-[oklch(1_0_0_/_16%)] bg-[oklch(1_0_0_/_5%)] px-6 text-[0.95rem] font-semibold tracking-tight"
                      >
                        Ava lepingu labor
                      </LinkButton>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" data-reveal>
                      <Kpi label="Ilma kontota" value="Kohe" hint="Brauseris, ilma hõõrdumiseta." />
                      <Kpi label="Loogika" value="Jälgitav" hint="Eeldused ja arvutus ühes vaates." />
                      <Kpi label="Fookus" value="Otsus" hint="Mõju enne allkirja ja ostu." />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <div data-reveal>
                    {device.preferMobileFallback ? (
                      <MobileHeroFallback label={device.reducedMotion ? "Staatiline vaade" : "Lihtsustatud vaade"} />
                    ) : (
                      <div className="ep-holo-panel pointer-events-auto p-6 md:p-8">
                        <p className="ep-eyebrow-caps text-foreground/50">Kiire start</p>
                        <p className="ep-display mt-3 text-xl font-semibold tracking-tight md:text-2xl">
                          Vali tööriist ja testi.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-foreground/68">
                          Kolm teed, sama loogika: simulatsioon, leping ja tarbimine. Kihid on testimiseks nähtavad.
                        </p>
                        <div className="mt-6 grid gap-3">
                          <LinkButton href="/simulatsioonid" variant="gradient" className="w-full">
                            Simulatsioonid
                          </LinkButton>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <LinkButton href="/leping" variant="outline" className="w-full">
                              Leping
                            </LinkButton>
                            <LinkButton href="/tarbimine" variant="outline" className="w-full">
                              Tarbimine
                            </LinkButton>
                          </div>
                          <LinkButton href="/pricing" variant="ghost" className="text-foreground/55 hover:text-foreground/78">
                            Toote info →
                          </LinkButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2) WHY THIS MATTERS */}
          <section className="ep-container pb-8 pt-12 md:pb-10 md:pt-16" aria-label="Miks see oluline on">
            <div className="grid gap-8 md:grid-cols-12 md:items-start">
              <div className="md:col-span-5">
                <p className="ep-eyebrow-caps text-foreground/50">Miks see loeb</p>
                <h2 className="ep-display mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
                  Energiaotsus on tavaliselt udune — kuni arve teeb selle valusaks.
                </h2>
              </div>
              <div className="md:col-span-7">
                <div className="ep-cinema-card p-6 md:p-7">
                  <p className="text-sm leading-relaxed text-foreground/72">
                    Energiapiloot tõmbab lepingu, tarbimise ja investeeringu üheks loogikaks. Sa näed mõju enne kui
                    kirjutad alla — ja saad otsust hiljem sama keele ja eeldustega uuesti kontrollida.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <MiniPoint t="Vähem müra" s="Fookus kõige olulisemale." />
                    <MiniPoint t="Selged eeldused" s="Tead, mis on “sees”." />
                    <MiniPoint t="Võrdlus ühes mudelis" s="Õunad õuntega." />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3) CORE TOOLS PREVIEW */}
          <section className="ep-container pb-10 pt-4 md:pb-14" aria-label="Põhitööriistad">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="ep-eyebrow-caps text-foreground/50">Tööriistad</p>
                <h2 className="ep-display mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
                  Alusta sealt, mis täna põletab.
                </h2>
              </div>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <ToolCard
                title="Simulatsioonid"
                body="Rahavoog, tundlikkus ja eeldused — et investeering ei oleks õnnemäng."
                href="/simulatsioonid"
              />
              <ToolCard
                title="Lepingu labor"
                body="Börs, fikseeritud ja hübriid kõrvuti sama tarbimisprofiiliga."
                href="/leping"
              />
              <ToolCard
                title="Tarbimise labor"
                body="Muster, tipud ja baas-koormus — kiiresti arusaadavaks."
                href="/tarbimine"
              />
            </div>
          </section>

          {/* 4) LIVE / INTERACTIVE OVERVIEW */}
          <section className="ep-container pb-10 pt-4 md:pb-14" aria-label="Interaktiivne ülevaade">
            <div className="grid gap-8 md:grid-cols-12 md:items-start">
              <div className="md:col-span-5">
                <p className="ep-eyebrow-caps text-foreground/50">Interaktiivne ülevaade</p>
                <h2 className="ep-display mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
                  Väike mudel. Päris reaktsioon.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-foreground/68">
                  Muuda tarbimist või lepingutingimust ja vaata kohe, kuidas suund ja risk nihkuvad. Sama loogika elab
                  tööriistades tervikuna — siin on see lihtsalt kompaktse preview’na.
                </p>
              </div>
              <div className="md:col-span-7">
                <LiveOverviewPanel />
              </div>
            </div>
          </section>

          {/* 5) TRUST / RELIABILITY */}
          <section className="ep-container pb-10 pt-4 md:pb-14" aria-label="Usaldus ja töökindlus">
            <div className="grid gap-4 md:grid-cols-12 md:items-start">
              <div className="md:col-span-5">
                <p className="ep-eyebrow-caps text-foreground/50">Usaldus</p>
                <h2 className="ep-display mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
                  Tööriist, mitte loosung.
                </h2>
              </div>
              <div className="md:col-span-7">
                <div className="grid gap-4 sm:grid-cols-3">
                  <TrustCard title="Jälgitav loogika" body="Eeldused ja põhjendus on nähtavad, mitte peidus." />
                  <TrustCard title="Serveri adapterid" body="Välised teenused on kapseldatud (timeout + retry)." />
                  <TrustCard title="Puhas UX" body="Üks voog: sisendid → mõju → otsus." />
                </div>
              </div>
            </div>
          </section>

          {/* 6) FINAL CTA */}
          <section className="ep-container pb-8 pt-4 md:pb-12" aria-label="Järgmine samm">
            <div className="ep-cinema-panel relative overflow-hidden rounded-[1.75rem] p-8 md:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[oklch(0.83_0.14_205_/_0.16)] blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.45)] to-transparent"
              />
              <p className="ep-eyebrow-caps text-foreground/50">Järgmine samm</p>
              <h2 className="ep-display mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
                Tee esimene test nüüd.
              </h2>
              <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-foreground/68">
                Alusta simulatsioonist või ava üks labor. Saad kohe signaali, kas suund ja eeldused tunduvad õiged.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/simulatsioonid" size="lg" variant="gradient" className="min-h-11 rounded-xl px-6 font-semibold">
                  Käivita simulatsioon
                </LinkButton>
                <LinkButton href="/tarbimine" size="lg" variant="outline" className="min-h-11 rounded-xl px-6 font-semibold">
                  Ava tarbimise labor
                </LinkButton>
              </div>
            </div>
          </section>

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

function MiniPoint({ t, s }: { t: string; s: string }) {
  return (
    <div className="rounded-xl border border-[oklch(1_0_0_/_8%)] bg-[oklch(0_0_0_/_18%)] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_5%)]">
      <p className="text-xs font-semibold tracking-tight text-foreground/88">{t}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-foreground/58">{s}</p>
    </div>
  );
}

function ToolCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <div className="ep-cinema-card p-6">
      <p className="ep-display text-base font-semibold tracking-tight text-foreground/92">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/62">{body}</p>
      <div className="mt-5">
        <LinkButton href={href} variant="outline" size="sm">
          Ava
        </LinkButton>
      </div>
    </div>
  );
}

function TrustCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="ep-cinema-card p-6">
      <p className="text-sm font-semibold tracking-tight text-foreground/90">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65">{body}</p>
    </div>
  );
}

function fmtEur(n: number) {
  return `${Math.round(n).toLocaleString("et-EE")} €`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmtPct(n: number) {
  return `${Math.round(n)}%`;
}

function fmtCentsPerKwh(n: number) {
  return `${n.toFixed(1)} s/kWh`;
}

function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const w = 240;
  const h = 72;
  const pad = 6;
  const v = values.length ? values : [0, 1, 0.6, 1.2, 0.8];
  const min = Math.min(...v);
  const max = Math.max(...v);
  const span = Math.max(1e-6, max - min);

  const pts = v.map((val, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, v.length - 1);
    const y = pad + ((max - val) / span) * (h - pad * 2);
    return { x, y };
  });

  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const fillD = `${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={cn("h-[72px] w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="epSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.83 0.14 205 / 26%)" />
          <stop offset="100%" stopColor="oklch(0.83 0.14 205 / 0%)" />
        </linearGradient>
        <linearGradient id="epSparkLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.83 0.14 205 / 92%)" />
          <stop offset="70%" stopColor="oklch(0.82 0.16 145 / 72%)" />
          <stop offset="100%" stopColor="oklch(0.83 0.14 205 / 78%)" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#epSparkFill)" />
      <path d={d} fill="none" stroke="url(#epSparkLine)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LiveOverviewPanel() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<"consumption" | "contract">("consumption");

  const [priceEurPerMwh, setPriceEurPerMwh] = useState(120);
  const [monthlyKwh, setMonthlyKwh] = useState(420);
  const [shiftPct, setShiftPct] = useState(14);

  const [fixedCentsPerKwh, setFixedCentsPerKwh] = useState(16.9);
  const [retailerMarginCents, setRetailerMarginCents] = useState(1.2);

  const [feed, setFeed] = useState<{
    ok: boolean;
    date?: string;
    avgEurPerMwh?: number | null;
    minEurPerMwh?: number | null;
    maxEurPerMwh?: number | null;
    points?: Array<{ ts: string; value: number }>;
    sourceLabel: string;
    updatedLabel: string;
  }>({
    ok: false,
    sourceLabel: "Demo (simuleeritud)",
    updatedLabel: "kohe",
  });

  const [demoTick, setDemoTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/day-ahead", { method: "GET" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | null
          | {
              ok?: boolean;
              date?: string;
              avgEurPerMwh?: number | null;
              minEurPerMwh?: number | null;
              maxEurPerMwh?: number | null;
              points?: Array<{ ts: string; value: number }>;
              source?: string;
            };
        if (cancelled) return;
        if (!data || data.ok !== true) return;

        const avg = typeof data.avgEurPerMwh === "number" ? data.avgEurPerMwh : null;
        const min = typeof data.minEurPerMwh === "number" ? data.minEurPerMwh : null;
        const max = typeof data.maxEurPerMwh === "number" ? data.maxEurPerMwh : null;
        const points = Array.isArray(data.points) ? data.points.filter((p) => p && typeof p.value === "number") : [];

        setFeed({
          ok: true,
          date: typeof data.date === "string" ? data.date : undefined,
          avgEurPerMwh: avg,
          minEurPerMwh: min,
          maxEurPerMwh: max,
          points,
          sourceLabel: "Elering NPS (börsihind)",
          updatedLabel: "täna",
        });

        if (typeof avg === "number" && Number.isFinite(avg)) {
          setPriceEurPerMwh((p) => clamp(Math.round(avg / 5) * 5, 40, 280) || p);
        }
      })
      .catch(() => {
        /* demo fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        setDemoTick((t) => t + 1);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sparkValues = useMemo(() => {
    if (feed.ok && feed.points && feed.points.length >= 12) {
      // Normalize to keep sparkline stable and readable.
      const slice = feed.points.slice(0, 24);
      const vals = slice.map((p) => p.value);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const span = Math.max(1e-6, max - min);
      return vals.map((v) => (v - min) / span);
    }

    const base = clamp(priceEurPerMwh, 40, 280);
    const amp = clamp(22 + (base / 280) * 26, 18, 44);
    const seed = (demoTick % 7) + 1;
    return Array.from({ length: 24 }, (_, i) => {
      const x = (i + seed) / 24;
      const y = 0.5 + Math.sin(x * Math.PI * 2) * 0.22 + Math.sin(x * Math.PI * 6) * 0.08;
      // tie volatility to price
      const v = (y * amp + base * 0.02) / (amp + base * 0.02);
      return clamp(v, 0.06, 0.98);
    });
  }, [demoTick, feed.ok, feed.points, priceEurPerMwh]);

  const model = useMemo(() => {
    const eurPerKwh = priceEurPerMwh / 1000;
    const baseMonthly = monthlyKwh * eurPerKwh;
    const shiftedKwh = (monthlyKwh * shiftPct) / 100;
    const min = typeof feed.minEurPerMwh === "number" ? feed.minEurPerMwh : priceEurPerMwh * 0.72;
    const max = typeof feed.maxEurPerMwh === "number" ? feed.maxEurPerMwh : priceEurPerMwh * 1.28;
    const spread = Math.max(0, max - min);
    // Heuristic: shifting moves energy from expensive to cheap hours.
    const savedPerKwh = (spread / 1000) * 0.65;
    const saved = clamp(shiftedKwh * savedPerKwh, 0, baseMonthly * 0.45);
    const volatility = clamp(spread / Math.max(1, priceEurPerMwh), 0, 0.9);

    const nextAction =
      monthlyKwh >= 650 ? "Ava tarbimise labor (tipud + baas-koormus)" : "Kontrolli lepingut (fikseeritud vs börs)";

    const insight =
      volatility >= 0.22 && shiftPct < 10
        ? "Hind kõigub — isegi väike ajastus võib anda reaalse võidu."
        : shiftPct >= 20
          ? "Hea: nihutad juba märgatava osa tarbimisest odavamasse aknasse."
          : "Tüüpiline muster: sääst tekib siis, kui tippude osa väheneb.";

    return {
      eurPerKwh,
      baseMonthly,
      saved,
      newMonthly: Math.max(0, baseMonthly - saved),
      volatility,
      insight,
      nextAction,
    };
  }, [feed.maxEurPerMwh, feed.minEurPerMwh, monthlyKwh, priceEurPerMwh, shiftPct]);

  const contractModel = useMemo(() => {
    const spotCents = (priceEurPerMwh / 10) + retailerMarginCents; // €/MWh -> s/kWh
    const delta = fixedCentsPerKwh - spotCents;
    const verdict = delta <= 0 ? "Fikseeritud tundub hetkel odavam" : "Börs + marginaal tundub hetkel odavam";
    const hint =
      Math.abs(delta) < 0.8
        ? "Vahe on väike — otsusta riskitaluvuse järgi ja vaata profiili tippe."
        : delta <= 0
          ? "Kui su fikseeritud hind on alla spot-keskmise, on see tugev kaitse volatiilsuse vastu."
          : "Kui spot-keskmine on madal, tasub vaadata, kas tipud on ajastatavad või kas hübriid sobib.";

    const nextBestHref = delta <= 0 ? "/leping" : "/tarbimine";
    const nextBestLabel = delta <= 0 ? "Ava lepingu labor" : "Ava tarbimise labor";

    return {
      spotCents,
      delta,
      verdict,
      hint,
      nextBestHref,
      nextBestLabel,
    };
  }, [fixedCentsPerKwh, priceEurPerMwh, retailerMarginCents]);

  return (
    <div ref={rootRef} className="ep-holo-panel p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="ep-eyebrow-caps text-foreground/50">Elav ülevaade</p>
            <Badge
              variant="neutral"
              className="border-[oklch(1_0_0_/_12%)] bg-[oklch(1_0_0_/_4%)] text-foreground/70"
            >
              {feed.sourceLabel} • {feed.updatedLabel}
            </Badge>
          </div>
          <p className="ep-display mt-3 text-xl font-semibold tracking-tight md:text-2xl">
            Sisend → mõju → järgmine samm
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/68">
            Muuda tarbimist või lepingutingimust ja vaata kohe, kuhu suund liigub. See on sama loogika, mis tööriistades —
            lihtsalt kompaktsemalt.
          </p>
        </div>
        <div className="w-full max-w-[20rem]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Börsihind (€/MWh)</p>
            <p className="font-mono text-lg font-semibold text-[oklch(0.88_0.08_205)]">{priceEurPerMwh}</p>
          </div>
          <div className="mt-2 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_18%)] p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
            <Sparkline values={sparkValues} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("consumption")}
          className={cn(
            "rounded-xl border px-3 py-2 text-xs font-semibold tracking-tight transition",
            tab === "consumption"
              ? "border-[oklch(0.83_0.14_205_/_40%)] bg-[oklch(0.83_0.14_205_/_10%)] text-foreground"
              : "border-[oklch(1_0_0_/_12%)] bg-[oklch(1_0_0_/_4%)] text-foreground/70 hover:text-foreground"
          )}
        >
          Tarbimine
        </button>
        <button
          type="button"
          onClick={() => setTab("contract")}
          className={cn(
            "rounded-xl border px-3 py-2 text-xs font-semibold tracking-tight transition",
            tab === "contract"
              ? "border-[oklch(0.82_0.16_145_/_38%)] bg-[oklch(0.82_0.16_145_/_10%)] text-foreground"
              : "border-[oklch(1_0_0_/_12%)] bg-[oklch(1_0_0_/_4%)] text-foreground/70 hover:text-foreground"
          )}
        >
          Leping
        </button>
      </div>

      {tab === "consumption" ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatChip label="Kuukulu (hinnang)" value={fmtEur(model.newMonthly)} hint={`~${fmtEur(model.baseMonthly)} enne`} />
            <StatChip label="Säästu suund" value={model.saved > 1 ? `−${fmtEur(model.saved)}` : "Neutraalne"} hint={`${shiftPct}% ajastust`} />
            <StatChip label="Hind (kWh)" value={`${model.eurPerKwh.toFixed(3)} €/kWh`} hint={`${monthlyKwh} kWh/kuu`} />
          </div>

          <div className="mt-7 grid gap-4">
            <SliderRow
              label="Börsihind (€/MWh)"
              value={priceEurPerMwh}
              min={40}
              max={280}
              step={5}
              onChange={setPriceEurPerMwh}
            />
            <SliderRow
              label="Kuu tarbimine (kWh)"
              value={monthlyKwh}
              min={120}
              max={1400}
              step={20}
              onChange={setMonthlyKwh}
            />
            <SliderRow
              label="Ajastatav osa (%)"
              value={shiftPct}
              min={0}
              max={40}
              step={1}
              onChange={setShiftPct}
            />
          </div>

          <div className="mt-7 grid gap-3 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_18%)] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-tight text-foreground/88">Insight</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/68">{model.insight}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Volatiilsus</p>
                <p className="mt-2 font-mono text-sm text-foreground/80">{fmtPct(model.volatility * 100)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-foreground/50">Järgmine parim samm: {model.nextAction}</p>
              <LinkButton
                href={monthlyKwh >= 650 ? "/tarbimine" : "/leping"}
                size="sm"
                variant="secondary"
                className="shrink-0 border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]"
              >
                {monthlyKwh >= 650 ? "Ava tarbimise labor" : "Ava lepingu labor"}
              </LinkButton>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatChip label="Spot + marginaal" value={fmtCentsPerKwh(contractModel.spotCents)} hint={`~${priceEurPerMwh} €/MWh + ${retailerMarginCents.toFixed(1)} s`} />
            <StatChip label="Fikseeritud" value={fmtCentsPerKwh(fixedCentsPerKwh)} hint="Sinu lepinguhind" />
            <StatChip label="Vahe" value={`${contractModel.delta <= 0 ? "−" : "+"}${fmtCentsPerKwh(Math.abs(contractModel.delta))}`} hint={contractModel.verdict} />
          </div>

          <div className="mt-7 grid gap-4">
            <SliderRow
              label="Fikseeritud hind (s/kWh)"
              value={Number(fixedCentsPerKwh.toFixed(1))}
              min={9.5}
              max={29.9}
              step={0.1}
              onChange={(v) => setFixedCentsPerKwh(v)}
            />
            <SliderRow
              label="Müüja marginaal (s/kWh)"
              value={Number(retailerMarginCents.toFixed(1))}
              min={0.0}
              max={3.5}
              step={0.1}
              onChange={(v) => setRetailerMarginCents(v)}
            />
          </div>

          <div className="mt-7 grid gap-3 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_18%)] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
            <p className="text-sm font-semibold tracking-tight text-foreground/88">{contractModel.verdict}</p>
            <p className="text-sm leading-relaxed text-foreground/68">{contractModel.hint}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-foreground/50">
                Järgmine parim samm: vaata kas su tarbimise tipud suurendavad “halba tundi” või kas leping kaitseb piisavalt.
              </p>
              <LinkButton
                href={contractModel.nextBestHref}
                size="sm"
                variant="secondary"
                className="shrink-0 border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]"
              >
                {contractModel.nextBestLabel}
              </LinkButton>
            </div>
          </div>
        </>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[oklch(1_0_0_/_10%)] pt-5">
        <p className="text-xs leading-relaxed text-foreground/50">
          {feed.ok ? (
            <>
              Allikas: <span className="text-foreground/70">Elering Dashboard (NPS)</span>. See paneel näitab põhimõtet —
              tööriistades seod tulemuse oma profiiliga.
            </>
          ) : (
            <>
              Demo-vaade: loogika ja reaktsioon on päris, hinnamuster on simuleeritud. Kui live-feed on saadaval, ilmub
              see siia automaatselt.
            </>
          )}
        </p>
        <LinkButton href="/tarbimine" size="sm" variant="ghost" className="text-foreground/55 hover:text-foreground/78">
          Ava detailne vaade →
        </LinkButton>
      </div>
    </div>
  );
}

function StatChip({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="ep-sim-stat-chip p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">{label}</p>
      <p className="mt-2 font-mono text-xl font-semibold text-foreground/92">{value}</p>
      <p className="mt-2 text-xs text-foreground/55">{hint}</p>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_18%)] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-foreground/65">{label}</p>
        <p className="font-mono text-xs text-foreground/70">{value}</p>
      </div>
      <input
        className={cn("mt-3 w-full accent-[oklch(0.83_0.14_205)]")}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

