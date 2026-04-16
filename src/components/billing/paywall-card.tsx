"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { formatPrice, PLANS, type PlanId } from "@/lib/billing/plans";

export function PaywallCard({
  title,
  description,
  requiredPlan = "plus",
}: {
  title: string;
  description: string;
  requiredPlan?: PlanId;
}) {
  const plan = PLANS.find((p) => p.id === requiredPlan) ?? PLANS[1];
  return (
    <Panel className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_260px_at_20%_0%,rgba(38,230,255,0.12),transparent_62%),radial-gradient(560px_240px_at_90%_40%,rgba(46,242,181,0.10),transparent_65%)]"
      />
      <div className="relative">
        <PanelHeader>
          <div>
            <PanelTitle>{title}</PanelTitle>
            <PanelDescription>{description}</PanelDescription>
          </div>
          <Badge variant="cyan">{plan.name}</Badge>
        </PanelHeader>
        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-border/50 bg-card/25 p-4">
            <p className="text-xs font-medium tracking-wide text-foreground/60">Sisaldab</p>
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              {plan.features.slice(0, 4).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-sm text-foreground/75">
              Alates {formatPrice(plan.id, "monthly")}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link href="/pricing">
              <Button variant="gradient">Toote info</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline">Ava lehed</Button>
            </Link>
          </div>
        </div>
      </div>
    </Panel>
  );
}

