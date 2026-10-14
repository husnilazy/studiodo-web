"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { checkOrderAction } from "@/app/portal/booth/actions";

/**
 * Buttons under the invoice (hidden when printing): pay, print/save PDF, copy the login-free link, back to billing.
 * While a signed-in tenant looks at a still-pending invoice it also asks the gateway every few seconds for a while —
 * so someone returning from the payment page sees "Lunas" appear without pressing anything.
 */
export function InvoiceActions({ orderId, status, payUrl, shareUrl, signedIn }: { orderId: string; status: string; payUrl: string | null; shareUrl: string | null; signedIn: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [checking, startCheck] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const pending = status === "pending";

  useEffect(() => {
    if (!signedIn || !pending) return;
    let tries = 0;
    const t = window.setInterval(async () => {
      if (document.hidden) return;
      if (++tries > 20) return window.clearInterval(t); // ~2.5 minutes, then leave it to the manual button
      const r = await checkOrderAction(orderId);
      if (r.ok && r.data.status !== "pending") { window.clearInterval(t); router.refresh(); }
    }, 8000);
    return () => window.clearInterval(t);
  }, [signedIn, pending, orderId, router]);

  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-wrap items-center justify-center gap-3 print:hidden">
      {pending && payUrl && <a href={payUrl} className="btn btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-[15px]"><Icon name="card" className="h-4 w-4" />Bayar sekarang</a>}
      {pending && signedIn && (
        <button type="button" disabled={checking} onClick={() => startCheck(async () => {
          const r = await checkOrderAction(orderId);
          if (!r.ok) return setNote(r.error);
          if (r.data.status !== "pending") router.refresh(); else setNote("Belum ada pembayaran yang masuk.");
        })} className="btn glass rounded-full! px-5 py-3.5 text-[14px] disabled:opacity-60">{checking ? <><Spinner />Mengecek…</> : "Saya sudah bayar, cek status"}</button>
      )}
      <button type="button" onClick={() => window.print()} className="btn glass inline-flex items-center gap-2 rounded-full! px-5 py-3.5 text-[14px]"><Icon name="download" className="h-4 w-4" />Cetak / simpan PDF</button>
      {shareUrl && (
        <button type="button" onClick={() => { void navigator.clipboard?.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }} className="btn glass inline-flex items-center gap-2 rounded-full! px-5 py-3.5 text-[14px]">
          <Icon name={copied ? "check" : "external"} className="h-4 w-4" />{copied ? "Tautan disalin" : "Salin tautan invoice"}
        </button>
      )}
      {signedIn && <Link href="/portal/tagihan" className="px-3 py-3.5 text-[14px] font-semibold text-muted hover:text-foreground">← Semua tagihan</Link>}
      {note && <p role="status" className="w-full text-center text-[13px] text-muted">{note}</p>}
    </div>
  );
}
