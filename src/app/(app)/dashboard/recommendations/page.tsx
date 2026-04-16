import { RecommendationsBoard } from "@/components/dashboard/recommendations/recommendations-board";

export default function RecommendationsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-foreground/60">
          Soovitused
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
          Järgmised sammud, koos põhjendusega.
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-foreground/70">
          Soovitused tekivad lepinguanalüüsi ja simulatsioonide põhjal. Iga soovitus
          on auditeeritav: eeldused, loogika ja mõju on nähtavad.
        </p>
      </div>

      <RecommendationsBoard />
    </div>
  );
}

