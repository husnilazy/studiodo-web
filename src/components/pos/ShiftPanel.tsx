"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { formatRupiah } from "@/lib/format";
import { METHOD_LABEL, type PosShift } from "@/lib/posTypes";
import { posAction } from "@/app/portal/kasir/actions";

const field = "h-11 w-full rounded-2xl border-0 bg-[var(--soft)] px-4 text-[14.5px] text-foreground outline-none focus:ring-2 focus:ring-accent/40";
const card = "rounded-[22px] bg-[var(--card)] ring-1 ring-[var(--card-edge)]";
const when = (v: string) => new Date(v).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

function Breakdown({ s }: { s: PosShift }) {
  return (
    <dl className="grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2">
      <Line label="Modal awal" value={formatRupiah(s.openingCash)} />
      <Line label={`Transaksi (${s.orderCount})`} value={formatRupiah(s.salesTotal)} />
      {Object.entries(s.salesByMethod).filter(([, v]) => v > 0).map(([m, v]) => <Line key={m} label={`· ${METHOD_LABEL[m] ?? m}`} value={formatRupiah(v)} muted />)}
      <Line label="Refund" value={s.refundTotal > 0 ? `-${formatRupiah(s.refundTotal)}` : formatRupiah(0)} />
      <Line label="Seharusnya ada di laci" value={formatRupiah(s.expectedCash)} bold />
    </dl>
  );
}
function Line({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return <div className={`flex items-center justify-between gap-3 ${muted ? "text-muted" : ""}`}><dt className={bold ? "font-semibold" : "text-muted"}>{label}</dt><dd className={`tabular-nums ${bold ? "font-semibold" : ""}`}>{value}</dd></div>;
}

export function ShiftPanel({ current, history }: { current: PosShift | null; history: PosShift[] }) {
  const router = useRouter();
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState<PosShift | null>(null);
  const [pending, start] = useTransition();
  const diff = current && counted !== "" ? Number(counted) - current.expectedCash : null;

  const close = () => {
    setError(null);
    start(async () => {
      const r = await posAction<PosShift>("POST", "/api/pos/shifts/close", { countedCash: Number(counted), note });
      if (!r.ok) return setError(r.error);
      setClosed(r.data); setCounted(""); setNote("");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <section className={`${card} flex flex-col gap-4 p-6`}>
        {closed && (
          <div className="rounded-2xl bg-[#dff7ec] p-4 text-[14px] text-[#0f6b45]">
            Shift <b>{closed.cashierName}</b> ditutup. {closed.difference === 0 ? "Kas pas, tidak ada selisih." : closed.difference! > 0 ? `Lebih ${formatRupiah(closed.difference!)}.` : `Kurang ${formatRupiah(-closed.difference!)}.`}
          </div>
        )}
        {!current ? (
          <>
            <h2 className="font-display text-[20px] tracking-tight">Tidak ada shift berjalan</h2>
            <p className="text-[14px] leading-relaxed text-muted">Buka shift baru dari halaman Kasir untuk mulai menerima transaksi.</p>
            <Link href="/portal/kasir" className="btn btn-primary self-start px-6 py-3 text-[14.5px]">Ke halaman kasir</Link>
          </>
        ) : (
          <>
            <div>
              <div className="eyebrow">Shift berjalan</div>
              <h2 className="mt-1 font-display text-[22px] tracking-tight">{current.cashierName}</h2>
              <p className="text-[13px] text-muted">dibuka {when(current.openedAt)}</p>
            </div>
            <Breakdown s={current} />
            <div className="border-t border-[var(--card-edge)] pt-4">
              <h3 className="text-[14.5px] font-semibold">Tutup shift</h3>
              <p className="mt-0.5 text-[13px] text-muted">Hitung uang tunai di laci, lalu isi jumlahnya. Selisih dengan angka di atas dicatat di laporan.</p>
              <div className="mt-3 flex flex-col gap-2.5">
                <input className={field} inputMode="numeric" placeholder="Uang tunai di laci (Rp)" value={counted} onChange={(e) => setCounted(e.target.value.replace(/\D/g, ""))} />
                {diff !== null && <div className={`text-[13.5px] font-semibold ${diff === 0 ? "text-[#0f6b45]" : "text-[#a12626]"}`}>{diff === 0 ? "Pas, tidak ada selisih" : diff > 0 ? `Lebih ${formatRupiah(diff)}` : `Kurang ${formatRupiah(-diff)}`}</div>}
                <input className={field} placeholder="Catatan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
                {error && <div role="alert" className="text-[13px] text-[#a12626]">{error}</div>}
                <button type="button" disabled={pending || counted === ""} onClick={() => window.confirm("Tutup shift sekarang? Transaksi baru butuh shift baru.") && close()} className="btn btn-primary px-6 py-3.5 text-[14.5px] disabled:opacity-50">{pending && <Spinner />}Tutup shift</button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className={`${card} flex flex-col gap-3 p-6`}>
        <h2 className="font-display text-[20px] tracking-tight">Riwayat shift</h2>
        {history.length === 0 ? <p className="py-8 text-center text-[13.5px] text-muted">Belum ada shift yang ditutup.</p> : (
          <ul className="flex max-h-[560px] flex-col gap-2.5 overflow-auto pr-1">
            {history.map((s) => (
              <li key={s.id} className="rounded-2xl bg-[var(--soft)] p-4">
                <div className="flex items-baseline justify-between gap-3"><span className="text-[14.5px] font-semibold">{s.cashierName}</span><span className="text-[12px] text-muted">{when(s.openedAt)} – {s.closedAt ? when(s.closedAt) : ""}</span></div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
                  <span>{s.orderCount} transaksi</span><span>{formatRupiah(s.salesTotal)}</span>
                  <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${s.difference === 0 ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#ffe3e3] text-[#a12626]"}`}>{s.difference === 0 ? "Kas pas" : (s.difference ?? 0) > 0 ? `Lebih ${formatRupiah(s.difference ?? 0)}` : `Kurang ${formatRupiah(-(s.difference ?? 0))}`}</span>
                </div>
                {s.note && <p className="mt-1.5 text-[12.5px] text-muted">“{s.note}”</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
