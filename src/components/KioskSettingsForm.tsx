"use client";

import { useRef, useState, useTransition } from "react";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import type { PrintingConfig, TenantConfig } from "@/lib/portalTypes";
import { saveKioskSettingsAction, saveLogoAction, savePrintingAction, saveProfileAction } from "@/app/portal/pengaturan/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-4 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

type Msg = { tone: "ok" | "error"; text: string } | null;

function Feedback({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return <p role={msg.tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${msg.tone === "ok" ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#ffe3e3] text-[#a12626]"}`}>{msg.text}</p>;
}

function Text({ label, hint, value, onChange, max = 200, placeholder }: { label: string; hint?: string; value: string; onChange: (v: string) => void; max?: number; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">{label}{hint && <span className="-mt-1 text-[12px] font-normal text-muted">{hint}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} placeholder={placeholder} className={field} />
    </label>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--accent)]" />
      <span><span className="block font-semibold">{label}</span>{hint && <span className="block text-[13px] text-muted">{hint}</span>}</span>
    </label>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="glass grid gap-5 p-7">
      <div><h2 className="font-display text-xl tracking-tight">{title}</h2>{hint && <p className="mt-1 text-[14px] text-muted">{hint}</p>}</div>
      {children}
    </section>
  );
}

export function KioskSettingsForm({ tenant, printing }: { tenant: TenantConfig; printing: PrintingConfig }) {
  const cfg = (tenant.kioskConfig ?? {}) as Record<string, unknown>;
  const str = (key: string, fallback = "") => (typeof cfg[key] === "string" ? (cfg[key] as string) : fallback);
  const numv = (key: string, fallback: number) => (typeof cfg[key] === "number" ? (cfg[key] as number) : fallback);
  const bool = (key: string, fallback: boolean) => (typeof cfg[key] === "boolean" ? (cfg[key] as boolean) : fallback);

  const [profile, setProfile] = useState({
    brandName: str("brandName", tenant.brandName ?? ""), tagline: str("tagline", tenant.tagline ?? ""),
    contactWhatsapp: str("contactWhatsapp", tenant.contactWhatsapp ?? ""), socialInstagram: str("socialInstagram", tenant.socialInstagram ?? ""),
    socialTiktok: str("socialTiktok", tenant.socialTiktok ?? ""), socialFacebook: str("socialFacebook", tenant.socialFacebook ?? ""),
    websiteUrl: str("websiteUrl", tenant.websiteUrl ?? ""), address: str("address", tenant.address ?? ""),
  });
  const [kiosk, setKiosk] = useState({
    accentColor: str("accentColor", tenant.accentColor ?? "#7C3AED"),
    idleHeadline: str("idleHeadline"), idleSubheadline: str("idleSubheadline"), promoText: str("promoText"),
    packageHeadline: str("packageHeadline"), paymentHeadline: str("paymentHeadline"), captureHeadline: str("captureHeadline"), resultHeadline: str("resultHeadline"),
    countdownSeconds: numv("countdownSeconds", tenant.countdownSeconds ?? 3), sessionTimerMinutes: numv("sessionTimerMinutes", tenant.sessionTimerMinutes ?? 5),
    printCopies: numv("printCopies", 1), maxPhotosPerSession: numv("maxPhotosPerSession", 6),
    beepEnabled: bool("beepEnabled", tenant.beepEnabled ?? true), autoCaptureEnabled: bool("autoCaptureEnabled", false), autoPrintEnabled: bool("autoPrintEnabled", false),
    eventEnabled: bool("eventEnabled", false), eventName: str("eventName"), eventFreeEntry: bool("eventFreeEntry", false),
  });
  const [print, setPrint] = useState({ ...printing, price: String(printing.price), max: String(printing.max) });
  const [logo, setLogo] = useState<string | null>(tenant.logoUrl ?? null);

  const [pending, start] = useTransition();
  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [kioskMsg, setKioskMsg] = useState<Msg>(null);
  const [printMsg, setPrintMsg] = useState<Msg>(null);
  const [logoMsg, setLogoMsg] = useState<Msg>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const setP = (k: keyof typeof profile) => (v: string) => setProfile((c) => ({ ...c, [k]: v }));
  const setK = <K extends keyof typeof kiosk>(k: K, v: (typeof kiosk)[K]) => setKiosk((c) => ({ ...c, [k]: v }));

  return (
    <div className="grid max-w-[820px] gap-6">
      <Section title="Profil brand" hint="Tampil di kiosk, halaman hasil foto, dan galeri yang dibuka pelanggan.">
        <div className="flex items-center gap-4">
          {logo ? <img src={logo} alt="Logo" className="h-16 max-w-[160px] rounded-xl bg-foreground/[0.04] object-contain p-1" /> : <div className="grid h-16 w-24 place-items-center rounded-xl bg-foreground/[0.06] text-xs text-muted">Belum ada logo</div>}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setLogoMsg(null);
            try {
              const dataUrl = await resizeImageToDataUrl(file, 600, "image/png");
              start(async () => {
                const r = await saveLogoAction(dataUrl);
                if (r.ok) { setLogo(r.data.logoUrl); setLogoMsg({ tone: "ok", text: "Logo diperbarui." }); } else setLogoMsg({ tone: "error", text: r.error });
              });
            } catch (err) { setLogoMsg({ tone: "error", text: err instanceof Error ? err.message : "Gambar tidak dapat diproses" }); }
            if (fileRef.current) fileRef.current.value = "";
          }} />
          <button type="button" disabled={pending} className={smallBtn} onClick={() => fileRef.current?.click()}>Ganti logo</button>
          {logo && <button type="button" disabled={pending} className={smallBtn} onClick={() => start(async () => { const r = await saveLogoAction(null); if (r.ok) { setLogo(null); setLogoMsg({ tone: "ok", text: "Logo dihapus." }); } else setLogoMsg({ tone: "error", text: r.error }); })}>Hapus</button>}
        </div>
        <Feedback msg={logoMsg} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Nama brand" value={profile.brandName} onChange={setP("brandName")} max={80} />
          <Text label="Tagline" value={profile.tagline} onChange={setP("tagline")} max={160} />
          <Text label="WhatsApp kontak" value={profile.contactWhatsapp} onChange={setP("contactWhatsapp")} max={40} placeholder="628xxxxxxxxxx" />
          <Text label="Website" value={profile.websiteUrl} onChange={setP("websiteUrl")} max={160} placeholder="https://" />
          <Text label="Instagram" value={profile.socialInstagram} onChange={setP("socialInstagram")} max={160} />
          <Text label="TikTok" value={profile.socialTiktok} onChange={setP("socialTiktok")} max={160} />
          <Text label="Facebook" value={profile.socialFacebook} onChange={setP("socialFacebook")} max={160} />
          <Text label="Alamat" value={profile.address} onChange={setP("address")} max={200} />
        </div>
        <Feedback msg={profileMsg} />
        <div><button type="button" disabled={pending} className="btn btn-primary px-7 py-3 disabled:opacity-60" onClick={() => { setProfileMsg(null); start(async () => { const r = await saveProfileAction(profile); setProfileMsg(r.ok ? { tone: "ok", text: "Profil tersimpan." } : { tone: "error", text: r.error }); }); }}>{pending ? "Menyimpan…" : "Simpan profil"}</button></div>
      </Section>

      <Section title="Tampilan & teks kiosk" hint="Warna aksen dan judul di tiap layar. Kosongkan untuk memakai teks bawaan.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">Warna aksen
            <div className="flex items-center gap-3">
              <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(kiosk.accentColor) ? kiosk.accentColor : "#7C3AED"} onChange={(e) => setK("accentColor", e.target.value)} className="h-12 w-16 cursor-pointer rounded-xl border border-foreground/10 bg-transparent" aria-label="Pilih warna" />
              <input value={kiosk.accentColor} onChange={(e) => setK("accentColor", e.target.value)} maxLength={7} className={field} />
            </div>
          </label>
          <Text label="Judul layar awal" value={kiosk.idleHeadline} onChange={(v) => setK("idleHeadline", v)} max={120} />
          <Text label="Subjudul layar awal" value={kiosk.idleSubheadline} onChange={(v) => setK("idleSubheadline", v)} />
          <Text label="Teks promo" value={kiosk.promoText} onChange={(v) => setK("promoText", v)} />
          <Text label="Judul pilih paket" value={kiosk.packageHeadline} onChange={(v) => setK("packageHeadline", v)} max={120} />
          <Text label="Judul pembayaran" value={kiosk.paymentHeadline} onChange={(v) => setK("paymentHeadline", v)} max={120} />
          <Text label="Judul sesi foto" value={kiosk.captureHeadline} onChange={(v) => setK("captureHeadline", v)} max={120} />
          <Text label="Judul hasil" value={kiosk.resultHeadline} onChange={(v) => setK("resultHeadline", v)} max={120} />
        </div>
      </Section>

      <Section title="Sesi foto & cetak">
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="grid gap-2 text-sm font-medium">Hitung mundur (detik)<input type="number" min={1} max={10} value={kiosk.countdownSeconds} onChange={(e) => setK("countdownSeconds", Number(e.target.value))} className={field} /></label>
          <label className="grid gap-2 text-sm font-medium">Batas waktu sesi (menit)<input type="number" min={1} max={60} value={kiosk.sessionTimerMinutes} onChange={(e) => setK("sessionTimerMinutes", Number(e.target.value))} className={field} /></label>
          <label className="grid gap-2 text-sm font-medium">Foto maks / sesi<input type="number" min={1} max={20} value={kiosk.maxPhotosPerSession} onChange={(e) => setK("maxPhotosPerSession", Number(e.target.value))} className={field} /></label>
          <label className="grid gap-2 text-sm font-medium">Salinan cetak<input type="number" min={1} max={10} value={kiosk.printCopies} onChange={(e) => setK("printCopies", Number(e.target.value))} className={field} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle label="Bunyi hitung mundur" checked={kiosk.beepEnabled} onChange={(v) => setK("beepEnabled", v)} />
          <Toggle label="Jepret otomatis" hint="Foto diambil berurutan tanpa disentuh." checked={kiosk.autoCaptureEnabled} onChange={(v) => setK("autoCaptureEnabled", v)} />
          <Toggle label="Cetak otomatis" hint="Langsung cetak setelah sesi." checked={kiosk.autoPrintEnabled} onChange={(v) => setK("autoPrintEnabled", v)} />
        </div>
      </Section>

      <Section title="Mode event" hint="Untuk acara (pernikahan, ulang tahun): sesi gratis dengan nama acara di layar.">
        <Toggle label="Aktifkan mode event" checked={kiosk.eventEnabled} onChange={(v) => setK("eventEnabled", v)} />
        {kiosk.eventEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Nama acara" value={kiosk.eventName} onChange={(v) => setK("eventName", v)} max={120} />
            <div className="self-end"><Toggle label="Gratis untuk tamu" hint="Tamu tidak perlu membayar." checked={kiosk.eventFreeEntry} onChange={(v) => setK("eventFreeEntry", v)} /></div>
          </div>
        )}
        <Feedback msg={kioskMsg} />
        <div><button type="button" disabled={pending} className="btn btn-primary px-7 py-3 disabled:opacity-60" onClick={() => { setKioskMsg(null); start(async () => { const r = await saveKioskSettingsAction(kiosk); setKioskMsg(r.ok ? { tone: "ok", text: "Pengaturan kiosk tersimpan. Kiosk memuatnya saat berikutnya tersambung." } : { tone: "error", text: r.error }); }); }}>{pending ? "Menyimpan…" : "Simpan tampilan, sesi & event"}</button></div>
      </Section>

      <Section title="Cetak tambahan" hint="Pelanggan bisa membeli salinan cetak ekstra setelah sesi.">
        <Toggle label="Aktifkan cetak tambahan" checked={print.enabled} onChange={(v) => setPrint((c) => ({ ...c, enabled: v }))} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Text label="Nama tombol" value={print.label} onChange={(v) => setPrint((c) => ({ ...c, label: v }))} max={80} />
          <label className="grid gap-2 text-sm font-medium">Harga per cetak (Rp)<input type="number" min={0} value={print.price} onChange={(e) => setPrint((c) => ({ ...c, price: e.target.value }))} className={field} /></label>
          <label className="grid gap-2 text-sm font-medium">Maks. cetak tambahan<input type="number" min={1} max={20} value={print.max} onChange={(e) => setPrint((c) => ({ ...c, max: e.target.value }))} className={field} /></label>
        </div>
        <Feedback msg={printMsg} />
        <div><button type="button" disabled={pending} className="btn btn-primary px-7 py-3 disabled:opacity-60" onClick={() => { setPrintMsg(null); start(async () => { const r = await savePrintingAction({ enabled: print.enabled, label: print.label, price: Number(print.price), max: Number(print.max) }); setPrintMsg(r.ok ? { tone: "ok", text: "Tersimpan." } : { tone: "error", text: r.error }); }); }}>{pending ? "Menyimpan…" : "Simpan cetak tambahan"}</button></div>
      </Section>
    </div>
  );
}
