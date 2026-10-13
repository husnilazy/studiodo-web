import Link from "next/link";
import { CheckOrderButton } from "@/components/CheckOrderButton";
import { getOrders, getSummary } from "@/lib/portal";
import { formatDate, formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  paid: { label: "Lunas", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  pending: { label: "Menunggu pembayaran", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  failed: { label: "Gagal", tone: "bg-[#ffe3e3] text-[#a12626]" },
  expired: { label: "Kedaluwarsa", tone: "bg-foreground/[0.06] text-muted" },
};

export default async function TagihanPage({ searchParams }: PageProps<"/portal/tagihan">) {
  const sp = await searchParams;
  const [summary, orders] = await Promise.all([getSummary(), getOrders()]);
  const lic = summary.licenses;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Tagihan</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Riwayat pembayaran</h1>
        <p className="mt-2 text-[15px] text-muted">
          Paket saat ini: <strong className="text-foreground">{summary.tenant.planName}</strong>
          {lic ? <> · {lic.activeKeys} booth ({lic.paid} berlangganan{lic.trial > 0 ? `, ${lic.trial} trial` : ""}{lic.unpaid > 0 ? `, ${lic.unpaid} belum bayar` : ""})</> : null}
        </p>
        <Link href="/portal/booth" className="btn btn-primary mt-5 px-7 py-3.5">Berlangganan / perpanjang booth</Link>
      </div>

      {sp.status === "selesai" && (
        <p role="status" className="rounded-2xl bg-[#dff7ec] px-5 py-4 text-sm text-[#0f6b45]">
          Terima kasih! Pembayaran sedang diproses. Masa aktif booth diperbarui otomatis begitu pembayaran terkonfirmasi (biasanya beberapa menit). Bila belum berubah, tekan &ldquo;Cek status pembayaran&rdquo; pada pesanan di bawah.
        </p>
      )}

      <section className="glass p-8">
        <h2 className="mb-4 font-display text-xl tracking-tight">Pesanan online</h2>
        {orders.length === 0 ? (
          <p className="text-[15px] text-muted">Belum ada transaksi.</p>
        ) : (
          <ul className="divide-y divide-foreground/[0.08]">
            {orders.map((o) => {
              const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
              return (
                <li key={o.orderId} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-[15px]">
                  <div>
                    <div className="font-semibold">{o.planName} · {o.boothCount ?? 1} booth · {o.periodDays} hari{o.discountPercent ? <span className="ml-2 text-[13px] font-normal text-[#0f6b45]">diskon {o.discountPercent}%</span> : null}</div>
                    <div className="text-[13px] text-muted">{o.orderId} · {formatDate(o.createdAt)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold">{formatRupiah(o.amount)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.tone}`}>{st.label}</span>
                    {o.status === "pending" && <CheckOrderButton orderId={o.orderId} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="glass p-8">
        <h2 className="mb-4 font-display text-xl tracking-tight">Pembayaran tercatat</h2>
        {summary.recentPayments.length === 0 ? (
          <p className="text-[15px] text-muted">Belum ada pembayaran langganan.</p>
        ) : (
          <ul className="divide-y divide-foreground/[0.08]">
            {summary.recentPayments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3.5 text-[15px]">
                <span>{p.planName ?? "Langganan"} · {p.periodDays} hari</span>
                <span className="text-muted">{formatDate(p.createdAt)} · <span className="font-semibold text-foreground">{formatRupiah(p.amount)}</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
