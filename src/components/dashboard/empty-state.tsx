"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";
import { Panel, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
  className,
  children,
}: PropsWithChildren<{
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}>) {
  return (
    <Panel className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_260px_at_15%_20%,rgba(38,230,255,0.12),transparent_60%),radial-gradient(520px_240px_at_85%_35%,rgba(46,242,181,0.10),transparent_62%)]"
      />
      <div className="relative">
        <PanelHeader>
          <PanelTitle>{title}</PanelTitle>
          <PanelDescription>{description}</PanelDescription>
        </PanelHeader>

        <div className="px-6 pb-6">
          {children ? <div className="mb-5">{children}</div> : null}
          <div className="flex flex-wrap items-center gap-2">
            {actionHref && actionLabel ? (
              <Link href={actionHref}>
                <Button variant="gradient">{actionLabel}</Button>
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link href={secondaryHref}>
                <Button variant="outline">{secondaryLabel}</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}

