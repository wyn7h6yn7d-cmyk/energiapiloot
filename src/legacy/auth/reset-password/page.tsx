import Link from "next/link";
import { ResetPasswordForm } from "@/legacy/auth/reset-password/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";
  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.82_0.16_145)] shadow-[0_0_18px_oklch(0.82_0.16_145_/_0.45)]" />
          <span className="font-semibold tracking-tight">Energiapiloot</span>
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Uus parool</h1>
        <p className="mt-2 text-sm text-foreground/65">
          Sea uus parool ja jätka.
        </p>

        <ResetPasswordForm next={next} />
      </div>
    </div>
  );
}

