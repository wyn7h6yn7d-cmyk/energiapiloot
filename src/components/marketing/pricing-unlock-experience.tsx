"use client";

import type { ReactNode } from "react";

import { LinkButton } from "@/components/ui/link-button";
import { UNLOCK_OFFERS, type UnlockOffer } from "@/lib/unlock/product-unlock-config";
import { cn } from "@/lib/utils";

const BUNDLE_ID = "ep_offer_bundle_all" as const;

const BUNDLE_HIGHLIGHTS = [
  "Kõik kihid ja paneelid on nähtavad",
  "Interaktiivne kokkuvõte (test-build)",
  "Aruanded printimiseks / PDF-ks (brauseri kaudu)",
] as const;

const FREE_HIGHLIGHTS = [
  "Tööriistad käivad kohe — registreerimist ei küsi",
  "Näed kohe suunda ja peamisi näitajaid",
  "Kõik on praegu testimiseks avatud",
] as const;

function CheckLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-left text-sm leading-relaxed text-foreground/78">
      <span
        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_14px_oklch(0.83_0.14_205_/_0.5)]"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

function JourneyRail() {
  const steps = [
    { k: "1", title: "Sisesta andmed", body: "Kohene signaal" },
    { k: "2", title: "Täpsusta", body: "Eeldused ja võrdlus" },
    { k: "3", title: "Tee otsus", body: "Jaga või prindi kokkuvõte" },
  ];

  return (
    <div className="relative rounded-2xl border border-[oklch(1_0_0_/_8%)] bg-[oklch(0_0_0_/_0.2)] px-4 py-5 md:px-8 md:py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-[2.25rem] hidden h-px md:block"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.83 0.14 205 / 35%), oklch(0.82 0.16 145 / 25%), transparent)",
        }}
      />
      <div className="grid gap-6 md:grid-cols-3 md:gap-4">
        {steps.map((s) => (
          <div key={s.k} className="relative flex flex-col items-center text-center">
            <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-[oklch(0.83_0.14_205_/_0.45)] bg-[oklch(0.12_0.03_255_/_0.9)] text-xs font-semibold text-[oklch(0.88_0.08_205)] shadow-[0_0_24px_-6px_oklch(0.83_0.14_205_/_0.55)]">
              {s.k}
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground/90">{s.title}</p>
            <p className="mt-1 text-xs text-foreground/55">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddOnCard({ offer, className }: { offer: UnlockOffer; className?: string }) {
  return (
    <div
      className={cn(
        "group flex h-full flex-col justify-between rounded-2xl border border-[oklch(1_0_0_/_10%)]",
        "bg-[linear-gradient(165deg,oklch(0.14_0.04_250_/_0.35),oklch(0.1_0.03_255_/_0.25))]",
        "p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_0.06)] transition-[border-color,box-shadow] duration-300",
        "hover:border-[oklch(0.83_0.14_205_/_0.28)] hover:shadow-[0_0_48px_-28px_oklch(0.83_0.14_205_/_0.35)]",
        className
      )}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[oklch(0.72_0.08_205)]">Test-build</p>
        <h4 className="ep-display mt-2 text-lg font-semibold tracking-tight text-foreground/95">{offer.label}</h4>
        {offer.description ? (
          <p className="mt-2 text-sm leading-relaxed text-foreground/62">{offer.description}</p>
        ) : null}
      </div>
      <LinkButton
        href="/pricing"
        variant="outline"
        size="sm"
        className="mt-6 w-full border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)] text-foreground/90 group-hover:border-[oklch(0.83_0.14_205_/_0.35)]"
      >
        Toote info
      </LinkButton>
    </div>
  );
}

export function PricingUnlockExperience() {
  const bundle = UNLOCK_OFFERS.find((o) => o.id === BUNDLE_ID)!;
  const addOns = UNLOCK_OFFERS.filter((o) => o.id !== BUNDLE_ID);

  return (
    <section id="avamine" className="scroll-mt-28 space-y-10 md:space-y-14">
      <div className="text-center md:text-left">
        <p className="ep-eyebrow-caps text-[oklch(0.78_0.1_205)]">Test-versioon</p>
        <h2 className="ep-display mt-3 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
          Kõik kihid on praegu avatud.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-foreground/65 md:text-base">
          Siin build’is ei ole ostuvoogu ega lukke. Eesmärk on testida loogikat, UX-i ja väljundite kvaliteeti ühe
          järjepideva voona.
        </p>
      </div>

      <JourneyRail />

      <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
        {/* Free — lighter, trustworthy */}
        <div
          className={cn(
            "flex flex-col rounded-[1.75rem] border border-[oklch(1_0_0_/_12%)] p-6 md:p-8",
            "bg-[linear-gradient(160deg,oklch(0.12_0.03_255_/_0.55),oklch(0.08_0.02_255_/_0.35))]",
            "lg:col-span-5"
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/45">Kohe käima</p>
          <h3 className="ep-display mt-3 text-xl font-semibold tracking-tight text-foreground/92">Tasuta kasutus</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/58">
            Sama tööriist ja tunnetus — sügavam kiht jääb kinni, kuni otsustad täisvaate avada.
          </p>
          <ul className="mt-6 space-y-3">
            {FREE_HIGHLIGHTS.map((t) => (
              <CheckLine key={t}>{t}</CheckLine>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href="/simulatsioonid" variant="outline" className="border-[oklch(1_0_0_/_16%)] bg-[oklch(1_0_0_/_4%)]">
              Proovi simulatsiooni
            </LinkButton>
            <LinkButton href="/leping" variant="ghost" className="text-foreground/55 hover:text-foreground/75">
              Lepingu vaade →
            </LinkButton>
          </div>
        </div>

        {/* Featured bundle — conversion anchor */}
        <div
          className={cn(
            "relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[oklch(0.83_0.14_205_/_0.42)] p-6 md:p-8",
            "bg-[linear-gradient(145deg,oklch(0.16_0.05_250_/_0.85),oklch(0.1_0.03_255_/_0.75))]",
            "shadow-[0_0_100px_-40px_oklch(0.83_0.14_205_/_0.55),inset_0_1px_0_0_oklch(1_0_0_/_0.08)]",
            "lg:col-span-7"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[oklch(0.83_0.14_205_/_0.12)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.55)] to-transparent"
          />

          <div className="relative flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[oklch(0.83_0.14_205_/_0.45)] bg-[oklch(0.83_0.14_205_/_0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.9_0.08_205)]">
              Soovitame
            </span>
                       <span className="rounded-full border border-[oklch(1_0_0_/_12%)] px-3 py-1 text-[10px] text-foreground/50">
              Kõik kihid avatud · test-build
            </span>
          </div>

          <h3 className="ep-display relative mt-5 text-2xl font-semibold tracking-tight text-foreground/95 md:text-[1.65rem]">
            {bundle.label}
          </h3>
          <p className="relative mt-2 max-w-xl text-sm leading-relaxed text-foreground/68 md:text-[0.95rem]">
            {bundle.description} Selles build’is on kogu funktsionaalsus avatud, et saaksid rahulikult testida ja võrrelda.
          </p>

          <ul className="relative mt-6 space-y-3">
            {BUNDLE_HIGHLIGHTS.map((t) => (
              <CheckLine key={t}>{t}</CheckLine>
            ))}
          </ul>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href="/simulatsioonid"
              variant="gradient"
              className="shadow-[0_0_36px_-8px_oklch(0.83_0.14_205_/_0.75)] sm:min-w-[220px]"
            >
              Alusta testimist
            </LinkButton>
            <LinkButton href="/?unlock=demo" variant="ghost" className="text-foreground/55 hover:text-foreground/78">
              Ava avaleht →
            </LinkButton>
          </div>

          <p className="relative mt-6 text-xs leading-relaxed text-foreground/48">
            Märkus: see komponent on jäänuk tulevasest hinnastuse kihist — test-buildis ei näita ta ostuvoogu.
          </p>
        </div>
      </div>

      <div>
        <h3 className="ep-display text-center text-lg font-semibold tracking-tight text-foreground/88 md:text-left md:text-xl">
          Või ava kihid ükshaaval
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-foreground/58 md:mx-0 md:text-left">
          Kui tahad rohkem detaile, ava sobiv tööriist ja vaata kihte otse seal.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {addOns.map((offer) => (
            <AddOnCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
