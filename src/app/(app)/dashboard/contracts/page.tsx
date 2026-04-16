import { ContractsAnalysisModule } from "@/components/dashboard/contracts/contracts-analysis";
import { getContractAnalysisMarketHints } from "@/lib/server/services/contract-analysis-service";
import { getMyProfile } from "@/lib/supabase/profile";

export default async function ContractsPage() {
  const { profile } = await getMyProfile();
  const hints = await getContractAnalysisMarketHints();
  const userType = profile?.user_type === "business" ? "business" : "household";

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Lepinguanalüüs
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
          Võrdle elektrilepinguid läbipaistvate eeldustega.
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Näed börsi, fikseeritud ja hübriidmõju kõrvuti: hinnanguline kuukulu, risk ja lihtne tekst, mida saad
          oma numbritega üle kontrollida.
        </p>
        <p className="mt-3 max-w-3xl text-pretty text-xs leading-relaxed text-foreground/55">
          {hints.noteEt}
        </p>
      </div>

      <ContractsAnalysisModule marketHints={hints} userType={userType} />
    </div>
  );
}

