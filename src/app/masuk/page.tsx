import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { LoginForm } from "@/components/LoginForm";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { loadGoogleClientId } from "./actions";
import { getToken } from "@/lib/portal";

export const metadata: Metadata = { title: "Masuk", robots: { index: false } };

export default async function MasukPage({ searchParams }: PageProps<"/masuk">) {
  const sp = await searchParams;
  // A visitor with a session cookie goes straight in — unless they were just sent here because it expired.
  if ((await getToken()) && sp.sesi !== "habis") redirect("/portal");

  const googleClientId = await loadGoogleClientId();
  return (
    <PageShell eyebrow="Masuk" title="Masuk ke dashboard." intro={googleClientId ? "Masuk dengan password akun tenant Anda, atau dengan akun Google yang emailnya terdaftar." : "Gunakan email dan password akun tenant Anda."} narrow>
      <div className="max-w-[520px]">
        <LoginForm sessionExpired={sp.sesi === "habis"} forgotHref="/lupa-password?jenis=tenant" />
        {googleClientId && <div className="mt-5"><GoogleSignIn clientId={googleClientId} /></div>}
        <p className="mt-6 text-sm text-muted">
          Belum punya akun? <Link href="/daftar" className="font-semibold text-accent underline underline-offset-4">Ajukan akun</Link>
        </p>
      </div>
    </PageShell>
  );
}
