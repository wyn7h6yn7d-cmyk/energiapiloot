import { ContractsAnalysisModule } from "@/components/dashboard/contracts/contracts-analysis";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { getContractAnalysisMarketHints } from "@/lib/server/services/contract-analysis-service";

export default async function PublicContractLabPage() {
  const hints = await getContractAnalysisMarketHints();

  return (
    <MarketingShell>
      <div className="ep-cinema-panel relative mb-12 overflow-hidden rounded-[1.75rem] p-8 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[oklch(0.83_0.14_205_/_0.14)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.83_0.14_205_/_0.45)] to-transparent"
        />
        <p className="ep-eyebrow-caps text-foreground/50">Lepingu labor</p>
        <h1 className="ep-display mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Võrdle elektrilepinguid läbipaistvate eeldustega.
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Näed börsi, fikseeritud ja hübriidi mõju kõrvuti sama profiiliga. Kõik kihid on testimiseks avatud — eesmärk on
          leida “päris” otsus, mitte tekitada lukku.
        </p>
        <p className="mt-3 max-w-3xl text-pretty text-xs leading-relaxed text-foreground/55">{hints.noteEt}</p>
      </div>

      <ContractsAnalysisModule marketHints={hints} userType="household" publicExperience />
    </MarketingShell>
  );
}
