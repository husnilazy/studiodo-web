"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { formatRupiah } from "@/lib/format";
import { METHOD_LABEL, type PosOrder, type PosReport } from "@/lib/posTypes";
import { posAction } from "@/app/portal/kasir/actions";

const field = "h-11 w-full rounded-2xl border-0 bg-[var(--soft)] px-4 text-[14.5px] text-foreground outline-none focus:ring-2 focus:ring-accent/40";
const card = "rounded-[22px] bg-[var(--card)] ring-1 ring-[var(--card-edge)]";
const when = (v: string) => new Date(v).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const STATUS: Record<string, { label: string; tone: string }> = {
  paid: { label: "Lunas", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  partial_refund: { label: "Refund sebagian", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  refunded: { label: "Di-refund", tone: "bg-[#ffe3e3] text-[#a12626]" },
};

export function OrdersPanel({ orders, report, hasPin }: { orders: PosOrder[]; report: PosReport; hasPin: boolean }) {
  const [open, setOpen] = useState<PosOrder | null>(null);
  const max = Math.max(1, ...report.daily.map((d) => d.sales));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Penjualan 14 hari" value={formatRupiah(report.sales)} />
        <Stat label="Refund" value={formatRupiah(report.refunds)} />
        <Stat label="Bersih" value={formatRupiah(report.net)} accent />
        <Stat label="Rata-rata / transaksi" value={formatRupiah(report.average)} sub={`${report.orders} transaksi`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className={`${card} p-5`}>
          <h2 className="mb-3 font-display text-[17px] tracking-tight">Penjualan harian</h2>
          <div className="flex h-[140px] items-end gap-1.5">
            {report.daily.map((d, i) => (
              <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${d.date}: ${formatRupiah(d.sales)} (${d.orders} transaksi)`}>
                <div className="dash-bar w-full rounded-t-md bg-gradient-to-t from-accent to-accent-soft" style={{ height: `${Math.max(d.sales > 0 ? 6 : 2, (d.sales / max) * 100)}%`, ["--i" as string]: i, opacity: d.sales > 0 ? 1 : 0.25 }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted"><span>{report.daily[0]?.date.slice(5)}</span><span>{report.daily.at(-1)?.date.slice(5)}</span></div>
        </section>
        <section className={`${card} p-5`}>
          <h2 className="mb-3 font-display text-[17px] tracking-tight">Terlaris</h2>
          {report.topItems.length === 0 ? <p className="py-6 text-center text-[13px] text-muted">Belum ada penjualan.</p> : (
            <ul className="flex flex-col gap-2">
              {report.topItems.slice(0, 5).map((t) => <li key={t.name} className="flex items-center justify-between gap-3 text-[13.5px]"><span className="truncate">{t.name} <span className="text-muted">×{t.qty}</span></span><span className="tabular-nums text-muted">{formatRupiah(t.revenue)}</span></li>)}
            </ul>
          )}
          {Object.keys(report.byMethod).length > 0 && <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--card-edge)] pt-3">{Object.entries(report.byMethod).map(([m, v]) => <span key={m} className="rounded-full bg-[var(--soft)] px-3 py-1 text-[12px] text-muted">{METHOD_LABEL[m] ?? m} <b className="text-foreground">{formatRupiah(v)}</b></span>)}</div>}
        </section>
      </div>

      <section className={`${card} p-5`}>
        <h2 className="mb-3 font-display text-[17px] tracking-tight">Transaksi terbaru</h2>
        {orders.length === 0 ? <p className="py-8 text-center text-[13.5px] text-muted">Belum ada transaksi kasir.</p> : (
          <ul className="divide-y divide-[var(--card-edge)]">
            {orders.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => setOpen(o)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 py-3 text-left transition hover:bg-[var(--soft)] sm:px-2">
                  <span className="w-[150px] font-mono text-[12.5px]">{o.orderNumber}</span>
                  <span className="text-[12.5px] text-muted">{when(o.createdAt)}</span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-muted">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>
                  <span className="text-[12px] text-muted">{METHOD_LABEL[o.paymentMethod]}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${STATUS[o.status].tone}`}>{STATUS[o.status].label}</span>
                  <span className="w-[100px] text-right text-[14px] font-semibold tabular-nums">{formatRupiah(o.total)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {open && <OrderDialog order={open} hasPin={hasPin} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return <div className={`${card} p-4`}><div className="text-[12px] text-muted">{label}</div><div className={`mt-1 font-display text-[22px] font-semibold tracking-tight tabular-nums ${accent ? "text-accent" : ""}`}>{value}</div>{sub && <div className="text-[12px] text-muted">{sub}</div>}</div>;
}

function OrderDialog({ order, hasPin, onClose }: { order: PosOrder; hasPin: boolean; onClose: () => void }) {
  const router = useRouter();
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const refundable = order.status !== "refunded";
  const ratio = order.subtotal > 0 ? order.total / order.subtotal : 1;
  const amount = Math.round(Object.entries(picked).reduce((s, [i, q]) => s + order.items[Number(i)].unitPrice * q, 0) * ratio);

  const submit = () => {
    setError(null);
    start(async () => {
      const items = Object.entries(picked).filter(([, q]) => q > 0).map(([index, qty]) => ({ index: Number(index), qty }));
      const r = await posAction<{ amount: number; voucher: string }>("POST", `/api/pos/orders/${order.id}/refund`, { items, reason, pin });
      if (!r.ok) return setError(r.error);
      setNote(`Refund ${formatRupiah(r.data.amount)} tercatat.${r.data.voucher === "deactivated" ? " Kode kiosk dinonaktifkan." : r.data.voucher === "already_used" ? " Perhatian: kode kiosk sudah dipakai pelanggan." : ""}`);
      router.refresh();
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={`Transaksi ${order.orderNumber}`}>
      <div className="w-full max-w-[520px] rounded-[26px] bg-[var(--card)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><div className="font-mono text-[13px]">{order.orderNumber}</div><div className="text-[12.5px] text-muted">{when(order.createdAt)} · {METHOD_LABEL[order.paymentMethod]}{order.customerName ? ` · ${order.customerName}` : ""}</div></div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--soft)]">✕</button>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-[var(--soft)] px-3.5 py-2.5 text-[13.5px]">
              <span className="min-w-0 flex-1 truncate">{it.qty}× {it.name}</span>
              <span className="tabular-nums text-muted">{formatRupiah(it.unitPrice * it.qty)}</span>
              {refundable && !note && <select aria-label={`Jumlah refund ${it.name}`} value={picked[i] ?? 0} onChange={(e) => setPicked({ ...picked, [i]: Number(e.target.value) })} className="h-8 rounded-full border-0 bg-[var(--card)] px-2 text-[12.5px] ring-1 ring-[var(--card-edge)]">{Array.from({ length: it.qty + 1 }, (_, q) => <option key={q} value={q}>{q === 0 ? "—" : `refund ${q}`}</option>)}</select>}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between text-[14px]"><span className="text-muted">Total{order.discount > 0 ? ` (diskon ${formatRupiah(order.discount)})` : ""}</span><b className="tabular-nums">{formatRupiah(order.total)}</b></div>
        {order.refundedAmount > 0 && <div className="text-right text-[12.5px] text-[#a12626]">Sudah di-refund {formatRupiah(order.refundedAmount)}</div>}
        {order.kioskVoucherCode && <div className="mt-2 text-[12.5px] text-muted">Kode kiosk: <b className="font-mono text-foreground">{order.kioskVoucherCode}</b></div>}

        {note ? <div className="mt-4 rounded-2xl bg-[#dff7ec] p-3.5 text-[13.5px] text-[#0f6b45]">{note}</div> : refundable && (
          <div className="mt-4 flex flex-col gap-2.5 border-t border-[var(--card-edge)] pt-4">
            <h3 className="text-[14px] font-semibold">Refund{amount > 0 ? ` · ${formatRupiah(amount)}` : ""}</h3>
            <input className={field} placeholder="Alasan refund" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} />
            {hasPin && <input className={field} type="password" inputMode="numeric" autoComplete="off" placeholder="PIN supervisor" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} maxLength={8} />}
            {error && <div role="alert" className="text-[13px] text-[#a12626]">{error}</div>}
            <button type="button" disabled={pending || amount <= 0 || !reason.trim()} onClick={submit} className="btn btn-primary px-6 py-3 text-[14.5px] disabled:opacity-50">{pending && <Spinner />}Proses refund</button>
          </div>
        )}
        <div className="mt-4 flex justify-end"><Link href={`/struk-kasir/${order.id}`} target="_blank" className="text-[13px] font-semibold text-accent hover:underline">Lihat / cetak struk →</Link></div>
      </div>
    </div>
  );
}
