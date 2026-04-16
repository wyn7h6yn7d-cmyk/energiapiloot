"use client";

import Link from "next/link";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/reset-password${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Midagi läks valesti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 ep-card p-6">
      <label className="block text-xs font-medium text-foreground/70">E-post</label>
      <div className="mt-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          type="email"
          required
        />
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {sent ? (
        <p className="mt-3 text-sm text-foreground/70">
          Kui konto olemas, saad peagi e-kirja.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" type="submit" disabled={loading}>
          {loading ? "Saadan..." : "Saada link"}
        </Button>
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-sm text-foreground/70 underline underline-offset-4"
        >
          Tagasi sisselogimisse
        </Link>
      </div>
    </form>
  );
}

