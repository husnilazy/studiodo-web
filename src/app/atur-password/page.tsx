import type { Metadata } from "next";
import Link from "next/link";
import { SetPasswordForm } from "@/components/EmailLinkForms";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Atur kata sandi", robots: { index: false, follow: false } };

export default async function AturPasswordPage({ searchParams }: PageProps<"/atur-password">) {
  const sp = await searchParams;
  const realm = sp.jenis === "creator" ? "creator" : "tenant";
  const token = typeof sp.token === "string" ? sp.token : "";
  return (
    <PageShell eyebrow="Akun" title="Buat kata sandi baru." intro="Pilih kata sandi yang kuat dan belum pernah Anda pakai di tempat lain." narrow>
      <div className="max-w-[520px]">
        {token ? <SetPasswordForm realm={realm} token={token} /> : (
          <div className="glass p-8 md:p-10" role="alert">
            <p className="text-[15px] text-muted">Tautan tidak lengkap. Buka tautan langsung dari email Anda, atau <Link href={`/lupa-password?jenis=${realm}`} className="font-semibold text-accent underline underline-offset-4">minta tautan baru</Link>.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
