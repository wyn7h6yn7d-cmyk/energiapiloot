import { ConsumptionInsightsModule } from "@/components/dashboard/consumption/consumption-insights";
import { MarketingShell } from "@/components/layout/marketing-shell";

export default function PublicConsumptionLabPage() {
  return (
    <MarketingShell>
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/50 bg-card/25 p-8 shadow-[var(--shadow-elev-2)] backdrop-blur-md">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[oklch(0.82_0.16_145_/_0.1)] blur-3xl"
        />
        <p className="text-xs font-medium tracking-wide text-foreground/60">Tarbimise labor</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Muster, kulud ja paindlikkus — ilma kontota.
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Seadista profiil ja näe kohe, kuidas tipud ja baas-koormus arvet kujundavad. Täielik sügavus (draiverid,
          lipud, PDF) avaneb premium vooga.
        </p>
      </div>

      <ConsumptionInsightsModule publicExperience />
    </MarketingShell>
  );
}
