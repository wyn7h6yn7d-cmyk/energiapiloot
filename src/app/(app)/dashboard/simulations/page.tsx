import { LinkButton } from "@/components/ui/link-button";

export default function SimulationsPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium tracking-wide text-foreground/60">
        Simulatsioonid
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
        Hinda uuendusi stsenaariumitega.
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/70">
        Kohatäide. Järgmisena: esimene töötav simulaator (päikese sääst), seejärel
        aku, EV laadimine, soojuspump ja tipukoormuse vähendus.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <LinkButton href="/dashboard/recommendations" variant="outline">
          Vaata soovitusi
        </LinkButton>
      </div>
    </div>
  );
}

