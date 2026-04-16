import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { PricingUnlockExperience } from "@/components/marketing/pricing-unlock-experience";
import { LinkButton } from "@/components/ui/link-button";

export default function PricingPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-5xl">
        <header className="relative overflow-hidden rounded-[1.75rem] border border-[oklch(0.83_0.14_205_/_0.22)] bg-[linear-gradient(135deg,oklch(0.16_0.04_250_/_0.92),oklch(0.11_0.03_250_/_0.88))] px-6 py-10 shadow-[0_0_100px_-52px_oklch(0.83_0.14_205_/_0.55)] backdrop-blur-xl md:px-10 md:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.83_0.14_205_/_0.55),transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[oklch(0.83_0.14_205_/_0.09)] blur-3xl"
          />
          <p className="ep-eyebrow-caps relative text-[oklch(0.78_0.1_205)]">Täisvaate avamine</p>
          <h1 className="ep-display relative mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.35rem]">
            Maksa siis, kui näed, et see sulle päriselt aitab.
          </h1>
          <p className="relative mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/72 md:text-[1.05rem]">
            Alusta tasuta — näed kohe suunda ja peamisi näitajaid. Täisvaade, võrdlused ja PDF avanevad ühe ostuga, ilma
            kuupaketi ja registreerimiseta.
          </p>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href="#avamine"
              variant="gradient"
              className="shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.7)]"
            >
              Vaata avamise võimalusi
            </LinkButton>
            <LinkButton href="/simulatsioonid" variant="outline" className="border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]">
              Proovi tasuta
            </LinkButton>
          </div>
        </header>

        <div className="mt-14 md:mt-20">
          <PricingUnlockExperience />
        </div>

        <div className="mt-16 rounded-2xl border border-[oklch(1_0_0_/_8%)] bg-[oklch(0_0_0_/_0.18)] px-5 py-6 md:px-8 md:py-7">
          <p className="text-sm font-medium text-foreground/80">Miks mitte igakuine pakett?</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/60">
            Energiaotsused on sageli hetked, mitte igakuine “paketihaldus”. Seetõttu on fookus ühel selgel ostul ja
            konkreetsel väljundil — mitte astmetega tabelil. Vajadusel saab sama loogikaga hiljem lisada täiendusi.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <LinkButton href="/" variant="ghost" className="text-foreground/55 hover:text-foreground/78">
            ← Tagasi avalehele
          </LinkButton>
          <p className="text-xs text-foreground/45">
            <Link className="underline underline-offset-4 hover:text-foreground/65" href="/security">
              Turvalisus
            </Link>
            <span className="mx-2 text-foreground/30">·</span>
            <Link className="underline underline-offset-4 hover:text-foreground/65" href="/legal/privacy">
              Privaatsus
            </Link>
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
