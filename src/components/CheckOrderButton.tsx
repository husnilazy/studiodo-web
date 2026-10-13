"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import { checkOrderAction } from "@/app/portal/booth/actions";

/** "I paid but nothing changed": asks the gateway directly instead of waiting for a notification that may have been lost. */
export function CheckOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className="btn glass rounded-full! px-3.5 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50"
        onClick={() => start(async () => {
          const r = await checkOrderAction(orderId);
          setMessage(!r.ok ? r.error : r.data.result === "paid" ? "Pembayaran ditemukan — langganan sudah aktif." : r.data.result === "waiting" ? "Belum ada pembayaran yang masuk." : `Status: ${r.data.status}`);
        })}
      >
        {pending ? <><Spinner />Mengecek…</> : "Cek status pembayaran"}
      </button>
      {message && <p role="status" className="max-w-[260px] text-right text-[12px] text-muted">{message}</p>}
    </div>
  );
}
