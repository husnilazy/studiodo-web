"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { MascotHead } from "./brand/Mascot";
import { BoothScene, MiniShot } from "./brand/BoothScene";
import { RobotBooth } from "./brand/RobotBooth";

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
  // Experiment: ?coba=1 shows a switch between the hero layouts; ?hero=robot | photographer | monitor picks one.
  // useSyncExternalStore keeps server and first client render identical (empty query) and then reads the real URL.
  const search = useSyncExternalStore(() => () => {}, () => window.location.search, () => "");
  const [picked, setPicked] = useState<"monitor" | "photographer" | "robot" | null>(null);
  const q = new URLSearchParams(search);
  const fromUrl = q.get("hero");
  const variant = picked ?? (fromUrl === "robot" || fromUrl === "photographer" || fromUrl === "monitor" ? fromUrl : "photographer");
  const showSwitch = q.get("coba") === "1";
  const [flashes, setFlashes] = useState(0); // bumps on every shutter flash: the mascot's lamp flashes with the kiosk screen
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
      if (phase === 5) { setShot((s) => (s + 1) % n); setFlashes((f) => f + 1); } // the new photo appears the moment the flash peaks
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
    <div ref={root} className="relative mx-auto h-[400px] w-full max-w-[600px] sm:h-[470px]" aria-hidden="true">
      {variant === "robot" && (
        <div className="absolute inset-x-0 top-0 mx-auto h-full w-full max-w-[420px]" data-parallax="0.04">
          <div className="float-a h-full"><RobotBooth phase={phase} shot={shot} flashKey={flashes} /></div>
        </div>
      )}

      {variant !== "robot" && (<>
      {/* The mascot peeks over the top edge of the monitor (it is drawn first, so the monitor covers its lower half) and flashes with every shot. */}
      {variant === "monitor" && (
        <div className="pointer-events-none absolute right-[12%] top-[-26px] z-0 hidden w-[124px] sm:top-[-30px] sm:block">
          <MascotHead flashKey={flashes} />
        </div>
      )}

      {/* A landscape kiosk monitor, like the real booth: the camera view on the left, the photo strip and start button on the right. */}
      {/* Centering uses Tailwind's `translate`, which the inline parallax `translate` would overwrite, so they live on separate elements. */}
      <div className="absolute left-1/2 top-6 w-[min(100%,540px)] -translate-x-1/2">
       <div data-parallax="0.05">
        <div className="float-a">
          <div className="glass rounded-[30px]! p-3 sm:p-3.5">
            <div className="flex aspect-[16/10] gap-2.5 sm:gap-3">
              <div className="relative flex flex-1 items-end overflow-hidden rounded-[20px]">
                {main.src ? <div className={`absolute inset-0 bg-gradient-to-br ${main.gradient}`} /> : <BoothScene phase={phase} shot={shot} robot={variant === "photographer"} flashKey={flashes} />}
                {main.src && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photo of unknown size, served by the API
                  <img key={main.src} src={main.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                {/* viewfinder */}
                <div className={`pointer-events-none absolute inset-3.5 transition-opacity duration-300 ${phase === 6 ? "opacity-0" : "opacity-100"}`}>
                  <span className="absolute left-0 top-0 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-white/90" />
                  <span className="absolute right-0 top-0 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-white/90" />
                  <span className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-white/90" />
                  <span className="absolute bottom-0 right-0 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-white/90" />
                </div>
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-[11px]">
                  <span className={`h-2 w-2 rounded-full ${phase === 6 ? "bg-[#22c58b]" : "animate-pulse bg-[#ff5a6e]"}`} />
                  {phase === 6 ? "Tersimpan" : "LIVE"}
                </div>
                {counting && (
                  <div key={phase} className="pop-in absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-black/45 font-display text-[28px] font-semibold leading-none text-white backdrop-blur-sm sm:h-14 sm:w-14 sm:text-[32px]">
                    {5 - phase}
                  </div>
                )}
                {phase === 5 && <div className="shutter-flash absolute inset-0 bg-white" />}
                <span className="relative m-3.5 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:text-[12px]">{p.cameraLabel}</span>
              </div>
              <div className="flex w-[30%] flex-col gap-2.5 sm:gap-3">
                {[1, 2, 3].map((back, i) => {
                  const ph = photoAt(shot - back);
                  return (
                    <div key={i} className={`relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br ${ph.src ? GRADIENTS[0] : THUMB_GRADIENTS[i]}`}>
                      {!ph.src && <MiniShot i={shot - back + 30} />}
                      {ph.src ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photo, served by the API
                        <img src={ph.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      ) : null}
                    </div>
                  );
                })}
                <div className={`relative flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground text-[13px] font-semibold text-on-foreground transition-transform duration-300 sm:h-12 sm:text-[14px] ${phase === 0 ? "scale-[1.04]" : ""}`}>
                  {phase === 0 && <span className="ping-ring absolute inset-0 rounded-full bg-foreground/40" />}
                  <span className="relative">{p.startButton}</span>
                </div>
              </div>
            </div>
          </div>
          {/* stand */}
          <div className="mx-auto h-7 w-[84px] rounded-b-[10px] bg-gradient-to-b from-foreground/25 to-foreground/10 sm:h-9" />
          <div className="mx-auto h-2.5 w-[180px] rounded-full bg-foreground/20 shadow-[0_6px_14px_rgba(0,0,0,0.18)] sm:w-[220px]" />
        </div>
       </div>
      </div>

      </>)}

      {/* Floating cards */}
      <div data-parallax="-0.1" className="absolute -left-6 -top-1.5 hidden sm:block">
        <div className="float-b">
          <div className={`glass hero-float relative flex items-center gap-3 rounded-[20px]! px-4 py-3.5 transition-all duration-500 ${paid ? "scale-100 opacity-100" : "scale-95 opacity-70"}`}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-gradient-to-br from-accent to-accent-soft text-sm font-semibold text-white">
              Rp
              {phase === 1 && <span className="ping-ring absolute inset-0 rounded-[13px] bg-accent" />}
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

      <div data-parallax="0.14" className="absolute -right-3 -bottom-5 hidden w-[190px] sm:block">
        <div className="float-c">
          <div className="glass hero-float rounded-[20px]! px-4 py-3.5">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="relative flex h-2 w-2"><span className="ping-ring absolute inset-0 rounded-full bg-[#22c58b]" /><span className="relative h-2 w-2 rounded-full bg-[#22c58b]" /></span>
              {p.boothLabel}
            </div>
            <div className="my-1 mb-2.5 font-display text-2xl leading-tight tracking-tight">{p.boothValue}</div>
            <div className="h-1.5 rounded-full bg-accent/15">
              <div className="h-1.5 rounded-full bg-accent transition-all duration-[1400ms] ease-out" style={{ width: `${paid ? p.boothPercent : Math.max(12, p.boothPercent - 30)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div data-parallax="-0.06" className="absolute bottom-3 left-4 hidden sm:block">
        <div className="float-a">
          <div className={`glass hero-float flex items-center gap-3 rounded-[20px]! px-4 py-3 transition-all duration-500 ${phase === 6 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-60"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${phase === 6 ? "bg-[#22c58b]" : "bg-muted/50"}`} />
            <span className="text-sm font-semibold">{p.galleryLabel}</span>
            <Icon name="cloud" className="h-4 w-4 text-accent" />
          </div>
        </div>
      </div>
      {showSwitch && (
        <div className="absolute -bottom-9 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-foreground/90 p-1 text-[12px] font-semibold text-on-foreground" aria-hidden="false">
          {([["monitor", "Monitor"], ["photographer", "Robot memotret"], ["robot", "Robot = photobooth"]] as const).map(([v, label]) => (
            <button key={v} type="button" onClick={() => setPicked(v)} className={`rounded-full px-3 py-1.5 transition ${variant === v ? "bg-accent text-white" : "opacity-70 hover:opacity-100"}`}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
