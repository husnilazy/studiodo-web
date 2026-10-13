"use client";

import { useState, useTransition } from "react";
import type { FrameRow } from "@/lib/portalTypes";
import { deleteFrameAction, renameFrameAction, setFrameActiveAction } from "@/app/portal/frame/actions";

const smallBtn = "btn glass rounded-full! px-3.5 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

function FrameCard({ frame }: { frame: FrameRow }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState(frame.name);
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editable = frame.kind === "template";
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => { setError(null); start(async () => { const r = await fn(); if (!r.ok) setError(r.error ?? "Gagal"); else after?.(); }); };

  return (
    <li className={`glass flex flex-col gap-3 p-4 ${frame.active ? "" : "opacity-65"}`}>
      <div className="grid aspect-[3/4] place-items-center overflow-hidden rounded-2xl bg-foreground/[0.05]">
        {frame.imageUrl ? <img src={frame.imageUrl} alt={frame.name} loading="lazy" className="h-full w-full object-contain" /> : <span className="px-4 text-center text-xs text-muted">Pratinjau tersedia di aplikasi kiosk</span>}
      </div>
      <div>
        {renaming ? (
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); run(() => renameFrameAction(frame.id, name), () => setRenaming(false)); }}>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus aria-label="Nama frame" className="w-full rounded-xl border border-foreground/10 bg-panel/70 px-3 py-2 text-sm outline-none focus:border-accent" />
            <button type="submit" disabled={pending} className={smallBtn}>OK</button>
          </form>
        ) : (
          <button type="button" disabled={!editable} onClick={() => setRenaming(true)} className="text-left font-semibold enabled:hover:text-accent" title={editable ? "Klik untuk ganti nama" : undefined}>{frame.name}</button>
        )}
        <div className="mt-0.5 text-[12px] text-muted">
          {frame.orientation === "landscape" ? "Lanskap" : "Potret"}{frame.kind === "template" ? ` · ${frame.slotCount} foto` : " · overlay"}{frame.stopMotion ? " · stop motion" : ""}{!frame.active ? " · nonaktif" : ""}
        </div>
      </div>
      {editable && (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pending} className={smallBtn} onClick={() => run(() => setFrameActiveAction(frame.id, !frame.active))}>{frame.active ? "Sembunyikan" : "Tampilkan"}</button>
          <button type="button" disabled={pending} className={`${smallBtn} hover:!text-[#a12626]`} onClick={() => window.confirm(`Hapus frame "${frame.name}"?`) && run(() => deleteFrameAction(frame.id))}>Hapus</button>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-[#ffe3e3] px-3 py-2 text-[13px] text-[#a12626]">{error}</p>}
    </li>
  );
}

export function FrameManager({ frames }: { frames: FrameRow[] }) {
  const [filter, setFilter] = useState<"all" | "portrait" | "landscape" | "hidden">("all");
  const shown = frames.filter((f) => (filter === "all" ? true : filter === "hidden" ? !f.active : f.orientation === filter));
  return (
    <div className="flex flex-col gap-5">
      <div role="radiogroup" aria-label="Filter" className="inline-flex w-fit flex-wrap gap-2 text-[13px] font-semibold">
        {([["all", "Semua"], ["portrait", "Potret"], ["landscape", "Lanskap"], ["hidden", "Disembunyikan"]] as const).map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={filter === v} onClick={() => setFilter(v)} className={`rounded-full px-4 py-2 transition ${filter === v ? "bg-foreground text-[var(--on-foreground)]" : "glass rounded-full! text-muted"}`}>{l}</button>
        ))}
      </div>
      {shown.length === 0 ? <p className="text-[15px] text-muted">Tidak ada frame di tampilan ini.</p> : (
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">{shown.map((f) => <FrameCard key={`${f.id}-${f.active}-${f.name}`} frame={f} />)}</ul>
      )}
    </div>
  );
}
