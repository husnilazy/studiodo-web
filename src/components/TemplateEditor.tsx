"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CreatorSlot, CreatorTemplate } from "@/lib/creatorTypes";
import { CATEGORIES, PRESETS } from "@/lib/creatorTypes";

const field = "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const numField = "w-full rounded-xl border border-foreground/10 bg-panel/70 px-3 py-2 text-sm outline-none focus:border-accent";
const MIN = 40;
const MAX_SLOTS = 12;
const MAX_BYTES = 2 * 1024 * 1024;

type Drag =
  | { kind: "draw"; sx: number; sy: number; cur: CreatorSlot }
  | { kind: "move"; i: number; dx: number; dy: number }
  | { kind: "resize"; i: number };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

async function call<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`/kreator-api/${path}`, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Gagal (HTTP ${res.status})`);
  return data;
}

export function TemplateEditor({ initial, apiUrl }: { initial: CreatorTemplate; apiUrl: string }) {
  const router = useRouter();
  const [t, setT] = useState(initial);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [preset, setPreset] = useState(initial.outputPreset);
  const [slots, setSlots] = useState<CreatorSlot[]>(initial.slots);
  const [selected, setSelected] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [drag, setDrag] = useState<Drag | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const editable = t.status === "draft" || t.status === "rejected";
  const W = t.canvasWidth;
  const H = t.canvasHeight;
  const touch = () => { setDirty(true); setNotice(""); };

  const toCanvas = (e: React.PointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const apply = (next: CreatorTemplate) => { setT(next); setSlots(next.slots); setName(next.name); setDescription(next.description); setCategory(next.category); setPreset(next.outputPreset); setDirty(false); };

  const save = async (): Promise<CreatorTemplate | null> => {
    setError(""); setBusy("save");
    try {
      const next = await call<CreatorTemplate>(`templates/${t.id}`, "PATCH", { name, description, category, outputPreset: preset, slots });
      apply(next); setNotice("Tersimpan"); return next;
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan"); return null; } finally { setBusy(""); }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (file.type !== "image/png") return setError("Frame harus berupa file PNG");
    if (file.size > MAX_BYTES) return setError("Ukuran frame maksimal 2 MB");
    setBusy("upload");
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = () => reject(new Error("Gagal membaca file"));
        fr.readAsDataURL(file);
      });
      const asset = await call<{ id: string }>("assets", "POST", { filename: file.name, dataBase64 });
      const next = await call<CreatorTemplate>(`templates/${t.id}`, "PATCH", { frameAssetId: asset.id, name, description, category, outputPreset: preset });
      apply(next); setSelected(null); setNotice("Frame diunggah");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal mengunggah"); } finally { setBusy(""); }
  };

  const submit = async () => {
    const saved = dirty ? await save() : t;
    if (!saved) return;
    setBusy("submit"); setError("");
    try { await call(`templates/${t.id}/submit`, "POST"); router.push("/kreator/portal"); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal mengirim"); setBusy(""); }
  };

  const withdraw = async () => {
    setBusy("withdraw"); setError("");
    try { apply(await call<CreatorTemplate>(`templates/${t.id}/withdraw`, "POST")); setNotice("Ditarik kembali ke draft"); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal"); } finally { setBusy(""); }
  };

  const remove = async () => {
    if (!window.confirm("Hapus template ini beserta frame-nya? Tindakan ini tidak bisa dibatalkan.")) return;
    setBusy("delete"); setError("");
    try { await call(`templates/${t.id}`, "DELETE"); router.push("/kreator/portal"); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menghapus"); setBusy(""); }
  };

  // --- pointer interaction on the canvas ---
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (!editable || !t.frameUrl || e.button !== 0) return;
    const p = toCanvas(e);
    stage.current!.setPointerCapture(e.pointerId);
    setSelected(null);
    setDrag({ kind: "draw", sx: p.x, sy: p.y, cur: { x: p.x, y: p.y, w: 0, h: 0 } });
  };
  const onSlotPointerDown = (e: React.PointerEvent, i: number, mode: "move" | "resize") => {
    if (!editable) return;
    e.stopPropagation();
    stage.current!.setPointerCapture(e.pointerId);
    setSelected(i);
    const p = toCanvas(e);
    setDrag(mode === "move" ? { kind: "move", i, dx: p.x - slots[i].x, dy: p.y - slots[i].y } : { kind: "resize", i });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = toCanvas(e);
    if (drag.kind === "draw") {
      const x = clamp(Math.min(drag.sx, p.x), 0, W), y = clamp(Math.min(drag.sy, p.y), 0, H);
      setDrag({ ...drag, cur: { x, y, w: clamp(Math.max(drag.sx, p.x), 0, W) - x, h: clamp(Math.max(drag.sy, p.y), 0, H) - y } });
    } else if (drag.kind === "move") {
      setSlots((s) => s.map((sl, i) => (i === drag.i ? { ...sl, x: Math.round(clamp(p.x - drag.dx, 0, W - sl.w)), y: Math.round(clamp(p.y - drag.dy, 0, H - sl.h)) } : sl)));
      touch();
    } else {
      setSlots((s) => s.map((sl, i) => (i === drag.i ? { ...sl, w: Math.round(clamp(p.x - sl.x, MIN, W - sl.x)), h: Math.round(clamp(p.y - sl.y, MIN, H - sl.y)) } : sl)));
      touch();
    }
  };
  const onPointerUp = () => {
    if (drag?.kind === "draw") {
      const c = drag.cur;
      if (c.w >= MIN && c.h >= MIN) {
        if (slots.length >= MAX_SLOTS) setError(`Maksimal ${MAX_SLOTS} slot foto`);
        else { setSlots([...slots, { x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.w), h: Math.round(c.h) }]); setSelected(slots.length); touch(); }
      }
    }
    setDrag(null);
  };

  const setSlotField = (i: number, k: keyof CreatorSlot, raw: string) => {
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    setSlots((s) => s.map((sl, idx) => {
      if (idx !== i) return sl;
      if (k === "rotation") return { ...sl, rotation: clamp(v, -180, 180) };
      const next = { ...sl, [k]: Math.round(v) } as CreatorSlot;
      next.w = clamp(next.w, MIN, W); next.h = clamp(next.h, MIN, H);
      next.x = clamp(next.x, 0, W - next.w); next.y = clamp(next.y, 0, H - next.h);
      return next;
    }));
    touch();
  };
  const removeSlot = (i: number) => { setSlots((s) => s.filter((_, idx) => idx !== i)); setSelected(null); touch(); };

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const slotBox = (s: CreatorSlot) => ({ left: pct(s.x, W), top: pct(s.y, H), width: pct(s.w, W), height: pct(s.h, H), transform: s.rotation ? `rotate(${s.rotation}deg)` : undefined });
  const sel = selected !== null ? slots[selected] : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="glass flex flex-col gap-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl tracking-tight">Kanvas</h2>
          {t.frameUrl && <span className="text-[13px] text-muted">{W} × {H} px · {slots.length} slot</span>}
        </div>

        {t.frameUrl ? (
          <>
            <div
              ref={stage}
              onPointerDown={onStagePointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={`relative mx-auto w-full max-w-[520px] touch-none select-none overflow-hidden rounded-xl bg-[repeating-conic-gradient(#d9d9e3_0%_25%,#f1f1f6_0%_50%)] [background-size:20px_20px] ${editable ? "cursor-crosshair" : ""}`}
              style={{ aspectRatio: `${W} / ${H}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${apiUrl}${t.frameUrl}`} alt="Frame" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
              {slots.map((s, i) => (
                <div
                  key={i}
                  onPointerDown={(e) => onSlotPointerDown(e, i, "move")}
                  className={`absolute grid place-items-center text-lg font-bold text-white ${selected === i ? "z-10 bg-accent/55 outline-2 outline-accent" : "bg-accent/35 outline-1 outline-accent/80"} outline ${editable ? "cursor-move" : ""}`}
                  style={slotBox(s)}
                >
                  {i + 1}
                  {editable && selected === i && <span onPointerDown={(e) => onSlotPointerDown(e, i, "resize")} className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-accent" aria-label="Ubah ukuran slot" />}
                </div>
              ))}
              {drag?.kind === "draw" && <div className="absolute border-2 border-dashed border-accent bg-accent/25" style={slotBox(drag.cur)} />}
            </div>
            <p className="text-center text-[13px] text-muted">
              {editable ? "Tarik di atas frame untuk membuat slot foto. Klik slot untuk memilih, geser untuk memindah, tarik titik di sudut untuk mengubah ukuran." : "Template ini tidak bisa diedit saat ini."}
            </p>
          </>
        ) : (
          <div className="grid place-items-center rounded-2xl border-2 border-dashed border-foreground/15 px-6 py-16 text-center">
            <p className="max-w-[320px] text-[15px] text-muted">Mulai dengan mengunggah frame PNG yang area fotonya transparan.</p>
          </div>
        )}

        {editable && (
          <label className="btn mx-auto cursor-pointer px-6 py-3 text-sm">
            {busy === "upload" ? "Mengunggah…" : t.frameUrl ? "Ganti frame (PNG)" : "Unggah frame (PNG)"}
            <input type="file" accept="image/png" className="sr-only" disabled={busy !== ""} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        )}
        {t.frameUrl && editable && <p className="text-center text-[12px] text-muted">Mengganti frame akan mengosongkan slot yang sudah dibuat.</p>}
      </section>

      <aside className="flex flex-col gap-6">
        {t.status === "rejected" && t.reviewNote && (
          <div role="alert" className="rounded-2xl bg-[#ffe3e3] px-5 py-4 text-sm text-[#a12626]"><strong>Perlu diperbaiki:</strong> {t.reviewNote}</div>
        )}
        {t.status === "pending" && <div role="status" className="rounded-2xl bg-[#fff3d6] px-5 py-4 text-sm text-[#7a5a00]">Sedang ditinjau tim STUDIODO. Anda bisa menariknya kembali untuk mengedit.</div>}
        {t.status === "approved" && <div role="status" className="rounded-2xl bg-[#dff7ec] px-5 py-4 text-sm text-[#0f6b45]">Template ini sudah terbit di marketplace · {t.installCount} pemasangan.</div>}

        <section className="glass grid gap-4 p-6">
          <h2 className="font-display text-xl tracking-tight">Detail</h2>
          <label className="grid gap-1.5 text-sm font-medium">Nama
            <input className={field} value={name} maxLength={80} disabled={!editable} onChange={(e) => { setName(e.target.value); touch(); }} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">Deskripsi singkat
            <textarea className={field} rows={3} maxLength={500} disabled={!editable} value={description} onChange={(e) => { setDescription(e.target.value); touch(); }} placeholder="Gaya, cocok untuk acara apa, warna dominan…" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-medium">Kategori
              <select className={field} value={category} disabled={!editable} onChange={(e) => { setCategory(e.target.value); touch(); }}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">Ukuran cetak
              <select className={field} value={preset} disabled={!editable} onChange={(e) => { setPreset(e.target.value); touch(); }}>
                {PRESETS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="glass grid gap-3 p-6">
          <h2 className="font-display text-xl tracking-tight">Slot foto</h2>
          {slots.length === 0 && <p className="text-[14px] text-muted">Belum ada slot. Tarik di atas kanvas untuk membuatnya.</p>}
          {slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slots.map((_, i) => (
                <button key={i} type="button" onClick={() => setSelected(i)} className={`h-9 w-9 rounded-full text-sm font-semibold ${selected === i ? "bg-accent text-white" : "bg-foreground/[0.07]"}`}>{i + 1}</button>
              ))}
            </div>
          )}
          {sel && selected !== null && (
            <div className="grid gap-3 rounded-2xl bg-foreground/[0.04] p-4">
              <div className="grid grid-cols-2 gap-3 text-[12px] text-muted">
                {(["x", "y", "w", "h"] as const).map((k) => (
                  <label key={k} className="grid gap-1">{{ x: "Kiri (X)", y: "Atas (Y)", w: "Lebar", h: "Tinggi" }[k]}
                    <input type="number" className={numField} value={sel[k]} disabled={!editable} onChange={(e) => setSlotField(selected, k, e.target.value)} />
                  </label>
                ))}
                <label className="col-span-2 grid gap-1">Rotasi (°)
                  <input type="number" step="0.5" min={-180} max={180} className={numField} value={sel.rotation ?? 0} disabled={!editable} onChange={(e) => setSlotField(selected, "rotation", e.target.value)} />
                </label>
              </div>
              {editable && <button type="button" onClick={() => removeSlot(selected)} className="text-left text-sm font-semibold text-[#a12626] underline underline-offset-4">Hapus slot {selected + 1}</button>}
            </div>
          )}
        </section>

        {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
        {notice && !error && <p role="status" className="rounded-2xl bg-[#dff7ec] px-4 py-3 text-sm text-[#0f6b45]">{notice}</p>}

        <div className="grid gap-3">
          {editable && (
            <>
              <button type="button" disabled={busy !== "" || !dirty} onClick={() => void save()} className="btn py-3.5 text-base disabled:opacity-50">{busy === "save" ? "Menyimpan…" : dirty ? "Simpan perubahan" : "Tersimpan"}</button>
              <button type="button" disabled={busy !== ""} onClick={() => void submit()} className="btn btn-primary py-3.5 text-base disabled:opacity-60">{busy === "submit" ? "Mengirim…" : "Kirim untuk ditinjau"}</button>
              <button type="button" disabled={busy !== ""} onClick={() => void remove()} className="py-2 text-sm text-[#a12626] underline underline-offset-4">Hapus template</button>
            </>
          )}
          {t.status === "pending" && <button type="button" disabled={busy !== ""} onClick={() => void withdraw()} className="btn py-3.5 text-base">{busy === "withdraw" ? "Menarik…" : "Tarik kembali untuk mengedit"}</button>}
        </div>
      </aside>
    </div>
  );
}
