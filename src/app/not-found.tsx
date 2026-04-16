import Link from "next/link";

import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <div className="ep-container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="ep-eyebrow-caps text-foreground/50">404</p>
      <h1 className="ep-display mt-4 max-w-lg text-balance text-2xl font-semibold tracking-tight text-foreground/95 md:text-3xl">
        Lehte ei leitud
      </h1>
      <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-foreground/65">
        See aadress ei ole enam kasutusel või on vale. Kontrolli URL-i või mine avalehele.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <LinkButton href="/" variant="gradient">
          Avalehele
        </LinkButton>
        <Link
          href="/pricing"
          className="text-sm font-medium text-foreground/70 underline-offset-4 transition hover:text-foreground hover:underline"
        >
          Hinnad
        </Link>
      </div>
    </div>
  );
}
