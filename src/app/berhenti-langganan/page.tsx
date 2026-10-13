import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { UnsubscribeConfirm } from "@/components/UnsubscribeConfirm";
import { API_URL } from "@/lib/api";

export const metadata: Metadata = { title: "Berhenti berlangganan email", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BerhentiLanggananPage({ searchParams }: PageProps<"/berhenti-langganan">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  let info: { label: string; realm: string } | null = null;
  let error = token ? "" : "Tautan tidak lengkap.";
  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/public/email-unsubscribe?token=${encodeURIComponent(token)}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
      const data = (await res.json().catch(() => ({}))) as { label?: string; realm?: string; error?: string };
      if (res.ok && data.label) info = { label: data.label, realm: data.realm ?? "tenant" };
      else error = data.error ?? "Tautan tidak valid.";
    } catch {
      error = "Tidak dapat terhubung ke server. Coba muat ulang halaman.";
    }
  }
  return (
    <PageShell eyebrow="Preferensi email" title="Berhenti berlangganan email." narrow>
      <div className="max-w-[520px]">
        {info ? <UnsubscribeConfirm token={token} label={info.label} realm={info.realm} /> : (
          <div className="glass p-8 md:p-10" role="alert"><p className="text-[15px] text-muted">{error} Anda tetap bisa mengatur preferensi email dari <Link href="/portal/akun" className="font-semibold text-accent underline underline-offset-4">dashboard</Link>.</p></div>
        )}
      </div>
    </PageShell>
  );
}
