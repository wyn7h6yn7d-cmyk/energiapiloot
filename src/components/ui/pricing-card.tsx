"use client";

import { ReactNode } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";

export function PricingCard({
  name,
  price,
  highlight,
  badge,
  description,
  features,
  cta,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
  cta: { href: string; label: string };
}) {
  return (
    <Card
      variant="panel"
      hover="lift"
      className={cn(
        highlight
          ? "border-[oklch(0.83_0.14_205_/55%)] shadow-[var(--shadow-elev-2),var(--glow-cyan)]"
          : "border-border/60"
      )}
    >
      <CardHeader>
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>{name}</CardTitle>
            {badge ? <Badge variant={highlight ? "cyan" : "neutral"}>{badge}</Badge> : null}
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
        <PriceBlock>{price}</PriceBlock>
      </CardHeader>

      <div className="mt-5 space-y-2 text-sm text-foreground/70">
        {features.map((f) => (
          <Feature key={f}>{f}</Feature>
        ))}
      </div>

      <div className="mt-7">
        <LinkButton href={cta.href} variant={highlight ? "gradient" : "outline"} size="lg">
          {cta.label}
        </LinkButton>
      </div>
    </Card>
  );
}

function PriceBlock({ children }: { children: ReactNode }) {
  return <p className="font-mono text-sm text-foreground/80">{children}</p>;
}

function Feature({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.83_0.14_205)] shadow-[0_0_18px_oklch(0.83_0.14_205_/_0.45)]" />
      <span className="text-pretty leading-relaxed">{children}</span>
    </div>
  );
}

