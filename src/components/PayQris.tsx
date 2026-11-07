"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkPayAction, type PayStatus } from "@/app/bayar/[orderId]/actions";

export type PayData = { orderId: string; plan: string; boothCount: number; periodDays: number; amount: number; status: PayStatus; dueAt: string; paymentMethod: string | null; qr: string | null };

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const pad = (n: number) => String(n).padStart(2, "0");

/** STUDIODO's own QRIS payment card: the amount, the QR, a countdown and live status (polls the API, which asks Midtrans). */
export function PayQris({ data, token }: { data: PayData; token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<PayStatus>(data.status);
  const [left, setLeft] = useState(() => Math.max(0, new Date(data.dueAt).getTime() - Date.now()));

  useEffect(() => {
    if (status !== "pending") return;
    const tick = setInterval(() => setLeft(Math.max(0, new Date(data.dueAt).getTime() - Date.now())), 1000);
    let stop = false;
    const poll = async () => {
      const s = await checkPayAction(data.orderId, token);
      if (!stop && s !== "pending") setStatus(s);
    };
    void poll();
    const t = setInterval(poll, 4000);
    return () => { stop = true; clearInterval(tick); clearInterval(t); };
  }, [status, data.orderId, data.dueAt, token]);

  useEffect(() => {
    if (status !== "paid") return;
    const t = setTimeout(() => router.push(`/portal/tagihan?status=selesai&order_id=${encodeURIComponent(data.orderId)}`), 3500);
    return () => clearTimeout(t);
  }, [status, data.orderId, router]);

  const expired = status === "expired" || (status === "pending" && left <= 0);
  const h = Math.floor(left / 3_600_000), m = Math.floor((left % 3_600_000) / 60_000), s = Math.floor((left % 60_000) / 1000);

  return (
    <div className="glass overflow-hidden p-0">
      <div className="px-7 pb-5 pt-7 text-center">
        <div className="text-[13px] text-muted">Bayar langganan {data.plan}</div>
        <div className="mt-1 font-display text-[40px] font-semibold leading-none tracking-tight">{rupiah(data.amount)}</div>
        <div className="mt-2 text-[13px] text-muted">{data.boothCount} booth · {data.periodDays} hari</div>
      </div>

      {status === "paid" ? (
        <div className="grid justify-items-center gap-3 border-t border-foreground/10 px-7 py-10 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#dff7ec] text-[#0f6b45]" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          <h1 className="font-display text-[22px] tracking-tight">Pembayaran diterima</h1>
          <p className="text-[14px] text-muted">Langganan Anda sudah aktif. Mengalihkan ke dashboard…</p>
          <Link href="/portal/tagihan?status=selesai" className="btn btn-primary mt-2 px-7 py-3 text-[15px]">Ke dashboard</Link>
        </div>
      ) : status === "failed" || expired ? (
        <div className="grid justify-items-center gap-3 border-t border-foreground/10 px-7 py-10 text-center">
          <h1 className="font-display text-[22px] tracking-tight">{status === "failed" ? "Pembayaran gagal" : "Waktu pembayaran habis"}</h1>
          <p className="text-[14px] text-muted">Buat pembayaran baru dari halaman booth dan langganan.</p>
          <Link href="/portal/booth" className="btn btn-primary mt-2 px-7 py-3 text-[15px]">Buat pembayaran baru</Link>
        </div>
      ) : (
        <div className="grid justify-items-center gap-4 border-t border-foreground/10 px-7 py-6">
          {data.qr ? (
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- QR drawn by the API as an SVG data URL */}
              <img src={data.qr} alt="Kode QRIS untuk membayar" width={248} height={248} className="h-[248px] w-[248px]" />
            </div>
          ) : (
            <p className="rounded-2xl bg-[#fff3d6] px-4 py-3 text-sm text-[#7a5a00]">Kode QRIS tidak tersedia. Hubungi admin STUDIODO.</p>
          )}
          <p className="text-center text-[14px] leading-relaxed text-muted">Buka aplikasi e-wallet atau m-banking apa pun, pilih <strong className="text-foreground">Scan QRIS</strong>, lalu pindai kode di atas.</p>
          <div className="flex items-center gap-2 rounded-full bg-foreground/[0.06] px-4 py-2 text-[13px]" role="status">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5a623]" aria-hidden="true" />
            Menunggu pembayaran · sisa <span className="font-semibold tabular-nums">{pad(h)}:{pad(m)}:{pad(s)}</span>
          </div>
          {data.qr && <a href={data.qr} download={`QRIS-${data.orderId}.svg`} className="text-[13px] font-semibold text-accent underline underline-offset-4">Unduh kode QR</a>}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-foreground/10 px-7 py-4 text-[12px] text-muted">
        <span>Invoice {data.orderId}</span>
        <Link href={`/invoice/${encodeURIComponent(data.orderId)}?t=${encodeURIComponent(token)}`} className="font-semibold text-accent underline underline-offset-4">Lihat invoice</Link>
      </div>
    </div>
  );
}
