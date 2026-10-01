import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { LoginForm } from "@/components/LoginForm";
import { getCreatorToken } from "@/lib/creator";
import { creatorLoginAction } from "./actions";

export const metadata: Metadata = { title: "Masuk Kreator", robots: { index: false } };

export default async function KreatorMasukPage({ searchParams }: PageProps<"/kreator/masuk">) {
  const sp = await searchParams;
  if ((await getCreatorToken()) && sp.sesi !== "habis") redirect("/kreator/portal");

  return (
    <PageShell eyebrow="Kreator" title="Masuk ke portal kreator." intro="Gunakan akun yang dikirim tim STUDIODO setelah portofolio Anda diterima." narrow>
      <div className="max-w-[520px]">
        <LoginForm sessionExpired={sp.sesi === "habis"} submit={creatorLoginAction} />
        <p className="mt-6 text-sm text-muted">
          Belum punya akun? <Link href="/kreator" className="font-semibold text-accent underline underline-offset-4">Kirim portofolio Anda</Link>
        </p>
      </div>
    </PageShell>
  );
}
