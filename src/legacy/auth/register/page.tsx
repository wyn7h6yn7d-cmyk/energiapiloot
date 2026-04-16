import Link from "next/link";
import type { Metadata } from "next";
import { registerAction } from "@/legacy/auth/register/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Loo konto",
  description: "Loo Energiapiloodi konto ja alusta tasuta stsenaariumiga.",
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

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Loo konto</h1>
        <p className="mt-2 text-sm text-foreground/65">
          Alusta baasstsenaariumiga. Täpsemad simulaatorid saad hiljem paketiga juurde.
        </p>

        <form action={registerAction} className="mt-8 ep-card p-6">
          <label className="block text-xs font-medium text-foreground/70">E-post</label>
          <div className="mt-2">
            <Input name="email" type="email" placeholder="you@company.com" required />
          </div>

          <label className="mt-4 block text-xs font-medium text-foreground/70">Parool</label>
          <div className="mt-2">
            <Input name="password" type="password" required minLength={8} />
          </div>

          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" type="submit">
              Loo konto
            </Button>
            <LinkButton href="/login" size="lg" variant="outline">
              Mul on juba konto
            </LinkButton>
          </div>
        </form>

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
