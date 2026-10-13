"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { formatRupiah } from "@/lib/format";
import type { PosProduct, PosSettings } from "@/lib/posTypes";
import { posAction } from "@/app/portal/kasir/actions";

const field = "h-11 w-full rounded-2xl border-0 bg-[var(--soft)] px-4 text-[14.5px] text-foreground outline-none focus:ring-2 focus:ring-accent/40";
const card = "rounded-[22px] bg-[var(--card)] ring-1 ring-[var(--card-edge)]";

export function PosSettingsPanel({ products, settings }: { products: PosProduct[]; settings: PosSettings }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Products products={products} />
      <Settings settings={settings} />
    </div>
  );
}

function Products({ products }: { products: PosProduct[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState({ name: "", price: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => {
    setError(null);
    start(async () => { const r = await fn(); if (!r.ok) return setError(r.error ?? "Gagal"); after?.(); router.refresh(); });
  };
  return (
    <section className={`${card} flex flex-col gap-4 p-6`}>
      <div><h2 className="font-display text-[20px] tracking-tight">Produk kasir</h2><p className="mt-1 text-[13.5px] leading-relaxed text-muted">Barang atau jasa selain sesi foto: minuman, merchandise, frame cetak. Muncul di tab Produk pada halaman kasir.</p></div>
      <div className="flex flex-wrap gap-2">
        <input className={`${field} min-w-[160px] flex-1`} placeholder="Nama produk" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={80} />
        <input className={`${field} w-[130px]`} placeholder="Harga" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/\D/g, "") })} />
        <button type="button" disabled={pending || !draft.name.trim() || draft.price === ""} onClick={() => run(() => posAction("POST", "/api/pos/products", { name: draft.name, price: Number(draft.price) }), () => setDraft({ name: "", price: "" }))} className="btn btn-primary px-5 py-3 text-[14px] disabled:opacity-50">Tambah</button>
      </div>
      {error && <div role="alert" className="text-[13px] text-[#a12626]">{error}</div>}
      {products.length === 0 ? <p className="py-6 text-center text-[13.5px] text-muted">Belum ada produk.</p> : (
        <ul className="flex flex-col gap-2">
          {products.map((p) => (
            <li key={p.id} className={`flex items-center gap-3 rounded-2xl bg-[var(--soft)] px-4 py-3 ${p.active ? "" : "opacity-55"}`}>
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{p.name}</span>
              <span className="text-[13.5px] tabular-nums text-muted">{formatRupiah(p.price)}</span>
              <button type="button" disabled={pending} onClick={() => run(() => posAction("PATCH", `/api/pos/products/${p.id}`, { active: !p.active }))} className="rounded-full bg-[var(--card)] px-3 py-1.5 text-[12px] font-semibold text-muted ring-1 ring-[var(--card-edge)]">{p.active ? "Sembunyikan" : "Tampilkan"}</button>
              <button type="button" disabled={pending} onClick={() => window.confirm(`Hapus ${p.name}? Transaksi lama tetap tersimpan.`) && run(() => posAction("DELETE", `/api/pos/products/${p.id}`))} className="text-[12px] font-semibold text-muted hover:text-[#a12626]">Hapus</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Settings({ settings }: { settings: PosSettings }) {
  const router = useRouter();
  const [s, setS] = useState({ header: settings.receiptHeader, footer: settings.receiptFooter, prefix: settings.queuePrefix, pin: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const save = (extra: Record<string, unknown> = {}) => {
    setMsg(null);
    start(async () => {
      const r = await posAction("PUT", "/api/pos/settings", { receiptHeader: s.header, receiptFooter: s.footer, queuePrefix: s.prefix, ...(s.pin ? { supervisorPin: s.pin } : {}), ...extra });
      if (!r.ok) return setMsg({ ok: false, text: r.error });
      setS((x) => ({ ...x, pin: "" }));
      setMsg({ ok: true, text: "Tersimpan." });
      router.refresh();
    });
  };
  return (
    <section className={`${card} flex flex-col gap-4 p-6`}>
      <div><h2 className="font-display text-[20px] tracking-tight">Pengaturan kasir</h2><p className="mt-1 text-[13.5px] leading-relaxed text-muted">Teks struk, awalan nomor antrian, dan PIN supervisor untuk refund.</p></div>
      <label className="text-[13px] font-semibold">Kop struk<textarea className={`${field} mt-1.5 h-[84px] resize-none py-3 font-normal`} placeholder={"Nama booth\nAlamat / Instagram"} value={s.header} onChange={(e) => setS({ ...s, header: e.target.value })} maxLength={200} /></label>
      <label className="text-[13px] font-semibold">Penutup struk<input className={`${field} mt-1.5 font-normal`} value={s.footer} onChange={(e) => setS({ ...s, footer: e.target.value })} maxLength={200} /></label>
      <label className="text-[13px] font-semibold">Awalan nomor antrian<input className={`${field} mt-1.5 w-[100px] font-normal`} value={s.prefix} onChange={(e) => setS({ ...s, prefix: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) })} /></label>
      <div className="rounded-2xl bg-[var(--soft)] p-4">
        <div className="flex items-center justify-between gap-3"><h3 className="text-[14px] font-semibold">PIN supervisor</h3><span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${settings.hasPin ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#fff3d6] text-[#7a5a00]"}`}>{settings.hasPin ? "Aktif" : "Belum diatur"}</span></div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">Dengan PIN, refund hanya bisa diproses oleh yang tahu PIN. Tanpa PIN, siapa pun yang membuka kasir bisa refund.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className={`${field} w-[180px]`} type="password" inputMode="numeric" autoComplete="new-password" placeholder={settings.hasPin ? "PIN baru" : "PIN 4–8 angka"} value={s.pin} onChange={(e) => setS({ ...s, pin: e.target.value.replace(/\D/g, "").slice(0, 8) })} />
          {settings.hasPin && <button type="button" disabled={pending} onClick={() => window.confirm("Hapus PIN supervisor? Refund tidak akan meminta PIN lagi.") && save({ clearPin: true })} className="rounded-full bg-[var(--card)] px-4 py-2 text-[12.5px] font-semibold text-muted ring-1 ring-[var(--card-edge)] hover:text-[#a12626]">Hapus PIN</button>}
        </div>
      </div>
      {msg && <div role={msg.ok ? "status" : "alert"} className={`text-[13px] ${msg.ok ? "text-[#0f6b45]" : "text-[#a12626]"}`}>{msg.text}</div>}
      <button type="button" disabled={pending} onClick={() => save()} className="btn btn-primary self-start px-7 py-3 text-[14.5px]">{pending && <Spinner />}Simpan</button>
    </section>
  );
}
