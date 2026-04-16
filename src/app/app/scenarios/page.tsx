import { Button } from "@/components/ui/button";

export default function ScenariosPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium tracking-wide text-foreground/60">
        Scenarios
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
        Save what-if decisions.
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70">
        Scenarios will be stored in Supabase with RLS. Each scenario represents a
        baseline plus a set of upgrades or contract changes.
      </p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">No scenarios yet</p>
            <p className="mt-1 text-sm text-foreground/65">
              Create your first scenario after onboarding.
            </p>
          </div>
          <Button disabled>Create scenario</Button>
        </div>
      </div>
    </div>
  );
}

