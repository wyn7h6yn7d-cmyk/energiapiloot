"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function SignInPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.45)]" />
          <span className="font-semibold tracking-tight">Energiapiloot</span>
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-foreground/65">
          Auth is wired to Supabase next. For now, this is the UI and routing
          foundation.
        </p>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
          <label className="block text-xs font-medium text-foreground/70">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-2 w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />

          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" disabled>
              Continue
            </Button>
            <LinkButton href="/sign-up" size="lg" variant="outline">
              Create an account
            </LinkButton>
          </div>
        </div>

        <p className="mt-6 text-xs text-foreground/55">
          By continuing, you agree to our{" "}
          <Link className="underline underline-offset-4" href="/legal/terms">
            Terms
          </Link>{" "}
          and{" "}
          <Link className="underline underline-offset-4" href="/legal/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

