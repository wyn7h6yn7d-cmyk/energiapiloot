import Link from "next/link";
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Konto loomine",
  description: "Avalikus test-buildis ei ole konto loomine vajalik.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp.error;

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.82_0.16_145)] shadow-[0_0_18px_oklch(0.82_0.16_145_/_0.45)]" />
          <span className="font-semibold tracking-tight">Energiapiloot</span>
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Konto loomine ei ole vajalik</h1>
        <p className="mt-2 text-sm text-foreground/65">
          Avalikus test-buildis on tööriistad avatud ilma konto ja sisselogimiseta.
        </p>

        <div className="mt-8 ep-card p-6">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <LinkButton href="/" size="lg" variant="gradient" className="mt-2 w-full">
            Tagasi avalehele
          </LinkButton>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <LinkButton href="/tarbimine" variant="outline" className="w-full">
              Tarbimise labor
            </LinkButton>
            <LinkButton href="/leping" variant="outline" className="w-full">
              Lepingu labor
            </LinkButton>
          </div>
        </div>

        <p className="mt-6 text-xs text-foreground/55">
          Jätkates nõustud{" "}
          <Link className="underline underline-offset-4" href="/legal/terms">
            tingimustega
          </Link>{" "}
          ja{" "}
          <Link className="underline underline-offset-4" href="/legal/privacy">
            privaatsuspoliitikaga
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
