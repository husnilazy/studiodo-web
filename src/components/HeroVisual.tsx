"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

// The hero's kiosk illustration, brought to life: it loops through a real booth session — a QRIS payment
// arrives, a 3-2-1 countdown runs, the shutter flashes, the photo lands in the strip and the gallery is ready.
// Photos come from the CMS (Hero → "Foto di layar kiosk"); without any, soft gradients stand in so the loop
// still plays. Under prefers-reduced-motion it stays on one still frame.

type Props = {
  images: string[];
  cameraLabel: string;
  startButton: string;
  paymentLabel: string;
  paymentValue: string;
  boothLabel: string;
  boothValue: string;
  boothPercent: number;
  galleryLabel: string;
};

const GRADIENTS = [
  "from-[#ffd3e4] to-[#c7ceff]",
  "from-[#ffe3b8] to-[#ffc8de]",
  "from-[#b8f0e6] to-[#bfd8ff]",
  "from-[#d5ccff] to-[#bfc6ff]",
];
const THUMB_GRADIENTS = ["from-[#ffe3b8] to-[#ffc8de]", "from-[#b8f0e6] to-[#bfd8ff]", "from-[#d5ccff] to-[#bfc6ff]"];

// phase: 0 idle · 1 payment received · 2/3/4 countdown 3-2-1 · 5 flash · 6 photo ready
const DURATIONS = [1000, 1700, 850, 850, 850, 350, 3000];

export function HeroVisual(p: Props) {
  const [phase, setPhase] = useState(0);
  const [shot, setShot] = useState(0); // index of the photo currently on the big screen
  const [running, setRunning] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const n = Math.max(p.images.length, GRADIENTS.length);

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The observer fires once right after mount, which is also where a reduced-motion visitor is parked on one still frame.
    const io = new IntersectionObserver(([e]) => {
      if (reduce) { setPhase(6); setRunning(false); return; }
      setRunning(e.isIntersecting && !document.hidden);
    }, { threshold: 0.2 });
    io.observe(el);
    const onVis = () => { if (!reduce) setRunning(!document.hidden); };
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      if (phase === 5) setShot((s) => (s + 1) % n); // the new photo appears the moment the flash peaks
      setPhase((ph) => (ph + 1) % DURATIONS.length);
    }, DURATIONS[phase]);
    return () => window.clearTimeout(t);
  }, [phase, running, n]);

  const photoAt = (i: number) => {
    const idx = ((i % n) + n) % n;
    return { src: p.images.length ? p.images[idx % p.images.length] : null, gradient: GRADIENTS[idx % GRADIENTS.length] };
  };
  const main = photoAt(shot);
  const counting = phase >= 2 && phase <= 4;
  const paid = phase >= 1 && phase <= 6;

  return (
    <div ref={root} className="relative mx-auto h-[640px] w-full max-w-[600px] sm:h-[660px]" aria-hidden="true">
      {/* Phone / kiosk screen */}
      {/* Centering uses Tailwind's `translate`, which the inline parallax `translate` would overwrite — so they live on separate elements. */}
      <div className="absolute left-1/2 top-2.5 -translate-x-1/2 lg:left-[150px] lg:translate-x-0">
       <div data-parallax="0.05">
        <div className="float-a">
          <div className="glass flex h-[620px] w-[320px] flex-col gap-3 rounded-[44px]! p-4">
            <div className="relative flex flex-1 items-end overflow-hidden rounded-[30px]">
              <div className={`absolute inset-0 bg-gradient-to-br ${main.gradient}`} />
              {main.src && (
                // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photo of unknown size, served by the API
                <img key={main.src} src={main.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              {/* viewfinder */}
              <div className={`pointer-events-none absolute inset-4 transition-opacity duration-300 ${phase === 6 ? "opacity-0" : "opacity-100"}`}>
                <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-white/90" />
                <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-white/90" />
                <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-white/90" />
                <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-white/90" />
              </div>
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                <span className={`h-2 w-2 rounded-full ${phase === 6 ? "bg-[#22c58b]" : "animate-pulse bg-[#ff5a6e]"}`} />
                {phase === 6 ? "Tersimpan" : "LIVE"}
              </div>
              {counting && (
                <div key={phase} className="pop-in absolute inset-0 flex items-center justify-center font-display text-[120px] font-semibold leading-none text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
                  {5 - phase}
                </div>
              )}
              {phase === 5 && <div className="shutter-flash absolute inset-0 bg-white" />}
              <span className="relative m-5 rounded-full bg-black/30 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm">{p.cameraLabel}</span>
            </div>
            <div className="grid h-[110px] grid-cols-3 gap-2.5">
              {[1, 2, 3].map((back, i) => {
                const ph = photoAt(shot - back);
                return (
                  <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${ph.src ? GRADIENTS[0] : THUMB_GRADIENTS[i]}`}>
                    {ph.src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photo, served by the API
                      <img src={ph.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className={`relative flex h-[54px] items-center justify-center overflow-hidden rounded-full bg-foreground text-[15px] font-semibold text-on-foreground transition-transform duration-300 ${phase === 0 ? "scale-[1.03]" : ""}`}>
              {phase === 0 && <span className="ping-ring absolute inset-0 rounded-full bg-foreground/40" />}
              <span className="relative">{p.startButton}</span>
            </div>
          </div>
        </div>
       </div>
      </div>

      {/* Floating cards */}
      <div data-parallax="-0.1" className="absolute left-0 top-[120px] hidden sm:block">
        <div className="float-b">
          <div className={`glass relative flex items-center gap-3.5 rounded-[22px]! px-5 py-4 transition-all duration-500 ${paid ? "scale-100 opacity-100" : "scale-95 opacity-70"}`}>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-accent to-accent-soft text-sm font-semibold text-white">
              Rp
              {phase === 1 && <span className="ping-ring absolute inset-0 rounded-[14px] bg-accent" />}
            </div>
            <div>
              <div className="text-xs text-muted">{p.paymentLabel}</div>
              <div className="font-display text-xl tracking-tight">{p.paymentValue}</div>
            </div>
            {paid && phase !== 0 && (
              <span key={phase === 1 ? "in" : "stay"} className={`${phase === 1 ? "pop-in" : ""} absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#22c58b] text-white`}>
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div data-parallax="0.14" className="absolute right-0 top-[330px] hidden w-[200px] sm:block">
        <div className="float-c">
          <div className="glass rounded-[22px]! px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="relative flex h-2 w-2"><span className="ping-ring absolute inset-0 rounded-full bg-[#22c58b]" /><span className="relative h-2 w-2 rounded-full bg-[#22c58b]" /></span>
              {p.boothLabel}
            </div>
            <div className="my-1 mb-2.5 font-display text-3xl tracking-tight">{p.boothValue}</div>
            <div className="h-1.5 rounded-full bg-accent/15">
              <div className="h-1.5 rounded-full bg-accent transition-all duration-[1400ms] ease-out" style={{ width: `${paid ? p.boothPercent : Math.max(12, p.boothPercent - 30)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div data-parallax="-0.06" className="absolute bottom-7 left-4 hidden sm:block">
        <div className="float-a">
          <div className={`glass flex items-center gap-3 rounded-[22px]! px-[18px] py-3.5 transition-all duration-500 ${phase === 6 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-60"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${phase === 6 ? "bg-[#22c58b]" : "bg-muted/50"}`} />
            <span className="text-sm font-semibold">{p.galleryLabel}</span>
            <Icon name="cloud" className="h-4 w-4 text-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
