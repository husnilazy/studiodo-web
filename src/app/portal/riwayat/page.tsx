import Link from "next/link";
import { getSessionHistory } from "@/lib/portal";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: string }> = {
  success: { label: "Berhasil", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  pending: { label: "Menunggu", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  failed: { label: "Gagal", tone: "bg-[#ffe3e3] text-[#a12626]" },
  expired: { label: "Kedaluwarsa", tone: "bg-foreground/[0.06] text-muted" },
};
const METHOD: Record<string, string> = { qris: "QRIS", voucher: "Voucher", cash: "Tunai" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const when = (v: string) => new Date(v).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Riwayat</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Riwayat transaksi</h1>
        <p className="mt-2 text-[15px] text-muted">Semua sesi foto dari kiosk Anda. Kontak pelanggan tidak ditampilkan di sini.</p>
      </div>

      <form method="get" className="glass flex flex-wrap items-end gap-4 p-6">
        <label className="flex flex-col gap-1.5 text-sm text-muted">Status
          <select name="status" defaultValue={status} className="rounded-xl border border-foreground/15 bg-transparent px-3 py-2.5 text-foreground">
            <option value="">Semua</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">Dari
          <input type="date" name="from" defaultValue={from} className="rounded-xl border border-foreground/15 bg-transparent px-3 py-2.5 text-foreground" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">Sampai
          <input type="date" name="to" defaultValue={to} className="rounded-xl border border-foreground/15 bg-transparent px-3 py-2.5 text-foreground" />
        </label>
        <button type="submit" className="btn btn-primary px-6 py-3">Terapkan</button>
        {(status || from || to) && <Link href="/portal/riwayat" className="px-2 py-3 text-sm text-muted underline underline-offset-4">Reset</Link>}
        <a href={`/portal/riwayat/export?${filters.toString()}`} className="btn ml-auto px-6 py-3">Unduh CSV</a>
      </form>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass p-7"><div className="text-sm text-muted">Transaksi</div><div className="mt-2 font-display text-4xl tracking-tight">{h.total}</div></div>
        <div className="glass p-7"><div className="text-sm text-muted">Berhasil dibayar</div><div className="mt-2 font-display text-4xl tracking-tight">{h.paidCount}</div></div>
        <div className="glass p-7"><div className="text-sm text-muted">Pendapatan</div><div className="mt-2 font-display text-4xl tracking-tight">{formatRupiah(h.revenue)}</div></div>
      </div>

      <section className="glass overflow-x-auto p-4 md:p-8">
        {h.items.length === 0 ? (
          <p className="p-4 text-[15px] text-muted">Tidak ada transaksi untuk filter ini.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="text-[12px] uppercase tracking-wider text-muted">
              <tr><th className="py-2 pr-4">Waktu</th><th className="pr-4">Paket</th><th className="pr-4">Metode</th><th className="pr-4">Nominal</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-foreground/[0.08]">
              {h.items.map((s) => {
                const st = STATUS[s.paymentStatus] ?? { label: s.paymentStatus, tone: "bg-foreground/[0.06] text-muted" };
                return (
                  <tr key={s.id}>
                    <td className="py-3.5 pr-4 text-muted">{when(s.createdAt)}</td>
                    <td className="pr-4">
                      <div className="font-semibold">{s.packageName ?? "Paket dihapus"}{s.paymentPurpose === "additional_print" && <span className="ml-2 text-xs font-normal text-muted">cetak tambahan</span>}</div>
                      <div className="text-[13px] text-muted">{s.orientation === "landscape" ? "Landscape" : "Portrait"} · {s.photoCount} foto</div>
                    </td>
                    <td className="pr-4">{METHOD[s.paymentMethod] ?? s.paymentMethod}{s.voucherCode && <span className="ml-1 text-[13px] text-muted">({s.voucherCode})</span>}</td>
                    <td className="pr-4 font-semibold">{formatRupiah(s.totalAmount)}</td>
                    <td><span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.tone}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {h.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={link(page - 1)} className="btn px-5 py-2.5">← Sebelumnya</Link> : <span />}
            <span className="text-muted">Halaman {h.page} dari {h.totalPages}</span>
            {page < h.totalPages ? <Link href={link(page + 1)} className="btn px-5 py-2.5">Berikutnya →</Link> : <span />}
          </div>
        )}
      </section>
    </div>
  );
}
