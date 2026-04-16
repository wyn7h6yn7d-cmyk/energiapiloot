import { ConsumptionInsightsModule } from "@/components/dashboard/consumption/consumption-insights";
import { MarketingShell } from "@/components/layout/marketing-shell";

export default function PublicConsumptionLabPage() {
  return (
    <MarketingShell>
      <div className="ep-cinema-panel relative mb-12 overflow-hidden rounded-[1.75rem] p-8 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[oklch(0.82_0.16_145_/_0.12)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.16_145_/_0.4)] to-transparent"
        />
        <p className="ep-eyebrow-caps text-foreground/50">Tarbimise labor</p>
        <h1 className="ep-display mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Muster, kulud ja paindlikkus — ilma kontota.
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Seadista profiil ja näe kohe, kuidas tipud ja baas-koormus arvet kujundavad. Kõik kihid on praegu testimiseks
          avatud.
        </p>
      </div>

      <ConsumptionInsightsModule publicExperience />
    </MarketingShell>
  );
}
