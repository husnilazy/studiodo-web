"use client";

import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { SectionHeading } from "../SectionHeading";
import { FakeQr, Portrait } from "./PhotoSamples";
import { useInView } from "./hooks";

// "Tap a step to jump": the customer's journey at the kiosk, one mini screen per step. Auto-advances while on screen.

const STEPS = [
  { icon: "ticket", title: "Pilih paket", body: "Pelanggan memilih paket dan frame di layar sentuh. Punya voucher? Tinggal ketik kodenya." },
  { icon: "qr", title: "Bayar QRIS", body: "QR muncul di layar. Begitu lunas, kiosk langsung lanjut sendiri — tanpa kasir, tanpa cek mutasi." },
  { icon: "camera", title: "Foto", body: "Countdown 3-2-1, jepret beberapa pose. Tidak puas? Ulang satu foto saja." },
  { icon: "sparkles", title: "Percantik", body: "Pilih filter, tempel stiker, atur mode cermin. Semua selesai dalam hitungan detik." },
  { icon: "download", title: "Cetak & bagikan", body: "Foto tercetak, dan QR membuka galeri cloud di HP pelanggan untuk unduh foto, GIF, dan video." },
];

const DURATION = 6000;

function Screen({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="flex h-full flex-col gap-3 p-5">
        <div className="text-center font-display text-lg font-semibold">Pilih paketmu</div>
        <div className="grid flex-1 grid-cols-3 gap-2.5">
          {[["Strip", "Rp 25.000"], ["GIF + Cetak", "Rp 35.000"], ["Video", "Rp 45.000"]].map(([n, p], i) => (
            <div key={n} className={`feed-in flex flex-col items-center justify-between rounded-2xl p-3 text-center ring-1 ${i === 1 ? "pkg-pick bg-accent/10 ring-accent" : "bg-panel/80 ring-black/5 dark:ring-white/10"}`} style={{ animationDelay: `${i * 100}ms` }}>
              <Portrait i={i} className="aspect-square w-full rounded-xl" />
              <div><div className="mt-2 text-[13px] font-semibold">{n}</div><div className="text-[12px] text-muted">{p}</div></div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-panel/80 px-4 py-2.5 text-[12px] text-muted ring-1 ring-black/5 dark:ring-white/10"><Icon name="ticket" className="h-4 w-4 text-accent" /><span className="type-code font-semibold tracking-widest text-foreground">HAPPYHOUR</span></div>
      </div>
    );
  if (step === 1)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-5">
        <div className="relative rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
          <FakeQr className="h-[150px] w-[150px]" />
          <div className="qr-scan absolute inset-x-3 h-0.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          <div className="paid-cover absolute inset-0 flex items-center justify-center rounded-2xl bg-[#22c58b]">
            <svg viewBox="0 0 24 24" className="h-16 w-16 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
        </div>
        <div className="relative h-6 w-full text-[13px] font-semibold">
          <span className="pay-wait absolute inset-x-0 text-center text-muted">Menunggu pembayaran…</span>
          <span className="pay-done absolute inset-x-0 text-center text-[#12a06f]">Rp 35.000 diterima!</span>
        </div>
      </div>
    );
  if (step === 2)
    return (
      <div className="relative h-full overflow-hidden">
        <Portrait i={0} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-6 border-2 border-white/80 [clip-path:polygon(0_0,30px_0,30px_3px,3px_3px,3px_30px,0_30px,0_0,calc(100%-30px)_0,100%_0,100%_30px,calc(100%-3px)_30px,calc(100%-3px)_3px,calc(100%-30px)_3px,calc(100%-30px)_0)]" />
        {[0, 1, 2].map((n) => <div key={n} className="count-num absolute inset-0 flex items-center justify-center font-display text-[120px] font-semibold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]" style={{ animationDelay: `${n * 0.9}s` }}>{3 - n}</div>)}
        <div className="shutter-loop absolute inset-0 bg-white" />
        <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5a6e]" />LIVE</span>
      </div>
    );
  if (step === 3)
    return (
      <div className="flex h-full flex-col gap-3 p-5">
        <div className="relative flex-1 overflow-hidden rounded-2xl">
          <Portrait i={2} className="filter-cycle absolute inset-0 h-full w-full" />
          <span className="pop-in absolute right-6 top-6 text-4xl" style={{ animationDelay: "0.6s" }}>✨</span>
          <span className="pop-in absolute bottom-8 left-6 text-4xl" style={{ animationDelay: "1.2s" }}>💖</span>
          <span className="pop-in absolute left-1/3 top-5 text-3xl" style={{ animationDelay: "1.8s" }}>⭐</span>
        </div>
        <div className="flex gap-2 text-[12px] font-semibold">
          {["Asli", "Warm", "Vintage", "B&W"].map((f, i) => <span key={f} className={`chip-cycle rounded-full px-3.5 py-1.5 ring-1 ring-black/5 dark:ring-white/10`} style={{ animationDelay: `${i * 1.2}s` }}>{f}</span>)}
        </div>
      </div>
    );
  return (
    <div className="flex h-full items-center justify-center gap-5 p-5">
      <div className="relative w-[112px] shrink-0 overflow-hidden rounded-md bg-white p-2 pb-5 shadow-xl">
        <div className="flex flex-col gap-1.5">{[0, 1, 2].map((i) => <Portrait key={i} i={i + 1} className="aspect-[4/3] w-full rounded-[3px]" />)}</div>
        <div className="mt-1.5 text-center text-[8px] font-bold tracking-[0.2em] text-accent">STUDIODO</div>
        <div className="shutter-loop absolute inset-0 bg-white" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-xl bg-white p-2 shadow-md ring-1 ring-black/5"><FakeQr className="h-[92px] w-[92px]" /></div>
        <span className="text-[11px] font-semibold text-muted">Scan untuk unduh</span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#22c58b]/15 px-3 py-1 text-[11px] font-semibold text-[#12a06f]"><Icon name="printer" className="h-3.5 w-3.5" />Mencetak…</span>
      </div>
    </div>
  );
}

export function JourneyStepper() {
  const { ref, visible } = useInView<HTMLDivElement>(0.3);
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!visible || pinned) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), DURATION);
    return () => window.clearTimeout(t);
  }, [step, visible, pinned]);

  return (
    <section id="alur" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Alur pelanggan" title="Lima langkah, nol antrean di kasir." />
      <div ref={ref} data-reveal="up" className="grid items-center gap-8 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div role="tablist" aria-label="Langkah pelanggan" className="flex flex-col gap-3">
          <p className="mb-1 text-[13px] text-muted">Tap langkahnya untuk lompat ↓</p>
          {STEPS.map((s, i) => (
            <button key={s.title} role="tab" aria-selected={step === i} onClick={() => { setStep(i); setPinned(true); }} className={`glass relative overflow-hidden p-5 text-left transition ${step === i ? "ring-2 ring-accent/60" : "opacity-75 hover:opacity-100"}`}>
              <div className="flex items-center gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${step === i ? "bg-accent text-white" : "bg-accent/10 text-accent"}`}><Icon name={s.icon} className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <div className="font-display text-[19px] tracking-tight"><span className="mr-2 text-accent/70">{String(i + 1).padStart(2, "0")}</span>{s.title}</div>
                  {step === i && <p key={`b${i}`} className="feed-in mt-1 text-[14px] leading-relaxed text-muted">{s.body}</p>}
                </div>
              </div>
              {step === i && !pinned && <span key={`t${i}`} className="tab-timer-6 absolute inset-x-0 bottom-0 h-[3px] bg-accent" />}
            </button>
          ))}
        </div>
        <div className="mx-auto w-full max-w-[380px]" data-parallax="0.04">
          <div className="float-a">
            <div className="glass rounded-[40px]! p-3.5">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f4f5ff] to-[#fff4f8] dark:from-[#171b30] dark:to-[#1b1830]">
                <div key={step} className="screen-in h-full"><Screen step={step} /></div>
              </div>
              <div className="mt-3 flex justify-center gap-1.5">
                {STEPS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${step === i ? "w-6 bg-accent" : "w-1.5 bg-accent/25"}`} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
