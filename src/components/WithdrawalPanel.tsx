"use client";

import { useState, useTransition } from "react";
import type { WithdrawalsData } from "@/lib/portalTypes";
import { formatDate, formatRupiah } from "@/lib/format";
import { cancelWithdrawalAction, requestWithdrawalAction } from "@/app/portal/saldo/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-3.5 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Menunggu diproses", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  processing: { label: "Sedang ditransfer", tone: "bg-[#eef0ff] text-[#3b3fa8]" },
  paid: { label: "Sudah ditransfer", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  rejected: { label: "Ditolak / dibatalkan", tone: "bg-[#ffe3e3] text-[#a12626]" },
};

export function WithdrawalPanel({ data }: { data: WithdrawalsData }) {
  const { balance, items, lastAccount } = data;
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState(lastAccount?.bankName ?? "");
  const [number, setNumber] = useState(lastAccount?.accountNumber ?? "");
  const [holder, setHolder] = useState(lastAccount?.accountName ?? "");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  if (balance.settlement !== "platform") {
    return (
      <div className="glass max-w-[680px] p-8 text-[15px] leading-relaxed text-muted">
        Akun Anda menerima pembayaran QRIS <strong className="text-foreground">langsung di akun Xendit/DOKU Anda sendiri</strong>, jadi tidak ada saldo yang perlu ditarik di sini.
        Ingin STUDIODO yang menampung pembayaran dan Anda tinggal menarik saldonya? Hubungi tim STUDIODO untuk mengaktifkannya.
      </div>
    );
  }

  const submit = () => {
    setMessage(null);
    start(async () => {
      const r = await requestWithdrawalAction({ amount: Number(amount), bankName: bank, accountNumber: number, accountName: holder, note });
      if (r.ok) { setAmount(""); setNote(""); setMessage({ tone: "ok", text: "Permintaan penarikan dikirim. Tim STUDIODO akan mentransfer dan memperbarui statusnya di sini." }); }
      else setMessage({ tone: "error", text: r.error });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-6"><div className="text-sm text-muted">Saldo tersedia</div><div className="mt-2 font-display text-3xl tracking-tight">{formatRupiah(balance.available)}</div><div className="mt-1 text-[12px] text-muted">Minimal tarik {formatRupiah(balance.rules.minAmount)}</div></div>
        <div className="glass p-6"><div className="text-sm text-muted">Sedang diproses</div><div className="mt-2 font-display text-3xl tracking-tight">{formatRupiah(balance.pending)}</div></div>
        <div className="glass p-6"><div className="text-sm text-muted">Total sudah ditarik</div><div className="mt-2 font-display text-3xl tracking-tight">{formatRupiah(balance.withdrawn)}</div></div>
      </div>
      <p className="text-[13px] text-muted">
        Pendapatan QRIS {formatRupiah(balance.grossIncome)} ({balance.paymentCount} transaksi) − biaya layanan STUDIODO {formatRupiah(balance.platformFee)} ({balance.rules.feePercent}%).
        {balance.rules.flatFee > 0 ? ` Biaya transfer per penarikan ${formatRupiah(balance.rules.flatFee)}.` : ""}
      </p>

      <section className="glass grid gap-4 p-7">
        <h2 className="font-display text-xl tracking-tight">Tarik saldo</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">Nominal (Rp)
            <div className="flex gap-2"><input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className={field} /><button type="button" className={smallBtn} onClick={() => setAmount(String(balance.available))}>Semua</button></div>
          </label>
          <label className="grid gap-2 text-sm font-medium">Bank / e-wallet<input value={bank} onChange={(e) => setBank(e.target.value)} maxLength={60} className={field} placeholder="mis. BCA, DANA" /></label>
          <label className="grid gap-2 text-sm font-medium">Nomor rekening<input value={number} onChange={(e) => setNumber(e.target.value)} maxLength={40} inputMode="numeric" className={field} /></label>
          <label className="grid gap-2 text-sm font-medium">Nama pemilik rekening<input value={holder} onChange={(e) => setHolder(e.target.value)} maxLength={100} className={field} /></label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">Catatan (opsional)<input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className={field} /></label>
        </div>
        {message && <p role={message.tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${message.tone === "ok" ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#ffe3e3] text-[#a12626]"}`}>{message.text}</p>}
        <div><button type="button" disabled={pending || !amount || !bank || !number || !holder} onClick={submit} className="btn btn-primary px-7 py-3 disabled:opacity-60">{pending ? "Mengirim…" : "Ajukan penarikan"}</button></div>
      </section>

      <section className="glass p-7">
        <h2 className="mb-2 font-display text-xl tracking-tight">Riwayat penarikan</h2>
        {items.length === 0 ? <p className="text-[15px] text-muted">Belum ada penarikan.</p> : (
          <ul className="divide-y divide-foreground/[0.08]">
            {items.map((w) => {
              const st = STATUS[w.status] ?? STATUS.pending;
              return (
                <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-[15px]">
                  <div>
                    <div className="font-semibold">{formatRupiah(Number(w.amount))} <span className="text-[13px] font-normal text-muted">→ diterima {formatRupiah(Number(w.netAmount))}</span></div>
                    <div className="text-[13px] text-muted">{w.bankName} {w.accountNumber} · {formatDate(w.requestedAt)}{w.transferReference ? ` · ref ${w.transferReference}` : ""}</div>
                    {w.adminNote && <div className="text-[13px] text-muted">Catatan: {w.adminNote}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.tone}`}>{st.label}</span>
                    {w.status === "pending" && <CancelButton id={w.id} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function CancelButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return <button type="button" disabled={pending} className={smallBtn} onClick={() => window.confirm("Batalkan permintaan penarikan ini?") && start(async () => { await cancelWithdrawalAction(id); })}>{pending ? "…" : "Batalkan"}</button>;
}
