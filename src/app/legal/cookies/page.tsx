import Link from "next/link";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Küpsiste poliitika — Energiapiloot",
  description: "Selgitus küpsiste ja sarnaste tehnoloogiate kasutuse kohta Energiapiloodi teenuses.",
};

export default function CookiesPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-foreground/60">Õigus</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Küpsiste poliitika
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
          Allolev on eelversioon. Enne lansseerimist kohandame selle vastavalt
          kasutatavatele analüütika- ja turundustööriistadele.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-foreground/70 backdrop-blur-md">
          <section>
            <p className="font-medium text-foreground/85">1) Mis on küpsised?</p>
            <p className="mt-2">
              Küpsised on väikesed tekstifailid, mida brauser salvestab seadmesse. Neid kasutatakse näiteks
              sisselogimise, eelistuste ja turvalisuse tagamiseks.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">2) Milleks me neid kasutame</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Seansi ja autentimise töökindluseks (nt Supabase sessiooniküpsised).</li>
              <li>Kasutajakogemuse parandamiseks (eelistused, nt reduced motion).</li>
              <li>Turvalisuse tagamiseks (kuritarvituse ennetus).</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">3) Küpsiste kategooriad</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Vajalikud</strong>: ilma nendeta teenus ei tööta.</li>
              <li><strong>Eelistused</strong>: näiteks UI valikud.</li>
              <li><strong>Analüütika</strong>: (kui lisame) mõõdame anonüümselt kasutust.</li>
              <li><strong>Turundus</strong>: (kui lisame) kampaaniate mõõtmine.</li>
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground/85">4) Kuidas küpsiseid hallata</p>
            <p className="mt-2">
              Sa saad küpsiseid kontrollida brauseri seadetes. Vajalikud küpsised võivad olla teenuse toimimiseks
              hädavajalikud.
            </p>
          </section>
          <section>
            <p className="font-medium text-foreground/85">5) Kontakt</p>
            <p className="mt-2">
              Küsimuste korral kirjuta: <span className="underline underline-offset-4">privacy@energiapiloot.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <LinkButton href="/legal/privacy" variant="outline">
            Privaatsus
          </LinkButton>
          <LinkButton href="/legal/terms" variant="outline">
            Tingimused
          </LinkButton>
          <LinkButton href="/" variant="ghost">
            Tagasi avalehele
          </LinkButton>
        </div>

        <p className="mt-8 text-xs text-foreground/55">
          Vaata ka{" "}
          <Link className="underline underline-offset-4" href="/security">
            Turvalisus
          </Link>
          .
        </p>
      </div>
    </MarketingShell>
  );
}

