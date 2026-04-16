import Link from "next/link";
import type { Metadata } from "next";
import { loginAction } from "@/app/(marketing)/login/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Logi sisse",
  description: "Logi sisse Energiapiloodi kontole ja jätka töölauda.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";
  const error = sp.error;

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.45)]" />
          <span className="font-semibold tracking-tight">Energiapiloot</span>
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Logi sisse</h1>
        <p className="mt-2 text-sm text-foreground/65">
          Sisene oma kontoga ja jätka töölauda.
        </p>

        <form action={loginAction} className="mt-8 ep-card p-6">
          <input type="hidden" name="next" value={next} />
          <label className="block text-xs font-medium text-foreground/70">E-post</label>
          <div className="mt-2">
            <Input name="email" type="email" placeholder="you@company.com" required />
          </div>

          <label className="mt-4 block text-xs font-medium text-foreground/70">Parool</label>
          <div className="mt-2">
            <Input name="password" type="password" required />
          </div>

          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" type="submit">
              Jätka
            </Button>
            <LinkButton href="/register" size="lg" variant="outline">
              Loo konto
            </LinkButton>
            <Link
              href={`/forgot-password${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-sm text-foreground/70 underline underline-offset-4"
            >
              Unustasid parooli?
            </Link>
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
