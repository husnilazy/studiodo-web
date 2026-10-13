"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LiveBooth, LiveData } from "@/lib/portalTypes";
import { duration, relativeTime, rupiah, rupiahShort } from "@/lib/crmFormat";
import { loadLiveAction } from "@/app/portal/pelanggan/actions";

// Live monitor: every booth of the account on one screen. Polls the API; booths don't report their screen, so the stage
// (waiting to pay / taking photos / reviewing) is inferred from the session the kiosk keeps updating.

const POLL_MS = 8000;

const STATE: Record<LiveBooth["state"], { label: string; dot: string; chip: string; rank: number }> = {
  capture: { label: "Sedang sesi foto", dot: "bg-[#1fb86a]", chip: "bg-[#dff7ec] text-[#0f6b45]", rank: 0 },
  review: { label: "Preview & cetak", dot: "bg-[#3b9bf0]", chip: "bg-[#e2f0ff] text-[#1a5da6]", rank: 1 },
  payment: { label: "Menunggu pembayaran", dot: "bg-[#f0a81f]", chip: "bg-[#fff3d6] text-[#7a5a00]", rank: 2 },
  idle: { label: "Siaga", dot: "bg-foreground/40", chip: "bg-foreground/[0.07] text-muted", rank: 3 },
  offline: { label: "Offline", dot: "bg-foreground/20", chip: "bg-foreground/[0.05] text-muted", rank: 4 },
  locked: { label: "Terkunci", dot: "bg-[#e5484d]", chip: "bg-[#ffe3e3] text-[#a12626]", rank: 5 },
};
const LOCK_TEXT: Record<string, string> = { unpaid: "Belum berlangganan", trial_expired: "Trial habis", expired: "Langganan habis", suspended: "Akun dinonaktifkan" };

function Tile({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: "good" | "warn" | "bad" }) {
  const color = tone === "good" ? "text-[#0f6b45]" : tone === "warn" ? "text-[#9a5b00]" : tone === "bad" ? "text-[#a12626]" : "";
  return (
    <div className="glass min-w-0 p-6">
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-2 truncate font-display text-[26px] leading-tight tracking-tight xl:text-2xl 2xl:text-3xl ${color}`}>{value}</div>
      {detail && <div className="mt-1 text-[12px] text-muted">{detail}</div>}
    </div>
  );
}

function BoothCard({ booth, now }: { booth: LiveBooth; now: number }) {
  const st = STATE[booth.state];
  const cur = booth.current;
  const progress = cur && cur.photoTarget ? Math.min(100, Math.round((cur.photoCount / cur.photoTarget) * 100)) : cur?.stage === "review" ? 100 : 0;
  const issues = booth.diagnostics ? [!booth.diagnostics.cameraOk && "Kamera", !booth.diagnostics.printerOk && "Printer", !booth.diagnostics.networkOk && "Jaringan"].filter(Boolean) as string[] : [];
  const active = booth.state === "capture" || booth.state === "review" || booth.state === "payment";
  return (
    <li className={`glass flex flex-col gap-4 p-6 ${active ? "ring-2 ring-accent/40" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl tracking-tight">{booth.label}</h3>
          <p className="mt-0.5 text-[12px] text-muted">{booth.appVersion ? `v${booth.appVersion} · ` : ""}{booth.state === "offline" ? `terakhir terlihat ${relativeTime(booth.lastUsedAt, now)}` : booth.paired ? "terhubung" : "belum dipasangkan"}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${st.chip}`}>
          <span className={`h-2 w-2 rounded-full ${st.dot} ${active ? "animate-pulse" : ""}`} />{st.label}
        </span>
      </div>

      {cur ? (
        <div className="rounded-[20px] bg-foreground/[0.05] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">{cur.packageName ?? "Sesi"}</p>
            <p className="text-sm tabular-nums text-muted">{duration(now - new Date(cur.startedAt).getTime())}</p>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {cur.stage === "payment" ? "Pelanggan memilih paket / membayar" : cur.stage === "capture" ? `Foto ${cur.photoCount}${cur.photoTarget ? ` dari ${cur.photoTarget}` : ""}` : "Memilih frame, preview, dan cetak"}
            {cur.amount > 0 ? ` · ${rupiah(cur.amount)}` : ""}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${progress}%` }} /></div>
          {booth.waiting > 0 && <p className="mt-2 text-[12px] font-semibold text-[#9a5b00]">+{booth.waiting} sesi lain menunggu pembayaran</p>}
        </div>
      ) : booth.state === "locked" ? (
        <div className="rounded-[20px] bg-[#ffe3e3] p-4 text-sm text-[#a12626]">{LOCK_TEXT[booth.lockReason ?? ""] ?? "Booth terkunci"} — booth tidak bisa dipakai pelanggan.</div>
      ) : (
        <div className="rounded-[20px] bg-foreground/[0.04] p-4 text-sm text-muted">{booth.state === "offline" ? "Tidak ada kabar dari booth ini." : "Tidak ada sesi berjalan."}</div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-foreground/[0.04] py-2.5"><p className="font-display text-lg tabular-nums">{booth.today.sessions}</p><p className="text-[10px] uppercase tracking-wider text-muted">Sesi hari ini</p></div>
        <div className="rounded-2xl bg-foreground/[0.04] py-2.5"><p className="font-display text-lg tabular-nums">{booth.today.photos}</p><p className="text-[10px] uppercase tracking-wider text-muted">Foto</p></div>
        <div className="rounded-2xl bg-foreground/[0.04] py-2.5"><p className="font-display text-lg tabular-nums">{rupiah(booth.today.revenue).replace("Rp", "").trim()}</p><p className="text-[10px] uppercase tracking-wider text-muted">Rupiah</p></div>
      </div>

      {(issues.length > 0 || (booth.licenseType === "trial" && booth.state !== "locked") || (booth.licenseType === "paid" && booth.daysRemaining !== null && booth.daysRemaining <= 7 && booth.state !== "locked")) && (
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
          {issues.map((i) => <span key={i} className="rounded-full bg-[#ffe3e3] px-2.5 py-1 text-[#a12626]">{i} bermasalah</span>)}
          {booth.licenseType === "trial" && booth.state !== "locked" && <span className="rounded-full bg-[#fff3d6] px-2.5 py-1 text-[#7a5a00]">Trial · {Math.max(0, booth.daysRemaining ?? 0)} hari lagi</span>}
          {booth.licenseType === "paid" && booth.daysRemaining !== null && booth.daysRemaining <= 7 && booth.state !== "locked" && <span className="rounded-full bg-[#fff3d6] px-2.5 py-1 text-[#7a5a00]">Langganan berakhir {booth.daysRemaining} hari lagi</span>}
        </div>
      )}
    </li>
  );
}

export function LiveMonitor({ initial }: { initial: LiveData }) {
  const [data, setData] = useState<LiveData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "attention">("all");
  const [query, setQuery] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const load = useCallback(async () => {
    const r = await loadLiveAction();
    if (r.ok) { setData(r.data); setUpdatedAt(Date.now()); setError(null); } else setError(r.error);
  }, []);

  useEffect(() => {
    setNow(Date.now()); // eslint-disable-line react-hooks/set-state-in-effect -- the clock only exists in the browser
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(() => { if (document.visibilityState === "visible") void load(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(tick); clearInterval(poll); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);

  const clock = now ?? new Date(data.now).getTime();
  const booths = useMemo(() => {
    const list = data.booths.filter((b) => {
      if (query.trim() && !b.label.toLowerCase().includes(query.trim().toLowerCase())) return false;
      if (filter === "active") return b.state === "capture" || b.state === "review" || b.state === "payment";
      if (filter === "attention") return b.state === "offline" || b.state === "locked" || Boolean(b.diagnostics && (!b.diagnostics.cameraOk || !b.diagnostics.printerOk || !b.diagnostics.networkOk));
      return true;
    });
    return [...list].sort((a, b) => STATE[a.state].rank - STATE[b.state].rank || a.label.localeCompare(b.label));
  }, [data, filter, query]);
  const s = data.summary;
  const chip = (active: boolean) => `min-h-[44px] rounded-full px-4 text-sm font-semibold transition ${active ? "bg-foreground text-[var(--on-foreground)] shadow-sm" : "glass rounded-full! text-muted hover:text-foreground"}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
        <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${error ? "bg-[#e5484d]" : "animate-pulse bg-[#1fb86a]"}`} />{error ? "Gagal memperbarui — mencoba lagi" : `Diperbarui otomatis tiap ${POLL_MS / 1000} detik${updatedAt ? ` · ${new Date(updatedAt).toLocaleTimeString("id-ID")}` : ""}`}</span>
        <button type="button" onClick={() => void load()} className="btn glass rounded-full! px-4 py-2 text-[13px] hover:text-foreground">Muat ulang</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Tile label="Booth aktif" value={`${s.online}/${s.booths}`} detail={s.offline > 0 ? `${s.offline} offline` : "Semua tersambung"} tone={s.offline > 0 ? "warn" : "good"} />
        <Tile label="Sedang sesi" value={String(s.inSession)} detail="Foto, preview, cetak" tone={s.inSession > 0 ? "good" : undefined} />
        <Tile label="Menunggu bayar" value={String(s.waitingPayment)} detail="Pelanggan di layar pembayaran" tone={s.waitingPayment > 0 ? "warn" : undefined} />
        <Tile label="Sesi hari ini" value={String(s.sessionsToday)} detail={`${s.paidToday} sudah bayar`} />
        <Tile label="Pendapatan hari ini" value={rupiahShort(s.revenueToday)} detail={s.locked > 0 ? `${s.locked} booth terkunci` : undefined} tone={s.locked > 0 ? "bad" : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([["all", `Semua (${data.booths.length})`], ["active", "Sedang dipakai"], ["attention", "Perlu perhatian"]] as const).map(([v, l]) => <button key={v} type="button" onClick={() => setFilter(v)} aria-pressed={filter === v} className={chip(filter === v)}>{l}</button>)}
        {data.booths.length > 6 && <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari booth…" aria-label="Cari booth" className="ml-auto w-56 rounded-full border border-foreground/10 bg-panel/70 px-5 py-2.5 text-sm outline-none focus:border-accent" />}
      </div>

      {data.booths.length === 0 ? (
        <p className="glass p-6 text-[15px] text-muted">Belum ada booth. Tambahkan di menu Booth &amp; langganan.</p>
      ) : booths.length === 0 ? (
        <p className="glass p-6 text-[15px] text-muted">Tidak ada booth di tampilan ini.</p>
      ) : (
        <ul className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">{booths.map((b) => <BoothCard key={b.id} booth={b} now={clock} />)}</ul>
      )}

      <section className="glass p-7">
        <h2 className="font-display text-xl tracking-tight">Aktivitas terbaru hari ini</h2>
        {data.recent.length === 0 ? <p className="mt-3 text-[15px] text-muted">Belum ada sesi hari ini.</p> : (
          <ul className="mt-3 divide-y divide-foreground/[0.08]">
            {data.recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[14px]">
                <div><span className="font-semibold">{r.booth}</span><span className="text-muted"> · {r.packageName ?? "Sesi"} · {relativeTime(r.at, clock)}</span></div>
                <div className="flex items-center gap-2">
                  {r.hasContact && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">Kontak tersimpan</span>}
                  <span className="tabular-nums text-muted">{r.amount > 0 ? rupiah(r.amount) : "Gratis"}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${r.done ? "bg-[#dff7ec] text-[#0f6b45]" : r.paymentStatus === "success" ? "bg-[#e2f0ff] text-[#1a5da6]" : "bg-[#fff3d6] text-[#7a5a00]"}`}>{r.done ? "Selesai" : r.paymentStatus === "success" ? "Berjalan" : "Menunggu bayar"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
