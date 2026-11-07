"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import type { BoothDetail } from "@/lib/portalTypes";
import { saveBoothSettingsAction } from "@/app/portal/booth/[id]/actions";

// "Pengaturan booth": what is special about ONE booth. Everything left empty follows the main settings, so a tenant can price Jakarta
// differently from Jogja, hide a package at one location, or give one booth its own colours and texts without touching the others.

const field = "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const rp = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

const COLORS = [
  { key: "accentColor", label: "Warna utama (tombol)", hint: "Warna tombol dan aksen" },
  { key: "backgroundColor", label: "Warna latar", hint: "Latar layar kiosk" },
  { key: "surfaceColor", label: "Warna kartu", hint: "Kotak dan kartu di layar" },
  { key: "textColor", label: "Warna teks", hint: "Teks utama" },
];
const TEXTS = [
  { key: "brandName", label: "Nama brand di layar", placeholder: "mis. Fotobox Jakarta" },
  { key: "tagline", label: "Slogan", placeholder: "mis. Abadikan momenmu" },
  { key: "idleHeadline", label: "Judul layar awal", placeholder: "Teks besar saat kiosk menunggu" },
  { key: "idleSubheadline", label: "Teks kecil layar awal", placeholder: "Keterangan di bawah judul" },
  { key: "idleStartText", label: "Tulisan tombol mulai", placeholder: "mis. Sentuh untuk mulai" },
  { key: "promoText", label: "Teks promo", placeholder: "mis. Diskon 10% hari ini" },
  { key: "packageHeadline", label: "Judul layar pilih paket", placeholder: "mis. Pilih paket fotomu" },
];

export function BoothSettingsForm({ detail }: { detail: BoothDetail }) {
  const [label, setLabel] = useState(detail.booth.label ?? "");
  const [prices, setPrices] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(detail.packageOverrides).filter(([, o]) => o.price !== undefined).map(([id, o]) => [id, String(o.price)])));
  const [hidden, setHidden] = useState<Record<string, boolean>>(() => Object.fromEntries(Object.entries(detail.packageOverrides).filter(([, o]) => o.active === false).map(([id]) => [id, true])));
  const [look, setLook] = useState<Record<string, string>>(detail.overrides);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const setLookValue = (key: string, value: string) => setLook((prev) => { const next = { ...prev }; if (value) next[key] = value; else delete next[key]; return next; });
  const customCount = Object.values(prices).filter((v) => v !== "").length + Object.values(hidden).filter(Boolean).length + Object.keys(look).length;

  const save = () => {
    setMessage(null);
    const packageOverrides: Record<string, { price?: number; active?: boolean }> = {};
    for (const p of detail.packages) {
      const entry: { price?: number; active?: boolean } = {};
      const raw = (prices[p.id] ?? "").replace(/[^\d]/g, "");
      if (raw !== "" && Number(raw) !== p.price) entry.price = Number(raw); // equal to the main price = nothing special
      if (hidden[p.id]) entry.active = false;
      if (Object.keys(entry).length > 0) packageOverrides[p.id] = entry;
    }
    start(async () => {
      const r = await saveBoothSettingsAction(detail.booth.id, { label, overrides: look, packageOverrides });
      setMessage(r.ok ? { tone: "ok", text: "Tersimpan. Kiosk memakainya saat sesi berikutnya dimulai." } : { tone: "error", text: r.error });
    });
  };

  return (
    <div className="grid max-w-[860px] gap-6">
      <p className="rounded-2xl bg-[var(--soft)] px-4 py-3 text-[13.5px] text-muted">Pengaturan di sini <strong className="text-foreground">hanya berlaku untuk booth ini</strong>. Bagian yang dikosongkan otomatis mengikuti pengaturan utama, jadi tidak ada yang perlu diisi kalau tidak berbeda.</p>

      <section className="glass grid gap-3 p-7">
        <h2 className="font-display text-xl tracking-tight">1. Nama booth</h2>
        <p className="-mt-1 text-[13.5px] text-muted">Nama yang Anda lihat di dashboard, misalnya lokasinya.</p>
        <input className={field} value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder="mis. Booth Mall Jakarta" />
      </section>

      <section className="glass grid gap-3 p-7">
        <h2 className="font-display text-xl tracking-tight">2. Harga dan paket di booth ini</h2>
        <p className="-mt-1 text-[13.5px] text-muted">Isi &ldquo;Harga di booth ini&rdquo; hanya kalau harganya berbeda dari harga utama. Hilangkan centang &ldquo;Tampil&rdquo; untuk menyembunyikan paket di booth ini saja.</p>
        {detail.packages.length === 0 ? (
          <p className="rounded-2xl bg-[var(--soft)] px-4 py-3 text-sm text-muted">Belum ada paket. Buat paket dulu di menu Paket foto.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-foreground/10">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-[var(--soft)] text-left text-xs text-muted">
                <tr><th className="px-4 py-2.5 font-medium">Paket</th><th className="px-4 py-2.5 font-medium">Harga utama</th><th className="px-4 py-2.5 font-medium">Harga di booth ini</th><th className="px-4 py-2.5 text-center font-medium">Tampil</th></tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {detail.packages.map((p) => (
                  <tr key={p.id} className={hidden[p.id] ? "opacity-50" : ""}>
                    <td className="px-4 py-3"><div className="font-medium">{p.name}</div><div className="text-xs text-muted">{p.photoCount} foto{!p.active ? " · nonaktif di pengaturan utama" : ""}</div></td>
                    <td className="px-4 py-3 text-muted">{rp(p.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5"><span className="text-muted">Rp</span>
                        <input inputMode="numeric" value={prices[p.id] ?? ""} onChange={(e) => setPrices({ ...prices, [p.id]: e.target.value.replace(/[^\d]/g, "") })} placeholder={String(p.price)} aria-label={`Harga ${p.name} di booth ini`} className="w-28 rounded-xl border border-foreground/10 bg-panel/70 px-3 py-2 text-sm outline-none focus:border-accent" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><input type="checkbox" checked={!hidden[p.id]} onChange={(e) => setHidden({ ...hidden, [p.id]: !e.target.checked })} aria-label={`Tampilkan ${p.name} di booth ini`} className="h-5 w-5 accent-[var(--accent)]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[12.5px] text-muted">Harga dihitung ulang di server saat sesi dimulai, jadi harga booth ini pasti yang dibayar customer.</p>
      </section>

      <section className="glass grid gap-4 p-7">
        <h2 className="font-display text-xl tracking-tight">3. Tampilan khusus (opsional)</h2>
        <p className="-mt-2 text-[13.5px] text-muted">Beda warna atau teks hanya untuk booth ini. Kosongkan atau klik &ldquo;Ikuti utama&rdquo; untuk kembali ke pengaturan utama.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {COLORS.map((c) => (
            <div key={c.key} className="rounded-2xl border border-foreground/10 p-4">
              <div className="text-sm font-medium">{c.label}</div>
              <div className="text-[12px] text-muted">{c.hint}</div>
              <div className="mt-2 flex items-center gap-2">
                <input type="color" value={look[c.key] ?? "#7c6cff"} onChange={(e) => setLookValue(c.key, e.target.value)} aria-label={c.label} className="h-10 w-14 cursor-pointer rounded-lg border border-foreground/10 bg-transparent" />
                <span className="text-xs text-muted">{look[c.key] ? look[c.key] : "Ikuti pengaturan utama"}</span>
                {look[c.key] && <button type="button" onClick={() => setLookValue(c.key, "")} className="btn glass ml-auto rounded-full! px-3 py-1.5 text-xs text-muted">Ikuti utama</button>}
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEXTS.map((t) => (
            <label key={t.key} className="grid gap-1.5 text-sm font-medium">{t.label}
              <input className={field} value={look[t.key] ?? ""} maxLength={200} onChange={(e) => setLookValue(t.key, e.target.value)} placeholder={t.placeholder} />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className="btn btn-primary inline-flex items-center gap-2 px-7 py-3 disabled:opacity-60">{pending ? <><Spinner />Menyimpan…</> : "Simpan pengaturan booth"}</button>
        <Link href="/portal/booth" className="btn glass rounded-full! px-5 py-3 text-muted">Kembali ke daftar booth</Link>
        <span className="text-[13px] text-muted">{customCount > 0 ? `${customCount} pengaturan khusus` : "Booth ini mengikuti pengaturan utama"}</span>
      </div>
      {message && <p role={message.tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${message.tone === "ok" ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#ffe3e3] text-[#a12626]"}`}>{message.text}</p>}
    </div>
  );
}
