"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="ep-container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="ep-eyebrow-caps text-foreground/50">Viga</p>
      <h1 className="ep-display mt-4 max-w-lg text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
        Midagi läks katki
      </h1>
      <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-foreground/65">
        Lehte ei saanud korralikult kuvada. Proovi uuesti või mine avalehele.
      </p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="mt-6 max-h-40 max-w-full overflow-auto rounded-xl border border-border/60 bg-muted/30 p-4 text-left font-mono text-xs text-foreground/70">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="gradient" onClick={() => reset()}>
          Proovi uuesti
        </Button>
        <LinkButton href="/" variant="outline">
          Avalehele
        </LinkButton>
      </div>
    </div>
  );
}
