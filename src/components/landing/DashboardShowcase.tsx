"use client";

import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { SectionHeading } from "../SectionHeading";
import { rupiah, useCount, useInView } from "./hooks";

// An animated, clearly-labelled sample of the tenant dashboard: four tabs that auto-rotate (and pause on hover),
// each with counters, charts and a live feed that move on their own. Sample data only.

const TABS = [
  { id: "omzet", label: "Omzet", icon: "chart" },
  { id: "monitor", label: "Monitor booth", icon: "monitor" },
  { id: "voucher", label: "Voucher", icon: "ticket" },
  { id: "saldo", label: "Saldo", icon: "wallet" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const BARS = [38, 52, 44, 61, 70, 48, 83, 66, 74, 91, 58, 77, 96, 88];

const FEED = [
  { who: "Paket Photostrip", where: "Mall Kota · Booth 1", amt: 35000 },
  { who: "Paket GIF + Cetak", where: "Wedding Aulia", amt: 60000 },
  { who: "Cetak tambahan ×2", where: "Mall Kota · Booth 2", amt: 20000 },
  { who: "Paket Video 5 detik", where: "Cafe Senja", amt: 45000 },
  { who: "Paket Photostrip", where: "Wisuda UNP", amt: 35000 },
];

function Stat({ label, value, money, active, delay = 0 }: { label: string; value: number; money?: boolean; active: boolean; delay?: number }) {
  const n = useCount(value, active, 1300 + delay);
  return (
    <div className="rounded-2xl bg-panel/70 p-4 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] ring-1 ring-black/5 dark:ring-white/10">
      <div className="text-[12px] text-muted">{label}</div>
      <div className="mt-1 font-display text-[22px] font-semibold tabular-nums tracking-tight md:text-2xl">{money ? rupiah(n) : Math.round(n).toLocaleString("id-ID")}</div>
    </div>
  );
}

function Omzet() {
  const [rows, setRows] = useState(() => FEED.slice(0, 3).map((r, i) => ({ ...r, k: i })));
  useEffect(() => {
    let k = 3;
    const t = window.setInterval(() => {
      const r = FEED[k % FEED.length];
      setRows((prev) => [{ ...r, k: k++ }, ...prev].slice(0, 4));
    }, 2200);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Omzet hari ini" value={1865000} money active />
          <Stat label="Sesi foto" value={54} active />
          <Stat label="Booth aktif" value={6} active />
        </div>
        <div className="rounded-2xl bg-panel/70 p-4 ring-1 ring-black/5 dark:ring-white/10">
          <div className="mb-3 flex items-center justify-between text-[12px] text-muted"><span>Omzet 14 hari terakhir</span><span className="flex items-center gap-1 font-semibold text-[#22c58b]"><Icon name="trending" className="h-3.5 w-3.5" />+18%</span></div>
          <div className="flex h-[150px] items-end gap-1.5">
            {BARS.map((h, i) => (
              <div key={i} className="dash-bar flex-1 rounded-t-md bg-gradient-to-t from-accent to-accent-soft" style={{ height: `${h}%`, ["--i" as string]: i }} />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-panel/70 p-4 ring-1 ring-black/5 dark:ring-white/10">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-muted">
          <span className="relative flex h-2 w-2"><span className="ping-ring absolute inset-0 rounded-full bg-[#22c58b]" /><span className="relative h-2 w-2 rounded-full bg-[#22c58b]" /></span>
          Transaksi masuk
        </div>
        <ul className="flex flex-col gap-2.5">
          {rows.map((r) => (
            <li key={r.k} className="feed-in flex items-center gap-3 rounded-xl bg-accent/[0.07] px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-soft text-[11px] font-bold text-white">Rp</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{r.who}</span>
                <span className="block truncate text-[11px] text-muted">{r.where}</span>
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-[#22c58b]">+{r.amt.toLocaleString("id-ID")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const BOOTHS = [
  { name: "Mall Kota · Booth 1", status: "Online", paper: 82, ok: true, note: "Sesi berjalan" },
  { name: "Mall Kota · Booth 2", status: "Online", paper: 47, ok: true, note: "Menunggu pelanggan" },
  { name: "Cafe Senja", status: "Online", paper: 21, ok: true, note: "Kertas hampir habis" },
  { name: "Wedding Aulia", status: "Online", paper: 93, ok: true, note: "Event berlangsung" },
  { name: "Wisuda UNP", status: "Offline", paper: 60, ok: false, note: "Terakhir aktif 12 mnt lalu" },
];
function Monitor() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {BOOTHS.map((b, i) => (
        <div key={b.name} className="feed-in rounded-2xl bg-panel/70 p-4 ring-1 ring-black/5 dark:ring-white/10" style={{ animationDelay: `${i * 90}ms` }}>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[14px] font-semibold">{b.name}</span>
            <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${b.ok ? "bg-[#22c58b]/15 text-[#12a06f]" : "bg-[#ff5a6e]/15 text-[#e0455a]"}`}>
              <span className="relative flex h-1.5 w-1.5">{b.ok && <span className="ping-ring absolute inset-0 rounded-full bg-[#22c58b]" />}<span className={`relative h-1.5 w-1.5 rounded-full ${b.ok ? "bg-[#22c58b]" : "bg-[#ff5a6e]"}`} /></span>
              {b.status}
            </span>
          </div>
          <div className="mt-1 text-[12px] text-muted">{b.note}</div>
          <div className="mt-3 flex items-center gap-2.5 text-[11px] text-muted">
            <Icon name="printer" className="h-4 w-4" />
            <div className="h-1.5 flex-1 rounded-full bg-accent/15"><div className={`bar-grow h-1.5 rounded-full ${b.paper < 25 ? "bg-[#ffa43a]" : "bg-accent"}`} style={{ width: `${b.paper}%`, animationDelay: `${i * 90 + 200}ms` }} /></div>
            <span className="w-8 text-right tabular-nums">{b.paper}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const VOUCHERS = [
  { code: "WEDDING50", desc: "Diskon 50% · Wedding Aulia", used: 38, max: 50 },
  { code: "HAPPYHOUR", desc: "Diskon Rp 10.000 · 14.00–16.00", used: 21, max: 60 },
  { code: "GRATISWISUDA", desc: "Paket gratis · Wisuda UNP", used: 112, max: 150 },
];
function Voucher() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {VOUCHERS.map((v, i) => (
        <div key={v.code} className="feed-in relative overflow-hidden rounded-2xl bg-panel/70 p-5 ring-1 ring-black/5 dark:ring-white/10" style={{ animationDelay: `${i * 110}ms` }}>
          <div className="flex items-center gap-2 text-accent"><Icon name="ticket" className="h-5 w-5" /><span className="font-display text-[17px] font-semibold tracking-wide">{v.code}</span></div>
          <p className="mt-1 text-[12px] text-muted">{v.desc}</p>
          <div className="mt-5 flex items-end justify-between text-[12px] text-muted"><span>Terpakai</span><span className="font-semibold text-foreground tabular-nums">{v.used}/{v.max}</span></div>
          <div className="mt-1.5 h-2 rounded-full bg-accent/15"><div className="bar-grow h-2 rounded-full bg-gradient-to-r from-accent to-accent-soft" style={{ width: `${(v.used / v.max) * 100}%`, animationDelay: `${i * 110 + 250}ms` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Saldo() {
  const n = useCount(4250000, true, 1500);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 2600);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-soft p-6 text-white">
        <div className="text-[12px] opacity-80">Saldo tersedia</div>
        <div className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight">{rupiah(n)}</div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-[13px] font-semibold backdrop-blur-sm">
          <Icon name="wallet" className="h-4 w-4" /> Tarik dana
        </div>
      </div>
      <div className="rounded-2xl bg-panel/70 p-5 ring-1 ring-black/5 dark:ring-white/10">
        <div className="mb-3 text-[12px] font-semibold text-muted">Penarikan terakhir</div>
        <div className="flex items-center gap-3 rounded-xl bg-accent/[0.07] px-3 py-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors duration-500 ${done ? "bg-[#22c58b]" : "bg-[#ffa43a]"}`}><Icon name={done ? "check" : "clock"} className="h-4 w-4" /></span>
          <span className="flex-1"><span className="block text-[14px] font-semibold tabular-nums">Rp 2.000.000</span><span className="block text-[12px] text-muted">ke rekening terdaftar</span></span>
          <span key={String(done)} className={`pop-in rounded-full px-2.5 py-1 text-[11px] font-semibold ${done ? "bg-[#22c58b]/15 text-[#12a06f]" : "bg-[#ffa43a]/15 text-[#c47a14]"}`}>{done ? "Berhasil" : "Diproses"}</span>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-muted">Pembayaran diproses lewat payment gateway milik Anda sendiri (Xendit atau DOKU) — STUDIODO tidak menahan uang pelanggan Anda.</p>
      </div>
    </div>
  );
}

export function DashboardShowcase() {
  const { ref, visible } = useInView<HTMLDivElement>(0.25);
  const [tab, setTab] = useState<TabId>("omzet");
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!visible || hover) return;
    const t = window.setTimeout(() => setTab((c) => TABS[(TABS.findIndex((x) => x.id === c) + 1) % TABS.length].id), 6500);
    return () => window.clearTimeout(t);
  }, [tab, visible, hover]);

  return (
    <section id="dashboard" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Dashboard" title="Semua booth Anda, satu layar. Bergerak real-time." />
      <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} data-reveal="scale" className="glass mx-auto w-full max-w-[1040px] overflow-hidden p-3 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="hidden gap-1.5 sm:flex"><span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" /></div>
          <div role="tablist" aria-label="Contoh tampilan dashboard" className="flex flex-1 gap-1.5 overflow-x-auto rounded-full bg-black/[0.04] p-1 dark:bg-white/[0.06] sm:flex-none">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition ${tab === t.id ? "bg-panel shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
                <Icon name={t.icon} className="h-4 w-4" />{t.label}
              </button>
            ))}
          </div>
          <span className="ml-auto hidden rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent md:block">Tampilan contoh</span>
        </div>
        <div className="min-h-[360px]" key={tab} role="tabpanel">
          {tab === "omzet" && <Omzet />}
          {tab === "monitor" && <Monitor />}
          {tab === "voucher" && <Voucher />}
          {tab === "saldo" && <Saldo />}
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-accent/10" aria-hidden="true">
          <div key={`${tab}-${hover}`} className={`h-full rounded-full bg-accent ${hover ? "w-0" : "tab-timer"}`} />
        </div>
      </div>
    </section>
  );
}
