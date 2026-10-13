"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PublicPlan } from "@/lib/api";
import { formatRupiah, formatDate, formatDateTime } from "@/lib/format";
import { planOptions, pickInterval, type Interval } from "@/lib/pricing";
import type { BoothQuote, KioskKeyRow, VolumeTier } from "@/lib/portalTypes";
import {
  createBoothAction, quoteAction, renameBoothAction, resetDeviceAction, revealKeyAction, revokeBoothAction,
  setAutoUpdateAction, startCheckoutAction,
} from "@/app/portal/booth/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-3.5 py-2 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

export type BoothView = KioskKeyRow & { online: boolean };

function licenseBadge(b: BoothView): { text: string; tone: string } {
  if (b.licenseType === "unpaid") return { text: "Belum berlangganan", tone: "bg-[#ffe3e3] text-[#a12626]" };
  if (b.locked) return { text: b.licenseType === "trial" ? "Trial habis — terkunci" : "Terkunci", tone: "bg-[#ffe3e3] text-[#a12626]" };
  if (b.licenseType === "trial") return { text: `Trial · ${Math.max(0, b.daysRemaining ?? 0)} hari lagi`, tone: "bg-[#fff3d6] text-[#7a5a00]" };
  if (b.graceDaysRemaining !== null) return { text: `Masa tenggang · ${b.graceDaysRemaining} hari`, tone: "bg-[#fff3d6] text-[#7a5a00]" };
  if (!b.licenseEndsAt) return { text: "Aktif · tanpa batas waktu", tone: "bg-[#dff7ec] text-[#0f6b45]" };
  const soon = (b.daysRemaining ?? 99) <= 7;
  return { text: `Aktif sampai ${formatDate(b.licenseEndsAt)}`, tone: soon ? "bg-[#fff3d6] text-[#7a5a00]" : "bg-[#dff7ec] text-[#0f6b45]" };
}

function needsAttention(b: BoothView) {
  return b.licenseType !== "paid" || b.locked || (b.daysRemaining ?? 99) <= 7;
}

function CopyKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-2">
      <code className="flex-1 overflow-x-auto rounded-xl border border-foreground/10 bg-panel/70 px-3 py-2 text-xs">{value}</code>
      <button type="button" className={smallBtn} onClick={() => { void navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? "Tersalin!" : "Salin"}
      </button>
    </div>
  );
}

function BoothCard({ booth, selected, onToggle }: { booth: BoothView; selected: boolean; onToggle: () => void }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState(booth.label ?? "");
  const [renaming, setRenaming] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const badge = licenseBadge(booth);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => {
    setError(null);
    start(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Gagal");
      else after?.();
    });
  };

  return (
    <li className={`glass flex flex-col gap-3 p-5 ${selected ? "ring-2 ring-accent" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {renaming ? (
            <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); run(() => renameBoothAction(booth.id, name), () => setRenaming(false)); }}>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus className={`${field} !py-2`} aria-label="Nama booth" />
              <button type="submit" disabled={pending} className={smallBtn}>Simpan</button>
            </form>
          ) : (
            <button type="button" onClick={() => setRenaming(true)} className="text-left font-semibold hover:text-accent" title="Klik untuk ganti nama">
              {booth.label ?? "Booth tanpa nama"}
            </button>
          )}
          <div className="mt-1 text-[13px] text-muted">
            {booth.boundDeviceId ? "Terpasang di komputer" : "Belum dipasangkan"} · versi {booth.appVersion ?? "—"} · terakhir aktif {formatDateTime(booth.lastUsedAt)}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${booth.online ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-foreground/[0.06] text-muted"}`}>{booth.online ? "Online" : "Offline"}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.tone}`}>{badge.text}</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" checked={selected} onChange={onToggle} className="h-5 w-5 accent-[var(--accent)]" />
        <span>{booth.licenseType === "unpaid" ? "Aktifkan langganan booth ini" : "Perpanjang booth ini"}</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} className={smallBtn} onClick={() => (key ? setKey(null) : run(async () => { const r = await revealKeyAction(booth.id); if (r.ok) setKey(r.data); return r; }))}>
          {key ? "Sembunyikan key" : "Lihat key"}
        </button>
        {booth.boundDeviceId && (
          <button type="button" disabled={pending} className={smallBtn} onClick={() => window.confirm("Reset device? Komputer yang sedang memakai key ini akan ditolak sampai key dipasang ulang — pakai ini bila mengganti komputer booth.") && run(() => resetDeviceAction(booth.id))}>
            Reset device
          </button>
        )}
        <button type="button" disabled={pending} className={smallBtn} onClick={() => run(() => setAutoUpdateAction(booth.id, !booth.autoUpdateEnabled))} title="Update aplikasi kiosk otomatis">
          Auto-update: {booth.autoUpdateEnabled ? "aktif" : "mati"}
        </button>
        <button type="button" disabled={pending} className={`${smallBtn} hover:!text-[#a12626]`} onClick={() => window.confirm("Cabut booth ini? Kiosk yang memakainya langsung berhenti dan sisa langganannya hangus.") && run(() => revokeBoothAction(booth.id))}>
          Cabut
        </button>
      </div>
      {key && <CopyKey value={key} />}
      {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-2.5 text-sm text-[#a12626]">{error}</p>}
    </li>
  );
}

export function BoothManager({
  booths, plans, currentPlanSlug, tiers, tenantDiscountPercent, canPay, contactHref,
}: {
  booths: BoothView[];
  plans: PublicPlan[];
  currentPlanSlug: string;
  tiers: VolumeTier[];
  tenantDiscountPercent: number;
  canPay: boolean;
  contactHref: string | null;
}) {
  const paidPlans = useMemo(() => plans.filter((p) => Number(p.price) > 0), [plans]);
  const [planSlug, setPlanSlug] = useState(() => (paidPlans.find((p) => p.slug === currentPlanSlug) ?? paidPlans.find((p) => p.featured) ?? paidPlans[0])?.slug ?? "");
  const plan = paidPlans.find((p) => p.slug === planSlug);
  const options = plan ? planOptions(plan) : null;
  const both = Boolean(options?.monthly && options?.yearly && plan?.billingInterval !== "yearly");
  const [wanted, setWanted] = useState<Interval>("monthly");
  const interval: Interval = options ? pickInterval(options, wanted).interval : "monthly";

  const [selected, setSelected] = useState<string[]>(() => booths.filter(needsAttention).map((b) => b.id));
  const [newBooths, setNewBooths] = useState(0);
  const [quote, setQuote] = useState<BoothQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [paying, startPay] = useTransition();
  const [payError, setPayError] = useState<string | null>(null);

  const [createPending, startCreate] = useTransition();
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  const total = selected.length + newBooths;
  const requestId = useRef(0);

  // Re-price whenever the choice changes (debounced); the server's number is the one that is charged.
  const canQuote = Boolean(plan) && total > 0;
  useEffect(() => {
    if (!canQuote) return;
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setQuoting(true);
      const result = await quoteAction({ planSlug, interval, keyIds: selected, newBooths });
      if (id !== requestId.current) return;
      setQuoting(false);
      if (result.ok) { setQuote(result.data); setQuoteError(null); } else { setQuote(null); setQuoteError(result.error); }
    }, 250);
    return () => clearTimeout(timer);
  }, [canQuote, planSlug, interval, selected, newBooths]);
  const shownQuote = canQuote ? quote : null;

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const word = interval === "yearly" ? "tahun" : "bulan";
  const nextTier = tiers.filter((t) => t.minBooths > total).sort((a, b) => a.minBooths - b.minBooths)[0];

  const pay = () => {
    setPayError(null);
    startPay(async () => {
      const result = await startCheckoutAction({ planSlug, interval, keyIds: selected, newBooths });
      if (result && !result.ok) setPayError(result.error);
    });
  };

  const sorted = [...booths].sort((a, b) => Number(b.online) - Number(a.online) || new Date(b.lastUsedAt ?? 0).getTime() - new Date(a.lastUsedAt ?? 0).getTime());

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Booth Anda ({booths.length})</h2>
          <form className="flex items-center gap-2" onSubmit={(e) => {
            e.preventDefault();
            setCreateError(null);
            startCreate(async () => {
              const r = await createBoothAction(newLabel);
              if (r.ok) { setCreatedKey(r.data.key); setNewLabel(""); } else setCreateError(r.error);
            });
          }}>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} maxLength={80} placeholder="Nama booth baru (opsional)" className={`${field} !py-2.5 w-56`} aria-label="Nama booth baru" />
            <button type="submit" disabled={createPending} className={smallBtn}>{createPending ? "Membuat…" : "+ Buat key booth"}</button>
          </form>
        </div>
        {createError && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{createError}</p>}
        {createdKey && (
          <div className="glass p-5">
            <p className="font-semibold">Key booth baru dibuat</p>
            <p className="mt-1 text-[13px] text-muted">Tempel key ini di aplikasi STUDIODO pada komputer booth. Booth baru terkunci sampai Anda berlangganan di bawah. Key bisa dilihat lagi kapan saja lewat tombol &ldquo;Lihat key&rdquo;.</p>
            <CopyKey value={createdKey} />
            <button type="button" className="mt-3 text-[13px] text-muted underline underline-offset-4" onClick={() => setCreatedKey(null)}>Tutup</button>
          </div>
        )}
        {booths.length === 0 ? (
          <p className="glass p-6 text-[15px] text-muted">Belum ada booth. Pilih jumlah booth di bagian &ldquo;Langganan&rdquo; di bawah, atau buat key booth lalu pasang di aplikasi kiosk.</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {sorted.map((b) => <BoothCard key={b.id} booth={b} selected={selected.includes(b.id)} onToggle={() => toggle(b.id)} />)}
          </ul>
        )}
      </section>

      <section className="glass flex flex-col gap-6 p-8">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Langganan</h2>
          <p className="mt-1 text-[15px] text-muted">Satu langganan untuk satu booth (satu key, satu komputer). Berlangganan banyak booth sekaligus — makin banyak, makin hemat.</p>
        </div>

        {!canPay && (
          <p className="rounded-2xl bg-[#fff3d6] px-5 py-4 text-sm text-[#7a5a00]">
            Pembayaran online belum diaktifkan. Untuk berlangganan atau memperpanjang, hubungi tim STUDIODO
            {contactHref ? <> via <a href={contactHref} className="font-semibold underline underline-offset-4">WhatsApp</a></> : null}.
          </p>
        )}

        {paidPlans.length === 0 ? (
          <p className="text-[15px] text-muted">Daftar paket belum tersedia.</p>
        ) : (
          <>
            <div role="radiogroup" aria-label="Pilih paket" className="grid gap-3 md:grid-cols-3">
              {paidPlans.map((p) => {
                const o = planOptions(p);
                const price = o.monthly ?? o.yearly!;
                return (
                  <button key={p.slug} type="button" role="radio" aria-checked={p.slug === planSlug} onClick={() => setPlanSlug(p.slug)}
                    className={`rounded-[22px] border p-5 text-left transition ${p.slug === planSlug ? "border-accent bg-accent/[0.06] ring-2 ring-accent/30" : "border-foreground/10 bg-panel/50 hover:border-foreground/25"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{p.name}</span>
                      {p.slug === currentPlanSlug && <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">Paket Anda</span>}
                    </div>
                    <div className="mt-2 text-sm text-muted">
                      {price.final < price.list && <span className="mr-2 line-through">{formatRupiah(price.list)}</span>}
                      <span className="font-display text-xl text-foreground">{formatRupiah(price.final)}</span>
                      <span> /booth/{o.monthly ? "bulan" : "tahun"}</span>
                    </div>
                    {p.description && <p className="mt-2 text-[13px] text-muted">{p.description}</p>}
                  </button>
                );
              })}
            </div>

            {both && options && (
              <div role="radiogroup" aria-label="Periode" className="inline-flex w-fit rounded-full border border-foreground/10 bg-foreground/[0.04] p-1 text-[13px] font-semibold">
                {(["monthly", "yearly"] as const).map((value) => (
                  <button key={value} type="button" role="radio" aria-checked={wanted === value} onClick={() => setWanted(value)} className={`rounded-full px-4 py-1.5 transition ${wanted === value ? "bg-foreground text-[var(--on-foreground)] shadow-sm" : "text-muted"}`}>
                    {value === "monthly" ? "Bulanan" : `Tahunan${options.yearlySavingsPercent > 0 ? ` · hemat ${options.yearlySavingsPercent}%` : ""}`}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-sm font-medium">Booth yang dibayar</div>
                  <p className="mt-1 text-[13px] text-muted">Centang booth di daftar atas, atau tambah booth baru di sini (key dibuat otomatis begitu pembayaran masuk).</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {booths.length > 0 && (
                      <>
                        <button type="button" className={smallBtn} onClick={() => setSelected(booths.map((b) => b.id))}>Pilih semua ({booths.length})</button>
                        <button type="button" className={smallBtn} onClick={() => setSelected([])}>Kosongkan</button>
                      </>
                    )}
                  </div>
                </div>
                <label className="grid max-w-[260px] gap-2 text-sm font-medium">Tambah booth baru
                  <div className="flex items-center gap-2">
                    <button type="button" className={smallBtn} onClick={() => setNewBooths((n) => Math.max(0, n - 1))} aria-label="Kurangi">−</button>
                    <input type="number" min={0} max={100} value={newBooths} onChange={(e) => setNewBooths(Math.max(0, Math.min(100, Math.floor(Number(e.target.value) || 0))))} className={`${field} text-center`} />
                    <button type="button" className={smallBtn} onClick={() => setNewBooths((n) => Math.min(100, n + 1))} aria-label="Tambah">+</button>
                  </div>
                </label>

                <div className="rounded-[20px] border border-foreground/10 bg-panel/40 p-4 text-[13px] leading-relaxed text-muted">
                  <div className="font-semibold text-foreground">Diskon banyak booth</div>
                  {tiers.length > 0 ? (
                    <ul className="mt-1 list-disc pl-5">
                      {tiers.map((t) => <li key={t.minBooths}>{t.minBooths} booth atau lebih: hemat {t.percent}% per booth</li>)}
                    </ul>
                  ) : <p className="mt-1">Belum ada diskon volume.</p>}
                  {tenantDiscountPercent > 0 && <p className="mt-2 font-semibold text-[#0f6b45]">Akun Anda mendapat potongan khusus {tenantDiscountPercent}% (dipakai bila lebih besar dari diskon volume).</p>}
                </div>
              </div>

              <aside className="glass-dark flex flex-col gap-3 p-6" aria-live="polite">
                <div className="text-sm opacity-70">Ringkasan</div>
                {total === 0 ? (
                  <p className="text-[15px] opacity-80">Pilih minimal satu booth.</p>
                ) : shownQuote ? (
                  <>
                    <div className="flex justify-between text-[15px]"><span>{shownQuote.boothCount} booth × {formatRupiah(shownQuote.unitBase)}</span><span>{formatRupiah(shownQuote.subtotal)}</span></div>
                    {shownQuote.discountPercent > 0 && (
                      <div className="flex justify-between text-[15px] text-[#9ff0c5]">
                        <span>Diskon {shownQuote.discountPercent}% ({shownQuote.discountSource === "tenant" ? "khusus akun Anda" : "banyak booth"})</span>
                        <span>−{formatRupiah(shownQuote.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between border-t border-white/15 pt-3">
                      <span>Total / {shownQuote.periodDays} hari</span>
                      <span className="font-display text-3xl tracking-tight">{formatRupiah(shownQuote.total)}</span>
                    </div>
                    <div className="text-[13px] opacity-70">{formatRupiah(shownQuote.unitFinal)} per booth per {word}</div>
                    {nextTier && <div className="rounded-xl bg-white/10 px-3 py-2 text-[13px]">Tambah {nextTier.minBooths - total} booth lagi untuk hemat {nextTier.percent}%.</div>}
                  </>
                ) : quoteError ? (
                  <p role="alert" className="text-[15px] text-[#ffb4b4]">{quoteError}</p>
                ) : (
                  <p className="text-[15px] opacity-80">{quoting ? "Menghitung…" : "—"}</p>
                )}
                {payError && <p role="alert" className="rounded-xl bg-[#ffe3e3] px-3 py-2 text-sm text-[#a12626]">{payError}</p>}
                <button type="button" disabled={!canPay || paying || !shownQuote || quoting} onClick={pay} className="btn mt-1 bg-white py-[15px] text-center text-[#0b1020] disabled:opacity-50">
                  {paying ? "Mengalihkan…" : canPay ? "Bayar sekarang" : "Pembayaran online belum aktif"}
                </button>
                <p className="text-[12px] opacity-60">Masa aktif ditambahkan ke tiap booth begitu pembayaran terkonfirmasi (biasanya beberapa menit). Booth yang masih aktif tidak kehilangan sisa harinya.</p>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
