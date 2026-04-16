"use client";

import Link from "next/link";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Midagi läks valesti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 ep-card p-6">
      <label className="block text-xs font-medium text-foreground/70">Parool</label>
      <div className="mt-2">
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          minLength={8}
          placeholder="Vähemalt 8 tähemärki"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {done ? (
        <p className="mt-3 text-sm text-foreground/70">
          Parool uuendatud.{" "}
          <Link className="underline underline-offset-4" href={next}>
            Jätka
          </Link>
          .
        </p>
      ) : null}

      <div className="mt-6">
        <Button size="lg" type="submit" disabled={loading}>
          {loading ? "Uuendan..." : "Uuenda parool"}
        </Button>
      </div>
    </form>
  );
}

