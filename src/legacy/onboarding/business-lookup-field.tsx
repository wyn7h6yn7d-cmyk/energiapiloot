"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BusinessLookupField() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const companyRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <label className="text-xs font-medium tracking-wide text-foreground/60">Registrikood</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nt. 12345678"
            inputMode="numeric"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={loading || code.trim().length < 6}
          onClick={async () => {
            setLoading(true);
            try {
              const r = await fetch(
                `/api/integrations/business-lookup?code=${encodeURIComponent(code.trim())}`,
                { credentials: "include" }
              );
              if (!r.ok) return;
              const j = (await r.json()) as {
                company?: { name?: string; registryCode?: string; legalAddress?: string | null } | null;
              };
              if (j.company?.name && companyRef.current) {
                companyRef.current.value = j.company.name;
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Otsin…" : "Täida ärinimi"}
        </Button>
      </div>

      <input type="hidden" name="business_registry_code" value={code.trim()} readOnly />

      <div className="grid gap-2">
        <label className="text-xs font-medium tracking-wide text-foreground/60">Ettevõtte nimi</label>
        <Input ref={companyRef} name="company_name" placeholder="Nt. Demo OÜ" />
      </div>
    </div>
  );
}
