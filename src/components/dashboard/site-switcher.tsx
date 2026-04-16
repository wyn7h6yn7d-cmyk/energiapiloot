"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SiteSwitcherItem = {
  id: string;
  name: string;
  subtitle?: string;
};

export function SiteSwitcher({
  items,
  value,
  onChange,
  className,
}: {
  items: SiteSwitcherItem[];
  value: string;
  onChange: (nextId: string) => void;
  className?: string;
}) {
  const current = useMemo(() => items.find((i) => i.id === value) ?? items[0], [items, value]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-foreground/55">
          Objekt
        </p>
        <div className="mt-1 flex items-center gap-2">
          <select
            value={current?.id}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 max-w-[16rem] truncate rounded-xl border border-border/60 bg-card/40 px-3 text-sm font-medium text-foreground shadow-[var(--shadow-elev-1)] backdrop-blur-md outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--ep-focus)]"
            aria-label="Vali objekt"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            className="hidden md:inline-flex"
            onClick={() => {
              // Placeholder until sites CRUD exists
              alert("Objektide haldus lisandub järgmises etapis.");
            }}
          >
            Lisa objekt
          </Button>
        </div>
        {current?.subtitle ? (
          <p className="mt-1 text-xs text-foreground/55">{current.subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

