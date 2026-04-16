import { LinkButton } from "@/components/ui/link-button";

export default function DashboardHomePage() {
  return (
    <div className="grid gap-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground/60">
            Töölaud
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
            Sinu järgmine parim energiaotsus.
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-foreground/70">
            See on SaaS-i vundament. Järgmisena: Supabase autentimine + onboarding,
            seejärel esimene töötav simulatsioon ja salvestatud stsenaariumid.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <LinkButton href="/dashboard/simulations">Käivita simulatsioon</LinkButton>
          <LinkButton href="/pricing" variant="outline">
            Uuenda paketti
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Baasjoon" value="Pole seadistatud" hint="Ühenda andmed onboardingus." />
        <Card title="Võimalik sääst" value="—" hint="Vajab stsenaariumi." />
        <Card title="Tipu mõju" value="—" hint="Lisa hiljem intervallandmed." />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md">
      <p className="text-xs text-foreground/60">{title}</p>
      <p className="mt-2 font-mono text-xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-foreground/55">{hint}</p>
    </div>
  );
}

