import type { Metadata } from "next";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { PayQris, type PayData } from "@/components/PayQris";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pembayaran", robots: { index: false, follow: false } };

// STUDIODO's own payment page for a subscription (QRIS). Opens with the signed link from checkout / the invoice email; no login needed.
export default async function BayarPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ orderId }, { t }] = await Promise.all([params, searchParams]);
  let data: PayData | null = null;
  if (/^SDO-[A-Z0-9-]{4,40}$/.test(orderId) && t) {
    try {
      const res = await fetch(`${API_URL}/api/public/billing/pay/${encodeURIComponent(orderId)}?token=${encodeURIComponent(t)}`, { cache: "no-store" });
      if (res.ok) data = (await res.json()) as PayData;
    } catch { /* shown as "not found" below */ }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-clip px-4 py-10">
      <div aria-hidden="true" className="blob -left-24 top-10 h-[420px] w-[420px] bg-[#bfc6ff] opacity-60" />
      <div aria-hidden="true" className="blob -right-24 bottom-0 h-[380px] w-[380px] bg-[#ffc8de] opacity-50" />
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-6 flex justify-center"><Link href="/" aria-label="STUDIODO"><Logo /></Link></div>
        {data ? <PayQris data={data} token={t!} /> : (
          <div className="glass p-9 text-center">
            <h1 className="font-display text-[24px] tracking-tight">Tautan pembayaran tidak ditemukan</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">Tautannya mungkin salah atau sudah tidak berlaku. Buka lagi dari email invoice, atau masuk ke dashboard.</p>
            <Link href="/portal/tagihan" className="btn btn-primary mt-6 inline-block px-7 py-3.5 text-[15px]">Buka dashboard</Link>
          </div>
        )}
      </div>
    </main>
  );
}
