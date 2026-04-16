import { ContractsAnalysisModule } from "@/components/dashboard/contracts/contracts-analysis";

export default function ContractsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Lepinguanalüüs
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
          Võrdle lepinguid selgete eeldustega.
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Siin hakkab elama pakkumiste võrdlus (börs vs fikseeritud), hinnariski
          kokkuvõte ja auditeeritavad arvutused.
        </p>
      </div>

      <ContractsAnalysisModule />
    </div>
  );
}

