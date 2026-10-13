import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/dash/PageHeader";
import { getSessionHistory } from "@/lib/portal";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: string }> = {
  success: { label: "Berhasil", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  pending: { label: "Menunggu", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  failed: { label: "Gagal", tone: "bg-[#ffe3e3] text-[#a12626]" },
  expired: { label: "Kedaluwarsa", tone: "bg-[var(--soft)] text-muted" },
};
const METHOD: Record<string, string> = { qris: "QRIS", voucher: "Voucher", cash: "Tunai" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const when = (v: string) => new Date(v).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const input = "h-10 rounded-full border-0 bg-[var(--soft)] px-4 text-[13.5px] text-foreground outline-none focus:ring-2 focus:ring-accent/40";

export default async function RiwayatPage({ searchParams }: PageProps<"/portal/riwayat">) {
  const sp = await searchParams;
  const status = one(sp.status);
  const from = one(sp.from);
  const to = one(sp.to);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const filters = new URLSearchParams();
  if (status) filters.set("status", status);
  if (from) filters.set("from", from);
  if (to) filters.set("to", to);
  const h = await getSessionHistory(new URLSearchParams({ page: String(page), ...Object.fromEntries(filters) }));

  const link = (p: number) => `/portal/riwayat?${new URLSearchParams({ ...Object.fromEntries(filters), page: String(p) }).toString()}`;
  const hasFilter = Boolean(status || from || to);

  return (
    <div className="fit-page dash-stagger pb-6 lg:pb-0">
      <PageHeader
        eyebrow="Riwayat"
        title="Riwayat transaksi"
        intro="Semua sesi foto dari kiosk Anda. Kontak pelanggan tidak ditampilkan di sini."
        actions={<a href={`/portal/riwayat/export?${filters.toString()}`} className="btn inline-flex items-center gap-2 px-5 py-2.5 text-[13.5px]"><Icon name="download" className="h-4 w-4" />Unduh CSV</a>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[["Transaksi", String(h.total)], ["Berhasil dibayar", String(h.paidCount)], ["Pendapatan", formatRupiah(h.revenue)]].map(([label, value], i) => (
          <div key={label} className={`${i === 2 ? "glass-dark" : "glass"} flex items-baseline justify-between gap-3 rounded-[22px] px-5 py-4`}>
            <div className={`text-[13px] ${i === 2 ? "text-white/65" : "text-muted"}`}>{label}</div>
            <div className="font-display text-[22px] tracking-tight">{value}</div>
          </div>
        ))}
      </div>

      <section className="glass fit-panel">
        <form method="get" className="flex flex-wrap items-center gap-2.5 border-b border-[var(--card-edge)] px-4 py-3 md:px-5">
          <select name="status" defaultValue={status} aria-label="Status" className={input}>
            <option value="">Semua status</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-[13px] text-muted">Dari <input type="date" name="from" defaultValue={from} className={input} /></label>
          <label className="flex items-center gap-2 text-[13px] text-muted">Sampai <input type="date" name="to" defaultValue={to} className={input} /></label>
          <button type="submit" className="btn btn-primary px-5 py-2.5 text-[13.5px]">Terapkan</button>
          {hasFilter && <Link href="/portal/riwayat" className="px-2 text-[13px] text-muted underline underline-offset-4">Reset</Link>}
        </form>

        <div className="fit-scroll sticky-head dash-scroll">
          {h.items.length === 0 ? (
            <p className="p-8 text-center text-[14px] text-muted">Tidak ada transaksi untuk filter ini.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[11.5px] uppercase tracking-wider text-muted">
                <tr><th className="py-3 pl-4 pr-4 font-semibold md:pl-5">Waktu</th><th className="pr-4 font-semibold">Paket</th><th className="pr-4 font-semibold">Metode</th><th className="pr-4 font-semibold">Nominal</th><th className="pr-4 font-semibold md:pr-5">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-edge)]">
                {h.items.map((s) => {
                  const st = STATUS[s.paymentStatus] ?? { label: s.paymentStatus, tone: "bg-[var(--soft)] text-muted" };
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-[var(--soft)]">
                      <td className="whitespace-nowrap py-3 pl-4 pr-4 text-muted md:pl-5">{when(s.createdAt)}</td>
                      <td className="pr-4">
                        <div className="font-semibold">{s.packageName ?? "Paket dihapus"}{s.paymentPurpose === "additional_print" && <span className="ml-2 text-xs font-normal text-muted">cetak tambahan</span>}</div>
                        <div className="text-[12.5px] text-muted">{s.orientation === "landscape" ? "Landscape" : "Portrait"} · {s.photoCount} foto</div>
                      </td>
                      <td className="pr-4">{METHOD[s.paymentMethod] ?? s.paymentMethod}{s.voucherCode && <span className="ml-1 text-[12.5px] text-muted">({s.voucherCode})</span>}</td>
                      <td className="pr-4 font-semibold tabular-nums">{formatRupiah(s.totalAmount)}</td>
                      <td className="pr-4 md:pr-5"><span className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${st.tone}`}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--card-edge)] px-4 py-3 text-[13px] md:px-5">
          <span className="text-muted">Halaman {h.page} dari {Math.max(1, h.totalPages)} · {h.total} transaksi</span>
          <div className="flex gap-2">
            {page > 1 ? <Link href={link(page - 1)} prefetch className="btn inline-flex items-center gap-1 px-4 py-2"><Icon name="chevron-left" className="h-4 w-4" />Sebelumnya</Link> : <span className="btn pointer-events-none px-4 py-2 opacity-40">Sebelumnya</span>}
            {page < h.totalPages ? <Link href={link(page + 1)} prefetch className="btn inline-flex items-center gap-1 px-4 py-2">Berikutnya<Icon name="chevron-right" className="h-4 w-4" /></Link> : <span className="btn pointer-events-none px-4 py-2 opacity-40">Berikutnya</span>}
          </div>
        </div>
      </section>
    </div>
  );
}
