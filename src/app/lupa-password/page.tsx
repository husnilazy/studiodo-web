import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/EmailLinkForms";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Lupa password", robots: { index: false } };

export default async function LupaPasswordPage({ searchParams }: PageProps<"/lupa-password">) {
  const sp = await searchParams;
  const realm = sp.jenis === "creator" ? "creator" : "tenant";
  return (
    <PageShell eyebrow="Akun" title="Lupa kata sandi?" intro="Masukkan email akun Anda. Kami kirim tautan untuk membuat kata sandi baru." narrow>
      <div className="max-w-[520px]">
        <ForgotPasswordForm realm={realm} />
        <p className="mt-6 text-sm text-muted">Ingat kata sandi? <Link href={realm === "creator" ? "/kreator/masuk" : "/masuk"} className="font-semibold text-accent underline underline-offset-4">Kembali masuk</Link></p>
      </div>
    </PageShell>
  );
}
