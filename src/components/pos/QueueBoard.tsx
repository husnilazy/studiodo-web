"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import type { PosTicket } from "@/lib/posTypes";
import { posAction } from "@/app/portal/kasir/actions";

const field = "h-11 rounded-2xl border-0 bg-[var(--soft)] px-4 text-[14.5px] text-foreground outline-none focus:ring-2 focus:ring-accent/40";
const card = "rounded-[22px] bg-[var(--card)] ring-1 ring-[var(--card-edge)]";
const btn = "rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition disabled:opacity-50";
const waited = (iso: string) => { const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)); return m < 1 ? "baru" : `${m} mnt`; };

export function QueueBoard({ initial, booths }: { initial: PosTicket[]; booths: { id: string; label: string }[] }) {
  const [tickets, setTickets] = useState(initial);
  const [booth, setBooth] = useState<string>(booths[0]?.id ?? "");
  const [form, setForm] = useState({ name: "", wa: "", size: "1" });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const boothName = (id: string | null) => booths.find((b) => b.id === id)?.label ?? null;

  const refresh = useCallback(async () => {
    const r = await posAction<PosTicket[]>("GET", "/api/pos/queue");
    if (r.ok) setTickets(r.data);
  }, []);

  // The board is shared by whoever is at the counter, so it re-reads every few seconds (paused while the tab is hidden).
  useEffect(() => {
    const t = window.setInterval(() => { if (!document.hidden) void refresh(); }, 5000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    start(async () => { const r = await fn(); if (!r.ok) setError(r.error ?? "Gagal"); await refresh(); });
  };
  const setStatus = (t: PosTicket, status: PosTicket["status"], withBooth = false) =>
    run(() => posAction("PATCH", `/api/pos/queue/${t.id}`, { status, ...(withBooth && booth ? { kioskKeyId: booth } : {}) }));

  const waiting = tickets.filter((t) => t.status === "waiting");
  const active = tickets.filter((t) => t.status === "called" || t.status === "serving");
  const finished = tickets.filter((t) => t.status === "done" || t.status === "skipped").reverse();

  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} flex flex-wrap items-end gap-3 p-4`}>
        <label className="text-[12.5px] font-semibold">Nama<input className={`${field} mt-1 block w-[170px] font-normal`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="opsional" maxLength={80} /></label>
        <label className="text-[12.5px] font-semibold">WhatsApp<input className={`${field} mt-1 block w-[160px] font-normal`} inputMode="tel" value={form.wa} onChange={(e) => setForm({ ...form, wa: e.target.value })} placeholder="opsional" maxLength={20} /></label>
        <label className="text-[12.5px] font-semibold">Orang<input className={`${field} mt-1 block w-[80px] font-normal`} inputMode="numeric" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value.replace(/\D/g, "") })} /></label>
        <button type="button" disabled={pending} onClick={() => run(async () => { const r = await posAction("POST", "/api/pos/queue", { customerName: form.name, customerWhatsapp: form.wa, partySize: Number(form.size) || 1 }); if (r.ok) setForm({ name: "", wa: "", size: "1" }); return r; })} className="btn btn-primary px-6 py-3 text-[14px]">Ambil nomor</button>
        <div className="ml-auto flex items-end gap-2">
          {booths.length > 0 && <label className="text-[12.5px] font-semibold">Ke booth<select className={`${field} mt-1 block font-normal`} value={booth} onChange={(e) => setBooth(e.target.value)}>{booths.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</select></label>}
          <button type="button" disabled={pending || waiting.length === 0} onClick={() => run(() => posAction("POST", "/api/pos/queue/next", booth ? { kioskKeyId: booth } : {}))} className="btn px-6 py-3 text-[14px] font-semibold ring-2 ring-accent/40 disabled:opacity-50">{pending && <Spinner />}Panggil berikutnya</button>
        </div>
      </div>
      {error && <div role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-2.5 text-[13px] text-[#a12626]">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-3">
        <Column title="Menunggu" count={waiting.length} empty="Tidak ada yang menunggu.">
          {waiting.map((t) => (
            <Ticket key={t.id} t={t} meta={`menunggu ${waited(t.createdAt)}`}>
              <button type="button" disabled={pending} onClick={() => setStatus(t, "called", true)} className={`${btn} bg-accent text-white`}>Panggil</button>
              <button type="button" disabled={pending} onClick={() => setStatus(t, "skipped")} className={`${btn} bg-[var(--soft)] text-muted`}>Lewati</button>
            </Ticket>
          ))}
        </Column>
        <Column title="Dipanggil / dilayani" count={active.length} empty="Belum ada yang dipanggil.">
          {active.map((t) => (
            <Ticket key={t.id} t={t} tone={t.status === "serving" ? "serving" : "called"} meta={`${t.status === "serving" ? "sedang foto" : "dipanggil"}${boothName(t.kioskKeyId) ? ` · ${boothName(t.kioskKeyId)}` : ""}`}>
              {t.status === "called" && <button type="button" disabled={pending} onClick={() => setStatus(t, "serving")} className={`${btn} bg-accent text-white`}>Mulai</button>}
              <button type="button" disabled={pending} onClick={() => setStatus(t, "done")} className={`${btn} bg-[#dff7ec] text-[#0f6b45]`}>Selesai</button>
              {t.status === "called" && <button type="button" disabled={pending} onClick={() => setStatus(t, "waiting")} className={`${btn} bg-[var(--soft)] text-muted`}>Kembalikan</button>}
            </Ticket>
          ))}
        </Column>
        <Column title="Selesai hari ini" count={finished.length} empty="Belum ada yang selesai.">
          {finished.slice(0, 20).map((t) => <Ticket key={t.id} t={t} tone="done" meta={t.status === "skipped" ? "dilewati" : "selesai"} />)}
        </Column>
      </div>
    </div>
  );
}

function Column({ title, count, empty, children }: { title: string; count: number; empty: string; children: React.ReactNode }) {
  return (
    <section className={`${card} flex min-h-[220px] flex-col gap-3 p-4`}>
      <h2 className="flex items-center justify-between font-display text-[17px] tracking-tight">{title}<span className="rounded-full bg-[var(--soft)] px-2.5 py-0.5 text-[12px] font-semibold text-muted">{count}</span></h2>
      {count === 0 ? <p className="py-6 text-center text-[13px] text-muted">{empty}</p> : <ul className="flex flex-col gap-2.5">{children}</ul>}
    </section>
  );
}

function Ticket({ t, meta, tone, children }: { t: PosTicket; meta: string; tone?: "called" | "serving" | "done"; children?: React.ReactNode }) {
  const ring = tone === "serving" ? "ring-2 ring-[#22c58b]/50" : tone === "called" ? "ring-2 ring-accent/45" : "";
  return (
    <li className={`feed-in rounded-2xl bg-[var(--soft)] p-3.5 ${ring} ${tone === "done" ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[22px] font-semibold tracking-tight">{t.label}</span>
        <span className="text-[12px] text-muted">{meta}</span>
      </div>
      <div className="truncate text-[13px] text-muted">{t.customerName || "Tanpa nama"}{t.partySize > 1 ? ` · ${t.partySize} orang` : ""}{t.orderId ? " · sudah bayar" : ""}</div>
      {children && <div className="mt-2.5 flex flex-wrap gap-1.5">{children}</div>}
    </li>
  );
}
