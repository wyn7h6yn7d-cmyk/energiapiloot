"use client";

import { LinkButton } from "@/components/ui/link-button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { useDeviceProfile, useScrollStory } from "@/lib/motion/use-scroll-story";
import { MobileHeroFallback } from "@/components/marketing/mobile-hero-fallback";
import { HeroSceneLazy } from "@/components/marketing/hero-scene-lazy";
import { CinematicFooter } from "@/components/marketing/cinematic-footer";
import { cn } from "@/lib/utils";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export function Landing() {
  const device = useDeviceProfile();
  const mode = device.mode;
  const heroArcGlowId = useId().replace(/:/g, "");
  const storyRef = useRef<HTMLDivElement>(null);
  const { progress: storyProgress } = useScrollStory({
    container: storyRef,
    sectionCount: 6,
    mode,
  });

  return (
    <div ref={storyRef} className="relative w-full">
      {!device.preferMobileFallback ? (
        <HeroSceneLazy
          progress={storyProgress}
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
          <section
            className="relative flex min-h-[min(88svh,880px)] flex-col justify-center overflow-hidden pb-14 pt-8 md:min-h-[min(92svh,960px)] md:pb-20 md:pt-10"
            data-section="hero"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-[min(92%,640px)] bg-gradient-to-r from-[oklch(0.06_0.02_255_/_0.94)] via-[oklch(0.07_0.02_255_/_0.55)] to-transparent md:block"
            />
            <div aria-hidden className="ep-hero-field hidden md:block" />
            <div
              aria-hidden
              className="pointer-events-none absolute right-[6%] top-[14%] hidden h-[min(56vh,460px)] w-[min(44vw,400px)] opacity-[0.42] md:block"
            >
              <svg viewBox="0 0 400 400" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id={heroArcGlowId} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur stdDeviation="2.2" result="blur" />
                    <feColorMatrix
                      in="blur"
                      type="matrix"
                      values="1 0 0 0 0 0 1 0 0 0  0 0 1 0 0  0 0 0 1.150"
                      result="glow"
                    />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="200" cy="200" r="122" stroke="oklch(0.83 0.14 205 / 9%)" strokeWidth="1" />
                <circle cx="200" cy="200" r="90" stroke="oklch(0.82 0.16 145 / 8%)" strokeWidth="1" />
                <path
                  d="M28 232 Q 120 64 198 128 Q 276 192 372 162"
                  stroke="oklch(0.83 0.14 205 / 72%)"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  filter={`url(#${heroArcGlowId})`}
                />
                <path
                  d="M44 272 Q 164 108 264 228 Q 314 288 352 142"
                  stroke="oklch(0.82 0.16 145 / 52%)"
                  strokeWidth="1.05"
                  strokeLinecap="round"
                  filter={`url(#${heroArcGlowId})`}
                />
                <path
                  d="M210 48 L 198 118 L 248 124 L 186 198 L 228 202 L 168 288"
                  stroke="oklch(0.88 0.1 205 / 38%)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${heroArcGlowId})`}
                />
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
                      className="ep-display mt-5 text-balance text-[2.45rem] font-semibold leading-[1.03] tracking-tight sm:text-5xl md:mt-6 md:text-[3.45rem] md:leading-[1.01]"
                      data-reveal
                    >
                      <span className="ep-text-gradient">Energia, mis joonistub selgeks.</span>{" "}
                      <span className="text-foreground">Otsus, mille saad sõnades hoida.</span>
                    </h1>
                    <p className="mt-3 max-w-xl text-balance text-lg font-medium leading-snug text-foreground/78 md:text-xl" data-reveal>
                      Elekter, tarbimine ja investeering ühes vaates — nii kodus kui väikses ettevõttes.
                    </p>
                    <p
                      className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/68 md:text-[1.05rem]"
                      data-reveal
                    >
                      Selge mudel, mis seob lepingu, tarbimise ja investeeringu üheks otsuseks — ilma kontota.
                    </p>

                    <div className="pointer-events-auto mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" data-reveal>
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

                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" data-reveal>
                      <Kpi label="Ilma kontota" value="Kohe" hint="Brauseris, ilma hõõrdumiseta." />
                      <Kpi label="Jälgitav" value="Loogika" hint="Eeldused ja arvutus ühes vaates." />
                      <Kpi label="Tulemus" value="Otsus" hint="Selge suund, mitte müra." />
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
                          Simulatsioon, leping ja tarbimine kasutavad sama mudelit. Kõik kihid on testimiseks avatud.
                        </p>
                        <div className="mt-5 grid gap-3">
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="ep-container py-2">
            <div className="ep-narrative-divider" aria-hidden />
          </div>

          {/* 2) WHY THIS MATTERS */}
          <section className="ep-container pb-12 pt-10 md:pb-16 md:pt-14" aria-label="Miks Energiapiloot olemas on">
            <div className="grid gap-6 md:grid-cols-12 md:items-start">
              <div className="md:col-span-5">
                <p className="ep-eyebrow-caps text-foreground/50">Miks</p>
                <h2 className="ep-display mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
                  Et energiaotsus oleks põhjendatav, mitte kõhutunne.
                </h2>
              </div>
              <div className="md:col-span-7">
                <p className="text-sm leading-relaxed text-foreground/72">
                  Energiapiloot seob lepingu, tarbimise ja investeeringu üheks loogikaks. Sa näed mõju enne allkirja — ja
                  saad sama eeldustega otsuse hiljem uuesti kontrollida.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniPoint t="Üks mudel" s="Võrdled õunu õuntega." />
                  <MiniPoint t="Selged eeldused" s="Tead, mis on “sees”." />
                  <MiniPoint t="Kiire signaal" s="Mõju muutub kohe." />
                </div>
              </div>
            </div>
          </section>

          <div className="ep-container py-2">
            <div className="ep-narrative-divider opacity-80" aria-hidden />
          </div>

          {/* 3) CORE TOOLS PREVIEW */}
          <section className="ep-container pb-12 pt-10 md:pb-16 md:pt-12" aria-label="Põhitööriistad">
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

          <div className="ep-container py-2">
            <div className="ep-narrative-divider opacity-75" aria-hidden />
          </div>

          {/* 4) LIVE / INTERACTIVE OVERVIEW */}
          <section className="ep-container pb-12 pt-10 md:pb-16 md:pt-12" aria-label="Interaktiivne ülevaade">
            <div className="grid gap-8 md:grid-cols-12 md:items-start">
              <div className="md:col-span-5">
                <p className="ep-eyebrow-caps text-foreground/50">Interaktiivne ülevaade</p>
                <h2 className="ep-display mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
                  Väike mudel. Päris reaktsioon.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-foreground/68">
                  Liugurid muudavad arvutust kohe: näed kuu hinnangut, säästu suunda, riskisignaali ja järgmise sammu. Tööriistades
                  ühendad sama loogika oma profiiliga.
                </p>
              </div>
              <div className="md:col-span-7">
                <LiveOverviewPanel />
              </div>
            </div>
          </section>

          <div className="ep-container py-2">
            <div className="ep-narrative-divider opacity-70" aria-hidden />
          </div>

          {/* 5) TRUST / RELIABILITY */}
          <section className="ep-container pb-12 pt-10 md:pb-16 md:pt-12" aria-label="Usaldus ja töökindlus">
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
          <section className="ep-container pb-10 pt-8 md:pb-16 md:pt-12" aria-label="Järgmine samm">
            <div className="ep-cinema-panel relative overflow-hidden rounded-[1.75rem] p-8 md:p-10 md:p-12">
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
                Ava üks tööriist ja tee 1–2 muudatust. Kui signaal on loogiline, on mudel “päris”.
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
    <div className="rounded-xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_22%)] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%),0_12px_40px_-28px_oklch(0_0_0_/_65%)]">
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

function fmtEurCompact(n: number) {
  return `${n.toLocaleString("et-EE", { maximumFractionDigits: 1, minimumFractionDigits: n % 1 !== 0 ? 1 : 0 })} €`;
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
  gradientId,
}: {
  values: number[];
  className?: string;
  /** Unique prefix so multiple SVG defs never clash */
  gradientId: string;
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
  const gf = `${gradientId}-fill`;
  const gl = `${gradientId}-line`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={cn("h-[72px] w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gf} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.83 0.14 205 / 26%)" />
          <stop offset="100%" stopColor="oklch(0.83 0.14 205 / 0%)" />
        </linearGradient>
        <linearGradient id={gl} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.83 0.14 205 / 92%)" />
          <stop offset="70%" stopColor="oklch(0.82 0.16 145 / 72%)" />
          <stop offset="100%" stopColor="oklch(0.83 0.14 205 / 78%)" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gf})`} />
      <path d={d} fill="none" stroke={`url(#${gl})`} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Osakaal teoreetilisest min–max vahest, mida ajastatav tarbimine reaalselt tabab (kompaktne demo-mudel). */
const SHIFT_SPREAD_CAPTURE = 0.55;

function LiveOverviewPanel() {
  const sparkGradId = useId().replace(/:/g, "");
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
    sourceLabel: "Interaktiivne eelvaade",
    updatedLabel: "demo kontekst",
  });

  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setFeedLoading(true);
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
          sourceLabel: "Päeva börs (NPS)",
          updatedLabel: typeof data.date === "string" ? data.date : "täna",
        });

        if (typeof avg === "number" && Number.isFinite(avg)) {
          setPriceEurPerMwh((p) => clamp(Math.round(avg / 5) * 5, 40, 280) || p);
        }
      })
      .catch(() => {
        /* demo fallback */
      })
      .finally(() => {
        if (!cancelled) setFeedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Päeva min/max: live või sama viitehinnaga kooskõlas olev illustratiivne vahemik. */
  const dayContext = useMemo(() => {
    const ref = clamp(priceEurPerMwh, 40, 280);
    const live =
      feed.ok &&
      typeof feed.minEurPerMwh === "number" &&
      typeof feed.maxEurPerMwh === "number" &&
      feed.maxEurPerMwh > feed.minEurPerMwh;

    if (live) {
      const mn = feed.minEurPerMwh!;
      const mx = feed.maxEurPerMwh!;
      return {
        isLive: true,
        minMwh: mn,
        maxMwh: mx,
        spreadMwh: mx - mn,
        avgMwh: typeof feed.avgEurPerMwh === "number" ? feed.avgEurPerMwh : (mn + mx) / 2,
      };
    }

    const spreadIllustrative = clamp(ref * 0.34, 14, 92);
    const minMwh = ref - spreadIllustrative * 0.48;
    const maxMwh = ref + spreadIllustrative * 0.52;
    return {
      isLive: false,
      minMwh,
      maxMwh,
      spreadMwh: Math.max(0, maxMwh - minMwh),
      avgMwh: ref,
    };
  }, [feed.avgEurPerMwh, feed.maxEurPerMwh, feed.minEurPerMwh, feed.ok, priceEurPerMwh]);

  const sparkValues = useMemo(() => {
    if (feed.ok && feed.points && feed.points.length >= 12) {
      const slice = feed.points.slice(0, 24);
      const vals = slice.map((p) => p.value);
      const lo = Math.min(...vals);
      const hi = Math.max(...vals);
      const span = Math.max(1e-6, hi - lo);
      return vals.map((v) => (v - lo) / span);
    }

    const lo = dayContext.minMwh;
    const hi = dayContext.maxMwh;
    const mid = (lo + hi) / 2;
    return Array.from({ length: 24 }, (_, i) => {
      const u = i / 23;
      const wave =
        Math.sin(u * Math.PI * 2) * (hi - lo) * 0.12 +
        Math.sin(u * Math.PI * 5 + 0.7) * (hi - lo) * 0.05;
      const v = mid + (u - 0.5) * (hi - lo) * 0.55 + wave;
      const nv = (v - lo) / Math.max(1e-6, hi - lo);
      return clamp(nv, 0.04, 0.96);
    });
  }, [dayContext.maxMwh, dayContext.minMwh, feed.ok, feed.points]);

  const consumption = useMemo(() => {
    const refMwh = clamp(priceEurPerMwh, 40, 280);
    const eurPerKwhRef = refMwh / 1000;
    const baseMonthlyEur = monthlyKwh * eurPerKwhRef;
    const shiftedKwh = (monthlyKwh * shiftPct) / 100;

    const spreadMwh = Math.max(0, dayContext.spreadMwh);
    const eurPerKwhRecoverable = (spreadMwh / 1000) * SHIFT_SPREAD_CAPTURE;
    const savingsEurRaw = shiftedKwh * eurPerKwhRecoverable;
    const savingsEur = clamp(savingsEurRaw, 0, baseMonthlyEur * 0.4);
    const afterMonthlyEur = Math.max(0, baseMonthlyEur - savingsEur);

    const relativeVolatility = clamp(spreadMwh / Math.max(45, refMwh), 0, 1.15);
    const riskLabel =
      relativeVolatility < 0.2 ? "Madal" : relativeVolatility < 0.34 ? "Keskmine" : "Kõrge";

    const theoreticalMaxSavings = clamp(shiftedKwh * (spreadMwh / 1000), 0, baseMonthlyEur * 0.45);

    let nextHref = "/tarbimine";
    let nextLabel = "Ava tarbimise labor";
    let nextAction = "";

    if (shiftPct < 1) {
      nextAction =
        spreadMwh > 18
          ? "Lisa ajastatav tarbimine — päeva vahe võimaldab säästu, kui osa koormusest on nihutatav."
          : "Päeva hinnavahe on väike — keskendu lepingu ja baashinna võrdlusele.";
      nextHref = shiftPct < 1 && spreadMwh > 18 ? "/tarbimine" : "/leping";
      nextLabel = nextHref === "/tarbimine" ? "Ava tarbimise labor" : "Ava lepingu labor";
    } else if (relativeVolatility >= 0.34 && monthlyKwh >= 520) {
      nextAction = "Kõrge kõikuvus + suurem voog: mõõda tippe ja vaata, kas leping pakub piisavat katet.";
      nextHref = "/leping";
      nextLabel = "Ava lepingu labor";
    } else if (savingsEur < 3 && spreadMwh < 22) {
      nextAction = "Sääst jääb tagasihoidlikuks — vahe tundide vahel on väike. Võrdle fikseeritud ja börsi rahu eest.";
      nextHref = "/leping";
      nextLabel = "Ava lepingu labor";
    } else if (monthlyKwh >= 650) {
      nextAction = "Suurema tarbimisega on profiil kriitiline: täpsusta tippe ja baas-koormust tarbimise laboris.";
      nextHref = "/tarbimine";
      nextLabel = "Ava tarbimise labor";
    } else {
      nextAction = "Lihvi ajastust või võrdle lepingut — mõlemad mõjutavad sama kuu kokkuvõtet.";
      nextHref = "/simulatsioonid";
      nextLabel = "Ava simulatsioon";
    }

    const whyChanged = `Viite hind ${refMwh} €/MWh → ${monthlyKwh} kWh/kuu annab baaskulu ${fmtEurCompact(baseMonthlyEur)}. Ajastatav ${shiftPct}% (${fmtEurCompact(
      shiftedKwh * eurPerKwhRef
    )} baasjaotuses) võib päeva vahemikus (Δ ${Math.round(spreadMwh)} €/MWh) tuua kuni ~${fmtEurCompact(
      theoreticalMaxSavings
    )} teoreetilist võitu; eelvaates kasutame ${Math.round(SHIFT_SPREAD_CAPTURE * 100)}% tabavust → ${fmtEurCompact(savingsEur)}.`;

    return {
      refMwh,
      eurPerKwhRef,
      baseMonthlyEur,
      shiftedKwh,
      spreadMwh,
      savingsEur,
      afterMonthlyEur,
      relativeVolatility,
      riskLabel,
      nextAction,
      nextHref,
      nextLabel,
      whyChanged,
      savingsDirectionLabel:
        savingsEur < 0.5 ? "Neutraalne (null või väga väike)" : `Allapoole (~−${fmtEurCompact(savingsEur)} / kuu)`,
    };
  }, [dayContext.spreadMwh, monthlyKwh, priceEurPerMwh, shiftPct]);

  const contract = useMemo(() => {
    const spotCents = priceEurPerMwh / 10 + retailerMarginCents;
    const deltaCpk = fixedCentsPerKwh - spotCents;
    const spotMonthlyEur = (monthlyKwh * spotCents) / 100;
    const fixedMonthlyEur = (monthlyKwh * fixedCentsPerKwh) / 100;
    const monthlyDeltaEur = fixedMonthlyEur - spotMonthlyEur;

    const verdict =
      Math.abs(deltaCpk) < 0.55
        ? "Ühekuune vahe on väike — otsus on rohkem riski ja mugavuse küsimus."
        : deltaCpk <= 0
          ? "Fikseeritud ühikhind on spot+marginaalist madalam või sama joonel."
          : "Spot + marginaal on fikseeritud ühikuhinnast soodsam selle viite juures.";

    const hint =
      Math.abs(monthlyDeltaEur) < 4
        ? "Kuine vahe jääb mõne euro kanti — vaata profiili tippe ja lepingu “põranda” taset."
        : monthlyDeltaEur > 0
          ? "Kuine mudel eelistab börsi + marginaali: fikseeritud maksab rohkem sama kulu juures."
          : "Kuine mudel eelistab fikseeritud hinda: see annab stabiilsema ühiku kui spot+margin sel viitel.";

    const nextBestHref = monthlyDeltaEur > 2 ? "/leping" : monthlyDeltaEur < -2 ? "/tarbimine" : "/leping";
    const nextBestLabel = monthlyDeltaEur > 2 ? "Süvenda lepingut" : monthlyDeltaEur < -2 ? "Süvenda tarbimist" : "Võrdle lepingut";

    const nextActionDetail =
      monthlyDeltaEur > 2
        ? "Kuine võrdlus: fikseeritud tuleb kallimaks. Järgmine samm on lepingu labor — vaata, kas stabiilsus õigustab hinda."
        : monthlyDeltaEur < -2
          ? "Kuine võrdlus: spot + marginaal on soodsam. Järgmine samm on tarbimise labor — tipud otsustavad, kas see jääb kehtima."
          : "Kuine vahe on väike — täpne otsus sõltub profiilist ja lepingu lisatingimustest.";

    const whyChanged = `Spot efektiivne ${spotCents.toFixed(1)} s/kWh = (${priceEurPerMwh} \u20AC/MWh / 10) + ${retailerMarginCents.toFixed(
      1
    )} s/kWh marginaal; fikseeritud ${fixedCentsPerKwh.toFixed(1)} s/kWh, vahe ${deltaCpk >= 0 ? "+" : "−"}${Math.abs(deltaCpk).toFixed(
      1
    )} s/kWh. Kuu ${monthlyKwh} kWh pealt: spot ~${fmtEurCompact(spotMonthlyEur)}, fikseeritud ~${fmtEurCompact(fixedMonthlyEur)}.`;

    return {
      spotCents,
      deltaCpk,
      spotMonthlyEur,
      fixedMonthlyEur,
      monthlyDeltaEur,
      verdict,
      hint,
      nextBestHref,
      nextBestLabel,
      nextActionDetail,
      whyChanged,
    };
  }, [fixedCentsPerKwh, monthlyKwh, priceEurPerMwh, retailerMarginCents]);

  return (
    <div className="ep-holo-panel relative overflow-hidden p-6 md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-56 w-56 rounded-full bg-[oklch(0.83_0.14_205_/_0.08)] blur-3xl"
      />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="ep-eyebrow-caps text-foreground/50">Elav ülevaade</p>
              <Badge
                variant="cyan"
                className="border-[oklch(0.83_0.14_205_/_35%)] bg-[oklch(0.83_0.14_205_/_8%)] text-foreground/85"
              >
                {feedLoading ? "Laadin konteksti…" : feed.ok ? "Live andmed + interaktiivne mudel" : "Interaktiivne eelvaade"}
              </Badge>
            </div>
            <p className="ep-display mt-3 text-xl font-semibold tracking-tight md:text-2xl">
              Sisend → mõju → järgmine samm
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/68">
              Iga liugur muudab arvutust kohe. Numbrid on omavahel seotud: sama viitehind, sama kuu maht, üheselt mõistetav
              säästu- ja riskisignaal.
            </p>
          </div>

          <div className="w-full max-w-[22rem]">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Tunnid (normaliseeritud)</p>
                <p className="mt-1 font-mono text-lg font-semibold text-[oklch(0.88_0.08_205)]">{priceEurPerMwh} €/MWh</p>
                <p className="mt-1 text-[11px] text-foreground/50">Viite keskmine (sinu liugur)</p>
              </div>
              <div className="text-right text-[11px] leading-tight text-foreground/55">
                <p className="font-mono text-foreground/75">
                  {Math.round(dayContext.minMwh)} – {Math.round(dayContext.maxMwh)} €/MWh
                </p>
                <p>Δ {Math.round(dayContext.spreadMwh)} · {dayContext.isLive ? "päev NPS" : "demo vahemik"}</p>
              </div>
            </div>
            <div className="relative mt-3 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_22%)] p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
              {feedLoading ? (
                <div className="flex h-[72px] w-full items-center justify-center rounded-xl bg-[oklch(0_0_0_/_25%)]">
                  <p className="text-xs text-foreground/55">Laen börsi päeva…</p>
                </div>
              ) : (
                <Sparkline values={sparkValues} gradientId={sparkGradId} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_14%)] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_5%)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">Ühised baasarvud</p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/58">
            Mõlemad vahekaardid kasutavad sama kuu mahtu ja viite börsihinda — nii on võrdlus aus.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SliderRow
              label="Kuu elektri maht (kWh)"
              value={monthlyKwh}
              min={120}
              max={1400}
              step={20}
              format={(v) => `${v} kWh`}
              onChange={setMonthlyKwh}
            />
            <SliderRow
              label="Viite börsihind (€/MWh)"
              value={priceEurPerMwh}
              min={40}
              max={280}
              step={5}
              format={(v) => `${v} €/MWh`}
              onChange={setPriceEurPerMwh}
            />
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
            Tarbimine & ajastus
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
            Leping & ühikuhind
          </button>
        </div>

        {tab === "consumption" ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatChip
                label="Kuu kulu (hinnang)"
                value={fmtEurCompact(consumption.afterMonthlyEur)}
                hint={`Baas (ilma ajastuseta) ${fmtEurCompact(consumption.baseMonthlyEur)}`}
              />
              <StatChip
                label="Säästu suund"
                value={consumption.savingsEur < 0.5 ? "Neutraalne" : `−${fmtEurCompact(consumption.savingsEur)}`}
                hint={consumption.savingsDirectionLabel}
              />
              <StatChip
                label="Risk / kõikuvus"
                value={consumption.riskLabel}
                hint={`Δ ${Math.round(consumption.spreadMwh)} €/MWh vs viide ${consumption.refMwh}`}
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Kõikuvuse skaala</p>
                <p className="font-mono text-[11px] text-foreground/60">
                  min-max / viide ~{" "}
                  {Math.min(100, Math.round((consumption.spreadMwh / Math.max(consumption.refMwh, 1)) * 100))}%
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[oklch(1_0_0_/_8%)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_145_/_0.85)] via-[oklch(0.83_0.14_205_/_0.9)] to-[oklch(0.95_0.06_85_/_0.75)]"
                  style={{ width: `${clamp(consumption.relativeVolatility * 100, 4, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:max-w-xl">
              <SliderRow
                label="Ajastatav tarbimise osa (%)"
                value={shiftPct}
                min={0}
                max={40}
                step={1}
                format={(v) => `${v}%`}
                onChange={setShiftPct}
              />
            </div>

            <div className="mt-7 grid gap-4 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_18%)] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
              <div>
                <p className="text-xs font-semibold tracking-tight text-foreground/88">Mis muutus ja miks</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{consumption.whyChanged}</p>
              </div>
              <div className="flex flex-col gap-3 border-t border-[oklch(1_0_0_/_8%)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Järgmine parim samm</p>
                  <p className="mt-2 text-sm font-medium text-foreground/85">{consumption.nextAction}</p>
                </div>
                <LinkButton
                  href={consumption.nextHref}
                  size="sm"
                  variant="secondary"
                  className="shrink-0 border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]"
                >
                  {consumption.nextLabel}
                </LinkButton>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatChip
                label="Spot + marginaal"
                value={fmtCentsPerKwh(contract.spotCents)}
                hint={`(${priceEurPerMwh} \u20AC/MWh / 10) + ${retailerMarginCents.toFixed(1)} s/kWh`}
              />
              <StatChip label="Fikseeritud" value={fmtCentsPerKwh(fixedCentsPerKwh)} hint="Ühiku hind lepingus" />
              <StatChip
                label="Kuu võrdlus"
                value={
                  Math.abs(contract.monthlyDeltaEur) < 0.05
                    ? "Sama järk"
                    : contract.monthlyDeltaEur > 0
                      ? `Spot −${fmtEurCompact(contract.monthlyDeltaEur)} / kuu`
                      : `Fikseeritud −${fmtEurCompact(-contract.monthlyDeltaEur)} / kuu`
                }
                hint={`${fmtEurCompact(contract.fixedMonthlyEur)} vs ${fmtEurCompact(contract.spotMonthlyEur)} · ${monthlyKwh} kWh`}
              />
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 md:max-w-3xl">
              <SliderRow
                label="Fikseeritud hind (s/kWh)"
                value={Number(fixedCentsPerKwh.toFixed(1))}
                min={9.5}
                max={29.9}
                step={0.1}
                format={(v) => `${v.toFixed(1)} s/kWh`}
                onChange={(v) => setFixedCentsPerKwh(v)}
              />
              <SliderRow
                label="Müüja marginaal börsi peale (s/kWh)"
                value={Number(retailerMarginCents.toFixed(1))}
                min={0.0}
                max={3.5}
                step={0.1}
                format={(v) => `${v.toFixed(1)} s/kWh`}
                onChange={(v) => setRetailerMarginCents(v)}
              />
            </div>

            <div className="mt-7 grid gap-4 rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_18%)] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
              <p className="text-sm font-semibold tracking-tight text-foreground/88">{contract.verdict}</p>
              <p className="text-sm leading-relaxed text-foreground/68">{contract.hint}</p>
              <div>
                <p className="text-xs font-semibold tracking-tight text-foreground/88">Mis muutus ja miks</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{contract.whyChanged}</p>
              </div>
              <div className="flex flex-col gap-3 border-t border-[oklch(1_0_0_/_8%)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Järgmine parim samm</p>
                  <p className="mt-2 text-sm font-medium text-foreground/85">{contract.nextActionDetail}</p>
                </div>
                <LinkButton
                  href={contract.nextBestHref}
                  size="sm"
                  variant="secondary"
                  className="shrink-0 border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]"
                >
                  {contract.nextBestLabel}
                </LinkButton>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[oklch(1_0_0_/_10%)] pt-5">
          <p className="max-w-2xl text-xs leading-relaxed text-foreground/55">
            {feed.ok ? (
              <>
                <span className="text-foreground/75">Päeva min/max</span> tuleb Elering NPS-ist;{" "}
                <span className="text-foreground/75">kuu kulu</span> eeldab viite keskmist (liugur). Ajastuse sääst kasutab
                fikseeritud {Math.round(SHIFT_SPREAD_CAPTURE * 100)}% tabavust teoreetilisest vahest — see on eelvaate
                lihtsustus, mitte personaalne profiil.
              </>
            ) : (
              <>
                <span className="text-foreground/75">Demo kontekst:</span> hinnakõver ja vahemik on illustratiivne, kuid
                valemid on omavahel järjekindlad. Kui NPS vastab, asendub kontekst päeva päris min/max-iga.
              </>
            )}
          </p>
          <LinkButton href="/tarbimine" size="sm" variant="ghost" className="text-foreground/55 hover:text-foreground/78">
            Täielik tööriist →
          </LinkButton>
        </div>
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
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const display = format ? format(value) : String(value);
  return (
    <div className="rounded-2xl border border-[oklch(1_0_0_/_10%)] bg-[oklch(0_0_0_/_18%)] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_6%)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-foreground/65">{label}</p>
        <p className="font-mono text-xs text-foreground/70">{display}</p>
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

