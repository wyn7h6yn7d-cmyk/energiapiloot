"use client";

import "./globals.css";

import { useEffect } from "react";

/**
 * Root-level error UI when the root layout fails. Must include html + body.
 * Styles: imports globals.css because this replaces the root layout.
 */
export default function GlobalError({
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
    <html lang="et">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Energiapiloot</h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            Rakenduses tekkis tõsine viga. Värskenda lehte või proovi hiljem uuesti.
          </p>
          <button
            type="button"
            className="mt-8 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background"
            onClick={() => reset()}
          >
            Proovi uuesti
          </button>
        </div>
      </body>
    </html>
  );
}
