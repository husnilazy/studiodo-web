"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Spinner } from "@/components/Spinner";
import type { FrameRow } from "@/lib/portalTypes";
import { formatRupiah } from "@/lib/format";
import { analyseFrame, type AnalysedFrame } from "@/lib/frameSlots";
import { createCustomFrameAction, deleteCustomFrameAction, updateCustomFrameAction } from "@/app/portal/frame/custom/actions";

const field = "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-3.5 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";
const MAX_DATA_URI = 3_700_000; // the dashboard's server-action body cap is 4 MB

function NewFrameForm({ onDone }: { onDone: () => void }) {
  const [file, setFile] = useState<AnalysedFrame | null>(null);
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [price, setPrice] = useState("35000");
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (f: File | undefined) => {
    if (!f) return;
    setError(null);
    setReading(true);
    try {
      const result = await analyseFrame(f);
      if (result.dataUrl.length > MAX_DATA_URI) throw new Error("Ukuran frame terlalu besar. Kecilkan desain (mis. 1200 × 1800 px) lalu unggah lagi.");
      if (result.slots.length === 0) throw new Error("Area foto tidak ditemukan. Warnai area foto dengan hijau murni (#00FF00), atau biarkan transparan, lalu unggah lagi.");
      setFile(result);
      if (!name) setName(f.name.replace(/\.[^.]+$/, "").slice(0, 80));
    } catch (e) {
      setFile(null);
      setError(e instanceof Error ? e.message : "File tidak dapat diproses");
    } finally {
      setReading(false);
    }
  };

  const save = () => {
    if (!file) return;
    setError(null);
    start(async () => {
      const r = await createCustomFrameAction({ name, customerName: customer, price: Number(price), imageDataUrl: file.dataUrl, slots: file.slots, canvasWidth: file.width, canvasHeight: file.height, orientation: file.orientation });
      if (!r.ok) return setError(r.error);
      setFile(null); setName(""); setCustomer(""); setPrice("35000");
      onDone();
    });
  };

  return (
    <section className="glass p-6 lg:p-7">
      <h2 className="font-display text-xl tracking-tight">Frame custom baru</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
        <div>
          <div className="relative grid aspect-[2/3] place-items-center overflow-hidden rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,.14)_0_25%,transparent_0_50%)] [background-size:16px_16px]">
            {file ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.dataUrl} alt="Pratinjau frame" className="h-full w-full object-contain" />
                {file.slots.map((s, i) => (
                  <span key={i} className="pointer-events-none absolute grid place-items-center border-2 border-dashed border-accent bg-accent/20 text-[13px] font-bold text-accent" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.w * 100}%`, height: `${s.h * 100}%` }}>{i + 1}</span>
                ))}
              </>
            ) : <span className="px-4 text-center text-[13px] text-muted">{reading ? "Membaca desain…" : "Pratinjau frame & slot foto"}</span>}
          </div>
          <input ref={inputRef} type="file" accept="image/png" className="hidden" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
          <button type="button" className={`${smallBtn} mt-3 w-full`} disabled={reading} onClick={() => inputRef.current?.click()}>{file ? "Ganti file desain" : "Unggah desain (PNG)"}</button>
          {file && <p className="mt-2 text-center text-[12px] text-muted">{file.width} × {file.height} px · {file.slots.length} slot foto{file.usedGreen ? " (area hijau diubah transparan)" : ""}</p>}
        </div>
        <div className="grid content-start gap-4">
          <label className="grid gap-2 text-sm font-medium">Nama frame<input className={field} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="mis. Wedding Rina & Dimas" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">Untuk pelanggan<input className={field} value={customer} maxLength={100} onChange={(e) => setCustomer(e.target.value)} placeholder="Nama pelanggan" /></label>
            <label className="grid gap-2 text-sm font-medium">Harga frame (Rp)<input className={field} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} /></label>
          </div>
          <p className="rounded-2xl bg-foreground/[0.04] px-4 py-3 text-[13px] leading-relaxed text-muted">
            <b className="text-foreground">Cara menyiapkan desain:</b> buat PNG (disarankan 1200 × 1800 px untuk 4R). Warnai tiap area foto dengan <b>hijau murni (#00FF00)</b> atau biarkan transparan. Slot terdeteksi otomatis, diurutkan dari atas ke bawah lalu kiri ke kanan. Harga ini ditambahkan di Kasir di atas harga paket foto.
          </p>
          {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
          <div><button type="button" disabled={!file || !name.trim() || pending} onClick={save} className="btn btn-primary px-7 py-3 disabled:opacity-60">{pending ? <><Spinner />Menyimpan…</> : "Simpan frame custom"}</button></div>
        </div>
      </div>
    </section>
  );
}

function Row({ frame }: { frame: FrameRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(frame.name);
  const [customer, setCustomer] = useState(frame.customerName ?? "");
  const [price, setPrice] = useState(String(Number(frame.price ?? 0)));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => { setError(null); start(async () => { const r = await fn(); if (!r.ok) setError(r.error ?? "Gagal"); else after?.(); }); };

  return (
    <li className={`glass flex flex-wrap items-center gap-4 p-4 ${frame.active ? "" : "opacity-65"}`}>
      <div className="grid h-24 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[repeating-conic-gradient(rgba(128,128,128,.14)_0_25%,transparent_0_50%)] [background-size:12px_12px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {frame.imageUrl ? <img src={frame.imageUrl} alt={frame.name} className="h-full w-full object-contain" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <input className={field} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} aria-label="Nama frame" />
            <input className={field} value={customer} maxLength={100} onChange={(e) => setCustomer(e.target.value)} placeholder="Pelanggan" aria-label="Pelanggan" />
            <input className={field} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Harga" />
          </div>
        ) : (
          <>
            <div className="font-semibold">{frame.name}{!frame.active && <span className="ml-2 rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[11px] font-semibold text-muted">Disembunyikan</span>}</div>
            <div className="text-[13px] text-muted">{frame.customerName ? `Untuk ${frame.customerName} · ` : ""}{formatRupiah(Number(frame.price ?? 0))} · {frame.slotCount} foto · {frame.orientation === "landscape" ? "lanskap" : "potret"}</div>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <button type="button" disabled={pending} className={smallBtn} onClick={() => run(() => updateCustomFrameAction(frame.id, { name, customerName: customer, price: Number(price) }), () => setEditing(false))}>Simpan</button>
            <button type="button" className={smallBtn} onClick={() => setEditing(false)}>Batal</button>
          </>
        ) : (
          <>
            <Link href="/portal/kasir" className={smallBtn}>Jual di Kasir</Link>
            <button type="button" className={smallBtn} onClick={() => setEditing(true)}>Ubah</button>
            <button type="button" disabled={pending} className={smallBtn} onClick={() => run(() => updateCustomFrameAction(frame.id, { name: frame.name, customerName: frame.customerName ?? "", price: Number(frame.price ?? 0), active: !frame.active }))}>{frame.active ? "Sembunyikan" : "Tampilkan"}</button>
            <button type="button" disabled={pending} className={`${smallBtn} hover:!text-[#a12626]`} onClick={() => window.confirm(`Hapus frame "${frame.name}"? Voucher yang sudah diterbitkan untuk frame ini tidak akan bisa memakainya.`) && run(() => deleteCustomFrameAction(frame.id))}>Hapus</button>
          </>
        )}
      </div>
      {error && <p role="alert" className="w-full rounded-xl bg-[#ffe3e3] px-3 py-2 text-[13px] text-[#a12626]">{error}</p>}
    </li>
  );
}

export function CustomFrameManager({ frames }: { frames: FrameRow[] }) {
  const [formKey, setFormKey] = useState(0);
  return (
    <div className="flex flex-col gap-5">
      <NewFrameForm key={formKey} onDone={() => setFormKey((k) => k + 1)} />
      <div>
        <h2 className="mb-3 font-display text-xl tracking-tight">Frame custom yang sudah ada</h2>
        {frames.length === 0 ? <p className="text-[15px] text-muted">Belum ada frame custom.</p> : <ul className="flex flex-col gap-3">{frames.map((f) => <Row key={`${f.id}-${f.active}-${f.name}-${f.price}`} frame={f} />)}</ul>}
      </div>
    </div>
  );
}
