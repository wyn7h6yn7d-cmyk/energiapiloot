import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
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
          <p className="ep-eyebrow-caps relative text-[oklch(0.78_0.1_205)]">Toote info</p>
          <h1 className="ep-display relative mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.35rem]">
            Platvorm on praegu avalikuks testimiseks avatud.
          </h1>
          <p className="relative mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/72 md:text-[1.05rem]">
            See on täisligipääsuga test-build: tööriistad töötavad ilma konto ja ostusammudeta. Eesmärk on testida loogikat,
            kiirust ja kasutuskogemust — ning parandada seda, mis päriselt segab otsust.
          </p>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href="/simulatsioonid"
              variant="gradient"
              className="shadow-[0_0_28px_-8px_oklch(0.83_0.14_205_/_0.7)]"
            >
              Alusta simulatsioonist
            </LinkButton>
            <LinkButton href="/leping" variant="outline" className="border-[oklch(1_0_0_/_14%)] bg-[oklch(1_0_0_/_4%)]">
              Ava lepingu labor
            </LinkButton>
            <LinkButton href="/tarbimine" variant="ghost" className="text-foreground/55 hover:text-foreground/78">
              Ava tarbimise labor →
            </LinkButton>
          </div>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <p className="ep-eyebrow-caps text-foreground/50">Mis on avatud</p>
            <h2 className="ep-display mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
              Kõik põhivood.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/68">
              Test-buildis saad teha kogu “otsuse ringi” algusest lõpuni: sisendid → võrdlus → väljund. Kui mõni detail on
              poolik, näed seda läbipaistvalt (mitte lukuna).
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoChip t="Täisligipääs" s="Kihid ja paneelid on nähtavad." />
              <InfoChip t="Ilma kontota" s="Avalik test, ilma registreerimiseta." />
              <InfoChip t="Reaalne andmeliides" s="Hinnainfo ja otsingud käivad adapterite kaudu." />
              <InfoChip t="Aruanded" s="Prindi või salvesta PDF-ina brauserist." />
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-3">
          {[
            {
              t: "Simulatsioonid",
              s: "Investeeringu mõju: rahavoog, tundlikkus ja eeldused ühes vaates.",
              href: "/simulatsioonid",
            },
            { t: "Lepingu labor", s: "Võrdle börsi, fikseeritud ja hübriidi sama profiiliga.", href: "/leping" },
            { t: "Tarbimise labor", s: "Muster, kulud ja paindlikkus — kiirelt ja arusaadavalt.", href: "/tarbimine" },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl border border-[oklch(1_0_0_/_8%)] bg-[oklch(0_0_0_/_0.18)] p-6"
            >
              <p className="ep-display text-base font-semibold tracking-tight text-foreground/92">{x.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/62">{x.s}</p>
              <div className="mt-5">
                <LinkButton href={x.href} variant="outline" size="sm">
                  Ava
                </LinkButton>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <p className="ep-eyebrow-caps text-foreground/50">Mida proovida</p>
            <h2 className="ep-display mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
              5-minuti test.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/68">
              Kui tahad kiiresti aru saada, kas loogika on “päris”, tee üks ring läbi nende sammude.
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-border/50 bg-card/25 p-6">
              <ul className="space-y-3 text-sm text-foreground/72">
                <Check>Pane paika kuu tarbimine ja vaata kuukulu suunda.</Check>
                <Check>Muuda lepingu tüüpi ja võrdle riskiskoori ning hinnangut.</Check>
                <Check>Nihuta paindlik tarbimine ja jälgi, kas sääst on realistlik.</Check>
                <Check>Genereeri aruanne ja prindi/salvesta see PDF-ina brauserist.</Check>
                <Check>Vaata “Soovitused” vaates, kas järgmine samm tundub loogiline.</Check>
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <LinkButton href="/tarbimine" variant="gradient">
                  Ava tarbimise labor
                </LinkButton>
                <LinkButton href="/leping" variant="outline">
                  Ava lepingu labor
                </LinkButton>
                <LinkButton href="/dashboard" variant="ghost" className="text-foreground/55 hover:text-foreground/78">
                  Ava töölaud →
                </LinkButton>
              </div>
            </div>
          </div>
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

function InfoChip({ t, s }: { t: string; s: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/25 p-5">
      <p className="text-sm font-semibold tracking-tight text-foreground/90">{t}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65">{s}</p>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_14px_oklch(0.83_0.14_205_/_0.45)]"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}
