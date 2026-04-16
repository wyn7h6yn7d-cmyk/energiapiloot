"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { AddressResult } from "@/lib/domain/models";
import { cn } from "@/lib/utils";

export function AddressAutocomplete({
  className,
}: {
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [selected, setSelected] = useState<AddressResult | null>(null);

  useEffect(() => {
    const t = window.setTimeout(async () => {
      const query = q.trim();
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const r = await fetch(`/api/integrations/address-search?q=${encodeURIComponent(query)}`, {
          credentials: "include",
        });
        if (!r.ok) {
          setResults([]);
          return;
        }
        const j = (await r.json()) as { results?: AddressResult[] };
        setResults(j.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [q]);

  const json = useMemo(() => (selected ? JSON.stringify(selected) : ""), [selected]);

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-xs font-medium tracking-wide text-foreground/60">
        Aadress (autocomplete, server)
      </label>
      <Input
        value={q}
        onChange={(e) => {
          setOpen(true);
          setQ(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Nt. Narva mnt 1, Tallinn"
        autoComplete="off"
      />
      <input type="hidden" name="site_address_json" value={json} readOnly />

      {open && q.trim().length >= 2 ? (
        <div className="relative">
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border/60 bg-background/85 shadow-[var(--shadow-elev-2)] backdrop-blur-md">
            <div className="max-h-56 overflow-auto p-2">
              {loading ? (
                <p className="px-3 py-2 text-sm text-foreground/60">Otsin…</p>
              ) : results.length ? (
                results.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="flex w-full items-start rounded-xl px-3 py-2 text-left text-sm hover:bg-card/40"
                    onClick={() => {
                      setSelected(a);
                      setQ(a.label);
                      setOpen(false);
                    }}
                  >
                    <span className="text-foreground/85">{a.label}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-foreground/60">Tulemusi ei leitud (proovi laiemalt).</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <p className="text-xs text-foreground/55">
          Valitud: {selected.label} • {selected.countryCode}
          {selected.coordinates
            ? ` • ${selected.coordinates.lat.toFixed(4)}, ${selected.coordinates.lng.toFixed(4)}`
            : null}
        </p>
      ) : (
        <p className="text-xs text-foreground/55">
          Otsing käib läbi serveri (`/api/integrations/address-search`) — päris Maa-amet/In-ADS parser lisandub
          adapterisse.
        </p>
      )}
    </div>
  );
}
