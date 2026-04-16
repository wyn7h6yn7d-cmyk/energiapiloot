import { ContractsAnalysisModule } from "@/components/dashboard/contracts/contracts-analysis";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { getContractAnalysisMarketHints } from "@/lib/server/services/contract-analysis-service";

export default async function PublicContractLabPage() {
  const hints = await getContractAnalysisMarketHints();

  return (
    <MarketingShell>
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/50 bg-card/25 p-8 shadow-[var(--shadow-elev-2)] backdrop-blur-md">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[oklch(0.83_0.14_205_/_0.12)] blur-3xl"
        />
        <p className="text-xs font-medium tracking-wide text-foreground/60">Lepingu labor</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Võrdle elektrilepinguid läbipaistvate eeldustega.
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Näed börsi, fikseeritud ja hübriidi mõju kõrvuti. Sügav intelligentsus ja täisgraafik jäävad premium taha —
          nii jääb kogemus selge, aga konversioon tugev.
        </p>
        <p className="mt-3 max-w-3xl text-pretty text-xs leading-relaxed text-foreground/55">{hints.noteEt}</p>
      </div>

      <ContractsAnalysisModule marketHints={hints} userType="household" publicExperience />
    </MarketingShell>
  );
}
