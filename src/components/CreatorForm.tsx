"use client";

import { useState, type FormEvent } from "react";
import { submitCreatorApplication } from "@/lib/api";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function CreatorForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const result = await submitCreatorApplication({
      name: get("name"),
      email: get("email"),
      whatsapp: get("whatsapp"),
      portfolioUrl: get("portfolioUrl"),
      description: get("description"),
      company: get("company"),
    });
    if (result.ok) setStatus("done");
    else { setError(result.error); setStatus("idle"); }
  }

  if (status === "done") {
    return (
      <div className="glass flex flex-col items-start gap-3 p-10" role="status">
        <h2 className="font-display text-3xl tracking-tight">Pendaftaran terkirim</h2>
        <p className="text-[15px] leading-relaxed text-muted">Terima kasih! Tim kami akan melihat portofolio Anda dan menghubungi lewat email atau WhatsApp bila cocok.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass grid gap-5 p-8 md:p-10">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Nama / nama studio<input name="name" required maxLength={100} className={field} autoComplete="name" /></label>
        <label className="grid gap-2 text-sm font-medium">Email<input name="email" type="email" required className={field} autoComplete="email" /></label>
        <label className="grid gap-2 text-sm font-medium">WhatsApp <span className="font-normal text-muted">(opsional)</span><input name="whatsapp" type="tel" maxLength={40} className={field} autoComplete="tel" /></label>
        <label className="grid gap-2 text-sm font-medium">Tautan portofolio<input name="portfolioUrl" type="url" required maxLength={300} className={field} placeholder="https://behance.net/…" /></label>
      </div>
      <label className="grid gap-2 text-sm font-medium">Ceritakan tentang karya Anda <span className="font-normal text-muted">(opsional)</span><textarea name="description" rows={4} maxLength={1000} className={field} /></label>
      {/* Honeypot: hidden from people and assistive tech, bots tend to fill every field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Perusahaan<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn btn-primary py-4 text-base disabled:opacity-60">{status === "sending" ? "Mengirim…" : "Kirim Pendaftaran"}</button>
    </form>
  );
}
