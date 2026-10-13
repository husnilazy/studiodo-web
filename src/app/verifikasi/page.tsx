import type { Metadata } from "next";
import Link from "next/link";
import { ResendVerificationForm } from "@/components/EmailLinkForms";
import { PageShell } from "@/components/PageShell";
import { verifyEmailRequest } from "@/app/lupa-password/actions";

export const metadata: Metadata = { title: "Verifikasi email", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function VerifikasiPage({ searchParams }: PageProps<"/verifikasi">) {
  const sp = await searchParams;
  const realm = sp.jenis === "creator" ? "creator" : "tenant";
  const id = typeof sp.id === "string" ? sp.id : "";
  const token = typeof sp.token === "string" ? sp.token : "";
  const result = id && token ? await verifyEmailRequest(realm, id, token) : ({ ok: false, error: "Tautan tidak lengkap. Buka tautan langsung dari email Anda." } as const);

  return (
    <PageShell eyebrow="Verifikasi" title={result.ok ? "Email terverifikasi." : "Verifikasi belum berhasil."} narrow>
      <div className="max-w-[520px]">
        {result.ok ? (
          <div className="glass flex flex-col items-start gap-4 p-8 md:p-10" role="status">
            <span className="pop-in grid h-14 w-14 place-items-center rounded-full bg-[#dff7ec] text-[#0f6b45]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true"><path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
            <p className="text-[15px] leading-relaxed text-muted">Terima kasih! Alamat email Anda sudah terverifikasi. Tim kami akan menghubungi Anda setelah pengajuan ditinjau.</p>
            <Link href="/" className="btn btn-primary px-7 py-3.5">Ke beranda</Link>
          </div>
        ) : (
          <div className="glass grid gap-5 p-8 md:p-10">
            <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{result.error}</p>
            <ResendVerificationForm realm={realm} />
          </div>
        )}
      </div>
    </PageShell>
  );
}
