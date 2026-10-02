import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Icon } from "@/components/Icon";
import { API_URL } from "@/lib/api";

// Entry point for the platform operator. The Admin Pusat panel itself lives in the STUDIODO app served by the API host
// (login sessions are per-origin, so the sign-in has to happen there). Not linked from the site and kept out of search.
export const metadata: Metadata = { title: "Masuk Admin Pusat", robots: { index: false, follow: false } };

export default function AdminPusatPage() {
  const panelUrl = `${API_URL}/#/superadmin`;
  return (
    <PageShell eyebrow="Admin Pusat" title="Masuk sebagai pengelola platform." intro="Panel ini untuk tim STUDIODO: kelola tenant, paket harga, diskon, dan pembayaran langganan." narrow>
      <div className="grid max-w-[520px] gap-5">
        <div className="glass grid gap-6 p-8 md:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#a78bfa] text-white shadow-lg shadow-accent/30">
            <Icon name="shield" className="h-7 w-7" />
          </span>
          <div className="grid gap-2">
            <h2 className="font-display text-2xl tracking-tight">Admin Pusat STUDIODO</h2>
            <p className="text-[15px] leading-relaxed text-muted">
              Anda akan diarahkan ke panel Admin Pusat untuk memasukkan email dan password superadmin. Halaman login mendukung mode terang/gelap dan keyboard layar.
            </p>
          </div>
          <a href={panelUrl} className="btn btn-primary py-4 text-center text-base">Buka panel Admin Pusat</a>
        </div>
        <p className="text-sm text-muted">
          Pemilik booth? Masuk ke dashboard tenant lewat <Link href="/masuk" className="font-semibold text-accent underline underline-offset-4">halaman Masuk</Link>.
        </p>
      </div>
    </PageShell>
  );
}
