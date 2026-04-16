export default function RecommendationsPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium tracking-wide text-foreground/60">
        Recommendations
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
        A decision engine you can trust.
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70">
        This will start as a rules-based engine (transparent and auditable), then grow
        into more personalized guidance over time.
      </p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
        <p className="text-sm font-semibold">No recommendations yet</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/65">
          Complete onboarding and create a scenario to generate your first “next best
          action”.
        </p>
      </div>
    </div>
  );
}

