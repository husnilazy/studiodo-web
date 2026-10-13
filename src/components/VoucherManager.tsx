"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import type { VoucherRow } from "@/lib/portalTypes";
import { formatDate, formatRupiah } from "@/lib/format";
import { bulkVouchersAction, createVoucherAction, deleteVoucherAction, setVoucherActiveAction, type VoucherInput } from "@/app/portal/voucher/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-3.5 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

function discountLabel(v: VoucherRow) {
  if (v.voucherType === "cash") return `Voucher tunai ${formatRupiah(Number(v.cashAmount ?? 0))}`;
  if (v.discountType === "free") return "Gratis";
  if (v.discountType === "percent") return `Diskon ${Number(v.discountValue)}%`;
  return `Potongan ${formatRupiah(Number(v.discountValue))}`;
}

function status(v: VoucherRow): { text: string; tone: string } {
  if (!v.active) return { text: "Nonaktif", tone: "bg-foreground/[0.08] text-muted" };
  if (v.expiresAt && new Date(v.expiresAt) < new Date()) return { text: "Kedaluwarsa", tone: "bg-[#ffe3e3] text-[#a12626]" };
  if (v.maxUses !== null && v.usedCount >= v.maxUses) return { text: "Kuota habis", tone: "bg-[#fff3d6] text-[#7a5a00]" };
  return { text: "Aktif", tone: "bg-[#dff7ec] text-[#0f6b45]" };
}

function VoucherRowItem({ v }: { v: VoucherRow }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const st = status(v);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => { setError(null); start(async () => { const r = await fn(); if (!r.ok) setError(r.error ?? "Gagal"); }); };
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3.5">
      <div>
        <div className="flex items-center gap-2"><code className="text-[15px] font-semibold">{v.code}</code><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${st.tone}`}>{st.text}</span></div>
        <div className="text-[13px] text-muted">{discountLabel(v)} · dipakai {v.usedCount}{v.maxUses !== null ? ` dari ${v.maxUses}` : "×"}{v.expiresAt ? ` · sampai ${formatDate(v.expiresAt)}` : ""}</div>
        {error && <div role="alert" className="mt-1 text-[13px] text-[#a12626]">{error}</div>}
      </div>
      <div className="flex gap-2">
        {v.voucherType !== "cash" && <button type="button" disabled={pending} className={smallBtn} onClick={() => run(() => setVoucherActiveAction(v.id, !v.active))}>{v.active ? "Nonaktifkan" : "Aktifkan"}</button>}
        <button type="button" disabled={pending} className={`${smallBtn} hover:!text-[#a12626]`} onClick={() => window.confirm(`Hapus voucher ${v.code}?`) && run(() => deleteVoucherAction(v.id))}>Hapus</button>
      </div>
    </li>
  );
}

type Draft = { code: string; discountType: VoucherInput["discountType"]; discountValue: string; maxUses: string; expiresAt: string; count: string; prefix: string };
const EMPTY: Draft = { code: "", discountType: "percent", discountValue: "10", maxUses: "", expiresAt: "", count: "20", prefix: "PROMO" };

export function VoucherManager({ vouchers, report }: { vouchers: VoucherRow[]; report: { totalRedemptions: number; totalDiscountGiven: number; totalRevenueAfterDiscount: number } }) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  const input = (): VoucherInput => ({ code: d.code, discountType: d.discountType, discountValue: Number(d.discountValue) || 0, maxUses: d.maxUses.trim() ? Number(d.maxUses) : null, expiresAt: d.expiresAt || null });
  const submit = () => {
    setError(null);
    setGenerated(null);
    start(async () => {
      if (mode === "single") {
        const r = await createVoucherAction(input());
        if (!r.ok) setError(r.error); else setD((cur) => ({ ...cur, code: "" }));
      } else {
        const r = await bulkVouchersAction({ ...input(), count: Number(d.count), codePrefix: d.prefix });
        if (!r.ok) setError(r.error); else setGenerated(r.data);
      }
    });
  };

  return (
    <div className="fit-page flex-1">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass flex items-baseline justify-between gap-3 rounded-[22px] px-5 py-4"><div className="text-[13px] text-muted">Voucher dipakai</div><div className="font-display text-[22px] tracking-tight">{report.totalRedemptions}</div></div>
        <div className="glass flex items-baseline justify-between gap-3 rounded-[22px] px-5 py-4"><div className="text-[13px] text-muted">Diskon diberikan</div><div className="font-display text-[22px] tracking-tight">{formatRupiah(report.totalDiscountGiven)}</div></div>
        <div className="glass-dark flex items-baseline justify-between gap-3 rounded-[22px] px-5 py-4"><div className="text-[13px] text-white/65">Pendapatan setelah diskon</div><div className="font-display text-[22px] tracking-tight">{formatRupiah(report.totalRevenueAfterDiscount)}</div></div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="glass fit-panel">
        <div className="fit-scroll dash-scroll p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl tracking-tight">Buat voucher</h2>
          <div role="radiogroup" aria-label="Jenis pembuatan" className="inline-flex rounded-full border border-foreground/10 bg-foreground/[0.04] p-1 text-[13px] font-semibold">
            {([["single", "Satu kode"], ["bulk", "Banyak kode sekaligus"]] as const).map(([v, l]) => (
              <button key={v} type="button" role="radio" aria-checked={mode === v} onClick={() => setMode(v)} className={`rounded-full px-4 py-1.5 transition ${mode === v ? "bg-foreground text-[var(--on-foreground)] shadow-sm" : "text-muted"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {mode === "single" ? (
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">Kode
              <input value={d.code} onChange={(e) => set("code", e.target.value.toUpperCase())} maxLength={40} className={field} placeholder="mis. HEMAT20" />
            </label>
          ) : (
            <>
              <label className="grid gap-2 text-sm font-medium">Awalan kode
                <input value={d.prefix} onChange={(e) => set("prefix", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} maxLength={12} className={field} />
              </label>
              <label className="grid gap-2 text-sm font-medium">Jumlah kode
                <input type="number" min={1} max={200} value={d.count} onChange={(e) => set("count", e.target.value)} className={field} />
              </label>
            </>
          )}
          <label className="grid gap-2 text-sm font-medium">Jenis
            <select value={d.discountType} onChange={(e) => set("discountType", e.target.value as Draft["discountType"])} className={field}>
              <option value="percent">Diskon persen</option><option value="fixed">Potongan rupiah</option><option value="free">Gratis</option>
            </select>
          </label>
          {d.discountType !== "free" && (
            <label className="grid gap-2 text-sm font-medium">{d.discountType === "percent" ? "Diskon (%)" : "Potongan (Rp)"}
              <input type="number" min={0} max={d.discountType === "percent" ? 100 : undefined} value={d.discountValue} onChange={(e) => set("discountValue", e.target.value)} className={field} />
            </label>
          )}
          <label className="grid gap-2 text-sm font-medium">Batas pemakaian <span className="font-normal text-muted">(kosong = tanpa batas)</span>
            <input type="number" min={1} value={d.maxUses} onChange={(e) => set("maxUses", e.target.value)} className={field} />
          </label>
          <label className="grid gap-2 text-sm font-medium">Berlaku sampai <span className="font-normal text-muted">(opsional)</span>
            <input type="date" value={d.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={field} />
          </label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
        {generated && (
          <div role="status" className="mt-4 rounded-2xl bg-[#dff7ec] p-4 text-sm text-[#0f6b45]">
            <div className="font-semibold">{generated.length} kode dibuat</div>
            <textarea readOnly rows={Math.min(8, generated.length)} value={generated.join("\n")} className="mt-2 w-full rounded-xl bg-white/70 p-3 font-mono text-xs text-[#0b1020]" />
            <button type="button" className={`${smallBtn} mt-2`} onClick={() => { void navigator.clipboard?.writeText(generated.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Tersalin!" : "Salin semua"}</button>
          </div>
        )}
        <button type="button" disabled={pending || (mode === "single" && !d.code.trim())} onClick={submit} className="btn btn-primary mt-5 px-7 py-3 disabled:opacity-60">{pending ? <><Spinner />Membuat…</> : mode === "single" ? "Buat voucher" : "Buat kode"}</button>
        </div>
      </section>

      <section className="glass fit-panel">
        <h2 className="border-b border-[var(--card-edge)] px-6 py-4 font-display text-lg tracking-tight">Semua voucher ({vouchers.length})</h2>
        <div className="fit-scroll dash-scroll px-6">
        {vouchers.length === 0 ? <p className="py-6 text-[15px] text-muted">Belum ada voucher.</p> : (
          <ul className="divide-y divide-[var(--card-edge)]">
            {[...vouchers].reverse().map((v) => <VoucherRowItem key={`${v.id}-${v.active}`} v={v} />)}
          </ul>
        )}
        </div>
      </section>
      </div>
    </div>
  );
}
