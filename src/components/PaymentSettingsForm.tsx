"use client";

import { useState, useTransition } from "react";
import type { PaymentConfig } from "@/lib/portalTypes";
import { savePaymentAction, testPaymentAction } from "@/app/portal/pembayaran/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-4 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

function Notice({ tone, children }: { tone: "ok" | "error" | "info"; children: React.ReactNode }) {
  const cls = tone === "ok" ? "bg-[#dff7ec] text-[#0f6b45]" : tone === "error" ? "bg-[#ffe3e3] text-[#a12626]" : "bg-[#eef0ff] text-[#3b3fa8]";
  return <p role={tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${cls}`}>{children}</p>;
}

function Copy({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="text-[13px] font-medium">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded-xl border border-foreground/10 bg-panel/70 px-3 py-2 text-xs">{value}</code>
        <button type="button" className={smallBtn} onClick={() => { void navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Tersalin!" : "Salin"}</button>
      </div>
    </div>
  );
}

export function PaymentSettingsForm({ config }: { config: PaymentConfig }) {
  const [provider, setProvider] = useState<"xendit" | "doku">(config.paymentProvider);
  const [secretKey, setSecretKey] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [dokuClientId, setDokuClientId] = useState(config.dokuClientId);
  const [dokuSecret, setDokuSecret] = useState("");
  const [dokuEnv, setDokuEnv] = useState(config.dokuEnvironment);
  const [qris, setQris] = useState(config.qrisEnabled);
  const [cash, setCash] = useState(config.cashPaymentEnabled);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error" | "info"; text: string } | null>(null);

  const platform = config.qrisSettlement === "platform";
  const xenditReady = config.hasSecretKey && config.hasWebhookToken;
  const dokuReady = Boolean(config.dokuClientId) && config.hasDokuSecret;

  const save = (extra: Parameters<typeof savePaymentAction>[0] = {}, okText = "Tersimpan.") => {
    setMessage(null);
    start(async () => {
      const r = await savePaymentAction({
        paymentProvider: provider, secretKey, webhookToken, dokuClientId, dokuSecretKey: dokuSecret, dokuEnvironment: dokuEnv,
        qrisEnabled: qris, cashPaymentEnabled: cash, ...extra,
      });
      if (r.ok) { setSecretKey(""); setWebhookToken(""); setDokuSecret(""); setMessage({ tone: "ok", text: okText }); }
      else setMessage({ tone: "error", text: r.error });
    });
  };

  const test = () => {
    setMessage(null);
    start(async () => {
      const r = await testPaymentAction(provider);
      setMessage(r.ok ? { tone: r.data.ok ? "ok" : "error", text: r.data.message } : { tone: "error", text: r.error });
    });
  };

  return (
    <div className="grid max-w-[760px] gap-6">
      {platform && (
        <Notice tone="info">Akun Anda memakai penampungan QRIS oleh STUDIODO: pembayaran pelanggan masuk ke akun STUDIODO dan saldonya dapat ditarik di menu <strong>Saldo QRIS</strong>. Kunci di bawah tidak diperlukan.</Notice>
      )}

      <section className="glass grid gap-5 p-7">
        <h2 className="font-display text-xl tracking-tight">Gateway pembayaran kiosk</h2>
        <p className="-mt-3 text-[14px] text-muted">Pilih gateway yang menerima pembayaran QRIS dari pelanggan booth Anda. Uang langsung masuk ke akun gateway Anda sendiri.</p>
        <div role="radiogroup" aria-label="Gateway" className="grid grid-cols-2 gap-3">
          {(["xendit", "doku"] as const).map((p) => (
            <button key={p} type="button" role="radio" aria-checked={provider === p} disabled={platform} onClick={() => setProvider(p)}
              className={`rounded-[20px] border p-4 text-left transition disabled:opacity-50 ${provider === p ? "border-accent bg-accent/[0.06] ring-2 ring-accent/30" : "border-foreground/10 bg-panel/50 hover:border-foreground/25"}`}>
              <div className="font-semibold">{p === "xendit" ? "Xendit" : "DOKU"}</div>
              <div className="mt-1 text-[12px] text-muted">{p === "xendit" ? (xenditReady ? `Terhubung · ${config.xenditKeyTail ?? ""} ${config.xenditMode ?? ""}` : "Belum lengkap") : (dokuReady ? `Terhubung · ${config.dokuEnvironment}` : "Belum lengkap")}</div>
            </button>
          ))}
        </div>

        {provider === "xendit" ? (
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">Secret Key Xendit
              <input type="password" autoComplete="off" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className={field} placeholder={config.hasSecretKey ? `Tersimpan (${config.xenditKeyTail ?? "••••"}) — isi untuk mengganti` : "xnd_production_… atau xnd_development_…"} />
              <span className="text-[12px] font-normal text-muted">Dashboard Xendit → Settings → API Keys → buat Secret Key dengan izin <em>QR codes (Write)</em>. Jangan pakai Public Key.</span>
            </label>
            <label className="grid gap-2 text-sm font-medium">Webhook verification token
              <input type="password" autoComplete="off" value={webhookToken} onChange={(e) => setWebhookToken(e.target.value)} className={field} placeholder={config.hasWebhookToken ? "Tersimpan — isi untuk mengganti" : "Token dari Xendit → Webhooks"} />
              <span className="text-[12px] font-normal text-muted">Dipakai memastikan pemberitahuan pembayaran benar-benar dari Xendit.</span>
            </label>
            <Copy label="URL webhook — daftarkan di Xendit → Settings → Webhooks (QR code paid)" value={config.webhookUrls.xendit} />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">Client ID DOKU
                <input value={dokuClientId} onChange={(e) => setDokuClientId(e.target.value)} className={field} placeholder="BRN-…" autoComplete="off" />
              </label>
              <label className="grid gap-2 text-sm font-medium">Secret Key DOKU
                <input type="password" autoComplete="off" value={dokuSecret} onChange={(e) => setDokuSecret(e.target.value)} className={field} placeholder={config.hasDokuSecret ? "Tersimpan — isi untuk mengganti" : "SK-…"} />
              </label>
            </div>
            <div role="radiogroup" aria-label="Mode DOKU" className="inline-flex w-fit rounded-full border border-foreground/10 bg-foreground/[0.04] p-1 text-[13px] font-semibold">
              {(["sandbox", "production"] as const).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={dokuEnv === v} onClick={() => setDokuEnv(v)} className={`rounded-full px-4 py-1.5 transition ${dokuEnv === v ? "bg-foreground text-[var(--on-foreground)] shadow-sm" : "text-muted"}`}>{v === "sandbox" ? "Sandbox (uji coba)" : "Produksi"}</button>
              ))}
            </div>
            <Copy label="URL notifikasi — daftarkan di DOKU Back Office → Settings → Notification URL" value={config.webhookUrls.doku} />
          </div>
        )}
      </section>

      <section className="glass grid gap-4 p-7">
        <h2 className="font-display text-xl tracking-tight">Metode bayar di kiosk</h2>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={qris} onChange={(e) => setQris(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--accent)]" />
          <span><span className="block font-semibold">QRIS</span><span className="block text-[13px] text-muted">Pelanggan scan QR di layar kiosk.</span></span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={cash} onChange={(e) => setCash(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--accent)]" />
          <span><span className="block font-semibold">Tunai / voucher kasir</span><span className="block text-[13px] text-muted">Pelanggan membayar ke kasir, lalu kasir memberi kode voucher tunai.</span></span>
        </label>
      </section>

      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={pending} onClick={() => save()} className="btn btn-primary px-8 py-3.5 disabled:opacity-60">{pending ? "Memproses…" : "Simpan"}</button>
        <button type="button" disabled={pending || (provider === "xendit" ? !config.hasSecretKey : !dokuReady)} onClick={test} className={smallBtn}>Tes koneksi</button>
        {(provider === "xendit" ? config.hasSecretKey || config.hasWebhookToken : dokuReady) && (
          <button type="button" disabled={pending} className={`${smallBtn} hover:!text-[#a12626]`} onClick={() => window.confirm(`Hapus kredensial ${provider === "xendit" ? "Xendit" : "DOKU"}? Kiosk tidak bisa menerima QRIS lewat gateway ini sampai diisi lagi.`) && save(provider === "xendit" ? { clearXendit: true } : { clearDoku: true }, "Kredensial dihapus.")}>
            Hapus kredensial
          </button>
        )}
      </div>
    </div>
  );
}
