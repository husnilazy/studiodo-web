"use client";

import { useState, type FormEvent } from "react";
import { submitTenantApplication } from "@/lib/api";

const businessTypes = [
  { value: "photobooth_rental", label: "Sewa photobooth" },
  { value: "event_organizer", label: "Event organizer" },
  { value: "studio", label: "Studio foto" },
  { value: "other", label: "Lainnya" },
];

const field =
  "w-full rounded-2xl border border-foreground/10 bg-white/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function SignupForm({ plan }: { plan?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const note = get("message");
    const result = await submitTenantApplication({
      businessName: get("businessName"),
      ownerName: get("ownerName"),
      ownerEmail: get("ownerEmail"),
      ownerWhatsapp: get("ownerWhatsapp"),
      businessType: get("businessType"),
      city: get("city"),
      referralSource: get("referralSource"),
      message: [plan ? `Paket diminati: ${plan}` : "", note].filter(Boolean).join("\n\n"),
    });
    if (result.ok) setStatus("done");
    else {
      setError(result.error);
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="glass flex flex-col items-start gap-3 p-10" role="status">
        <h2 className="font-display text-3xl tracking-tight">Pengajuan terkirim</h2>
        <p className="text-[15px] leading-relaxed text-muted">
          Terima kasih! Tim kami akan meninjau pengajuan Anda dan menghubungi lewat email atau WhatsApp untuk
          mengaktifkan akun tenant.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass grid gap-5 p-8 md:p-10">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Nama bisnis
          <input name="businessName" required maxLength={200} className={field} placeholder="mis. Snap Corner Booth" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Nama pemilik
          <input name="ownerName" required maxLength={200} className={field} autoComplete="name" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input name="ownerEmail" type="email" required className={field} autoComplete="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          WhatsApp
          <input name="ownerWhatsapp" type="tel" maxLength={40} className={field} autoComplete="tel" placeholder="08xxxxxxxxxx" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Jenis usaha
          <select name="businessType" className={field} defaultValue="photobooth_rental">
            {businessTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Kota
          <input name="city" maxLength={100} className={field} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Tahu STUDIODO dari mana? <span className="font-normal text-muted">(opsional)</span>
        <input name="referralSource" maxLength={200} className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Ceritakan bisnis Anda <span className="font-normal text-muted">(opsional)</span>
        <textarea name="message" rows={4} maxLength={2000} className={field} />
      </label>
      {plan && <p className="text-[13px] text-muted">Paket diminati: {plan}</p>}
      {error && (
        <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">
          {error}
        </p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn btn-primary py-4 text-base disabled:opacity-60">
        {status === "sending" ? "Mengirim…" : "Kirim Pengajuan"}
      </button>
    </form>
  );
}
