"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

import { LinkButton } from "@/components/ui/link-button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingCanvas } from "@/components/three/marketing-canvas";

const beats = [
  {
    eyebrow: "Energiaotsused Baltikumis",
    title: "Näe oma elektrit süsteemina, mitte arvena.",
    body: "Seo tarbimine, lepingutingimused ja investeeringud üheks otsustusmudeliks. Selged valikud. Mõõdetav mõju.",
  },
  {
    eyebrow: "Lepingud ja sääst",
    title: "Võrdle pakkumisi. Simuleeri säästu. Tegutse kindlalt.",
    body: "Mõista fikseeritud vs börsihinda, tipukoormuse mõju ja päris säästu — ilma Excelita.",
  },
  {
    eyebrow: "Investeeringud",
    title: "Päike, aku, EV laadimine, soojuspump, tipukoormuse vähendus.",
    body: "Hinda tasuvust ja riski stsenaariumipõhise modelleerimisega, mis on loodud kodudele ja väikestele ettevõtetele.",
  },
  {
    eyebrow: "Soovitused",
    title: "Konkreetsed järgmised sammud, mitte üldine jutt.",
    body: "Tõlgime sinu andmed otsusteks: lepingumuudatused, koormuse nihutamine ja investeeringu ajastus.",
  },
] as const;

export function Landing() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v));

  return (
    <div ref={containerRef} className="relative min-h-screen w-full">
      <MarketingCanvas progress={progress} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_-10%,oklch(0.83_0.14_205_/25%),transparent_60%),radial-gradient(1000px_700px_at_15%_15%,oklch(0.82_0.16_145_/14%),transparent_60%),radial-gradient(900px_600px_at_85%_20%,oklch(0.83_0.14_205_/10%),transparent_55%)]" />

      <div className="relative z-10">
        <MarketingNav />

        <main className="mx-auto w-full max-w-6xl px-6">
          <section className="pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm font-medium tracking-wide text-foreground/70"
                >
                  Energiapiloot on otsustusplatvorm EE · LV · LT jaoks
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
                >
                  Tee elektriotsused selgelt.
                  <span className="block text-foreground/70">
                    Lepingud, tarbimine ja investeeringud — ühes mudelis.
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/75"
                >
                  Premium ja usaldusväärne platvorm kodudele ja väikestele ettevõtetele:
                  võrdle elektrilepinguid, simuleeri säästu ja planeeri uuendusi nagu
                  päike, akud, EV laadimine ja soojuspumbad.
                </motion.p>

                <div className="pointer-events-auto mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <LinkButton href="/register" size="lg">
                    Alusta tasuta
                  </LinkButton>
                  <LinkButton href="/pricing" size="lg" variant="outline">
                    Vaata hindu
                  </LinkButton>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Kpi label="Otsuseni" value="minutid" hint="Segadusest plaanini." />
                  <Kpi label="Stsenaariumid" value="salvestatud" hint="Jälgi “mis siis kui” tulemusi." />
                  <Kpi label="Fookus" value="Baltikum" hint="EE · LV · LT energia reaalsus." />
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="pointer-events-auto rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md">
                  <div className="p-6">
                    <p className="text-sm font-medium text-foreground/80">
                      Kiirülevaade
                    </p>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/65">
                      Sisesta kuine kWh hinnang ja loome baasjoone, seejärel näitame
                      lepingumuudatuste ja uuenduste mõju. Ilma kohustuseta.
                    </p>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                        <p className="text-xs text-foreground/60">Kuutarbimine</p>
                        <p className="mt-1 font-mono text-sm text-foreground/85">
                          420 kWh
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                        <p className="text-xs text-foreground/60">Võimalik sääst</p>
                        <p className="mt-1 font-mono text-sm text-foreground/85">
                          18–43 € / kuu
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                        <p className="text-xs text-foreground/60">Järgmine parim samm</p>
                        <p className="mt-1 text-sm text-foreground/85">
                          Nihuta tipukoormust + võrdle börsi vs fikseeritud
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-xs text-foreground/55">
                        Ehitatud töökindluse ja privaatsuse jaoks.
                      </p>
                      <LinkButton href="/login" size="sm" variant="secondary">
                        Logi sisse
                      </LinkButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pb-24">
            <div className="grid gap-10">
              {beats.map((b, idx) => (
                <StoryBeat
                  key={b.title}
                  index={idx}
                  eyebrow={b.eyebrow}
                  title={b.title}
                  body={b.body}
                />
              ))}
            </div>
          </section>

          <footer className="pb-16">
            <div className="flex flex-col items-start justify-between gap-6 border-t border-border/60 pt-10 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium">Energiapiloot</p>
                <p className="mt-1 text-sm text-foreground/60">
                  Tootmiskindel SaaS-vundament. Loodud Baltikumi jaoks.
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
    <div className="rounded-2xl border border-border/60 bg-card/30 px-4 py-4 backdrop-blur-md">
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-foreground/55">{hint}</p>
    </div>
  );
}

function StoryBeat({
  eyebrow,
  title,
  body,
  index,
}: {
  eyebrow: string;
  title: string;
  body: string;
  index: number;
}) {
  return (
    <section className="relative grid items-center gap-6 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          {String(index + 1).padStart(2, "0")} — {eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
          {title}
        </h2>
      </div>
      <div className="md:col-span-7">
        <p className="text-pretty text-base leading-relaxed text-foreground/70 md:text-lg">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Pill>Lepingud</Pill>
          <Pill>Tarbimine</Pill>
          <Pill>Investeeringud</Pill>
          <Pill>Soovitused</Pill>
        </div>
      </div>
    </section>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border/60 bg-background/30 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
      {children}
    </span>
  );
}

