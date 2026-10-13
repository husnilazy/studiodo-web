"use client";

import { useRef, useState, useTransition } from "react";
import type { PackageRow } from "@/lib/portalTypes";
import { formatRupiah } from "@/lib/format";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { deletePackageAction, savePackageAction, setPackageActiveAction, type PackageInput } from "@/app/portal/paket/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-3.5 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

type Draft = { name: string; price: string; photoCount: string; hasGif: boolean; hasVideo: boolean; hasStopMotion: boolean; description: string; thumbnailUrl: string | null | undefined };
const EMPTY: Draft = { name: "", price: "50000", photoCount: "3", hasGif: false, hasVideo: false, hasStopMotion: false, description: "", thumbnailUrl: undefined };

function fromRow(p: PackageRow): Draft {
  return { name: p.name, price: String(Number(p.price)), photoCount: String(p.photoCount), hasGif: p.hasGif, hasVideo: p.hasVideo, hasStopMotion: p.hasStopMotion, description: p.description ?? "", thumbnailUrl: undefined };
}

function PackageForm({ initial, existingThumb, mediaLocked, onSaved, onCancel, id }: {
  initial: Draft; existingThumb: string | null; mediaLocked: boolean; id: string | null; onSaved: () => void; onCancel?: () => void;
}) {
  const [d, setD] = useState<Draft>(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));
  const thumb = d.thumbnailUrl === undefined ? existingThumb : d.thumbnailUrl;

  const submit = () => {
    setError(null);
    start(async () => {
      const input: PackageInput = {
        name: d.name, price: Number(d.price), photoCount: Number(d.photoCount),
        hasGif: d.hasGif, hasVideo: d.hasVideo, hasStopMotion: d.hasStopMotion, description: d.description,
        ...(d.thumbnailUrl !== undefined ? { thumbnailUrl: d.thumbnailUrl } : {}),
      };
      const r = await savePackageAction(id, input);
      if (!r.ok) { setError(r.error); return; }
      if (!id) setD(EMPTY);
      onSaved();
    });
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium sm:col-span-3">Nama paket
          <input value={d.name} onChange={(e) => set("name", e.target.value)} maxLength={80} className={field} placeholder="mis. Paket Premium" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Harga (Rp)
          <input type="number" min={0} value={d.price} onChange={(e) => set("price", e.target.value)} className={field} />
        </label>
        <label className="grid gap-2 text-sm font-medium">Jumlah foto
          <input type="number" min={1} max={20} value={d.photoCount} onChange={(e) => set("photoCount", e.target.value)} className={field} />
        </label>
        <div className="grid gap-2 text-sm font-medium">Gambar paket
          <div className="flex items-center gap-2">
            {thumb ? <img src={thumb} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/[0.06] text-xs text-muted">—</div>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try { set("thumbnailUrl", await resizeImageToDataUrl(file, 700)); } catch (err) { setError(err instanceof Error ? err.message : "Gambar tidak dapat diproses"); }
              if (fileRef.current) fileRef.current.value = "";
            }} />
            <button type="button" className={smallBtn} onClick={() => fileRef.current?.click()}>Pilih</button>
            {thumb && <button type="button" className={smallBtn} onClick={() => set("thumbnailUrl", null)}>Hapus</button>}
          </div>
        </div>
      </div>
      <label className="grid gap-2 text-sm font-medium">Deskripsi singkat <span className="font-normal text-muted">(tampil di layar pilih paket)</span>
        <input value={d.description} onChange={(e) => set("description", e.target.value)} maxLength={300} className={field} />
      </label>
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
        {([["hasGif", "GIF"], ["hasVideo", "Video"], ["hasStopMotion", "Stop motion"]] as const).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={d[k]} disabled={mediaLocked && !d[k]} onChange={(e) => set(k, e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
            {label}
          </label>
        ))}
      </div>
      {mediaLocked && <p className="text-[13px] text-muted">GIF / video / stop motion tidak termasuk dalam paket langganan Anda saat ini.</p>}
      {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
      <div className="flex gap-3">
        <button type="button" disabled={pending || !d.name.trim()} onClick={submit} className="btn btn-primary px-7 py-3 disabled:opacity-60">{pending ? "Menyimpan…" : id ? "Simpan perubahan" : "Tambah paket"}</button>
        {onCancel && <button type="button" onClick={onCancel} className={smallBtn}>Batal</button>}
      </div>
    </div>
  );
}

function Row({ pkg, mediaLocked, onChanged }: { pkg: PackageRow; mediaLocked: boolean; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const extras = [pkg.hasGif && "GIF", pkg.hasVideo && "Video", pkg.hasStopMotion && "Stop motion"].filter(Boolean).join(" · ");
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => { setError(null); start(async () => { const r = await fn(); if (!r.ok) setError(r.error ?? "Gagal"); else onChanged(); }); };

  if (editing) {
    return <li className="glass p-6"><PackageForm id={pkg.id} initial={fromRow(pkg)} existingThumb={pkg.thumbnailUrl} mediaLocked={mediaLocked} onSaved={() => { setEditing(false); onChanged(); }} onCancel={() => setEditing(false)} /></li>;
  }
  return (
    <li className={`glass flex flex-wrap items-center justify-between gap-4 p-5 ${pkg.active ? "" : "opacity-70"}`}>
      <div className="flex min-w-0 items-center gap-4">
        {pkg.thumbnailUrl ? <img src={pkg.thumbnailUrl} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" /> : <div className="h-14 w-14 shrink-0 rounded-2xl bg-foreground/[0.06]" />}
        <div className="min-w-0">
          <div className="font-semibold">{pkg.name} {!pkg.active && <span className="ml-1 rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[11px] font-semibold text-muted">Nonaktif</span>}</div>
          <div className="text-[13px] text-muted">{formatRupiah(Number(pkg.price))} · {pkg.photoCount} foto{extras ? ` · ${extras}` : ""}</div>
          {pkg.description && <div className="truncate text-[13px] text-muted">{pkg.description}</div>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} className={smallBtn} onClick={() => setEditing(true)}>Ubah</button>
        <button type="button" disabled={pending} className={smallBtn} onClick={() => run(() => setPackageActiveAction(pkg.id, !pkg.active))}>{pkg.active ? "Nonaktifkan" : "Aktifkan"}</button>
        <button type="button" disabled={pending} className={`${smallBtn} hover:!text-[#a12626]`} onClick={() => window.confirm(`Hapus paket "${pkg.name}"? Bila sudah pernah dipakai transaksi, paket hanya dinonaktifkan.`) && run(() => deletePackageAction(pkg.id))}>Hapus</button>
      </div>
      {error && <p role="alert" className="w-full rounded-2xl bg-[#ffe3e3] px-4 py-2.5 text-sm text-[#a12626]">{error}</p>}
    </li>
  );
}

export function PackageManager({ packages, mediaLocked }: { packages: PackageRow[]; mediaLocked: boolean }) {
  const [adding, setAdding] = useState(false);
  const refresh = () => undefined; // the server actions revalidate the page; local state resets on the refreshed props
  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {packages.map((p) => <Row key={`${p.id}-${p.name}-${p.price}-${p.active}-${p.photoCount}`} pkg={p} mediaLocked={mediaLocked} onChanged={refresh} />)}
        {packages.length === 0 && <li className="glass p-6 text-[15px] text-muted">Belum ada paket. Tambahkan paket pertama Anda di bawah.</li>}
      </ul>
      <section className="glass p-7">
        {adding ? (
          <>
            <h2 className="mb-4 font-display text-xl tracking-tight">Paket baru</h2>
            <PackageForm id={null} initial={EMPTY} existingThumb={null} mediaLocked={mediaLocked} onSaved={() => setAdding(false)} onCancel={() => setAdding(false)} />
          </>
        ) : (
          <button type="button" className="btn btn-primary px-7 py-3" onClick={() => setAdding(true)}>+ Tambah paket</button>
        )}
      </section>
    </div>
  );
}
