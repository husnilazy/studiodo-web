"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeading } from "../../SectionHeading";
import { Icon } from "../../Icon";
import { FakeQr } from "../PhotoSamples";
import { useInView } from "../hooks";
import { figureSvg, sceneSvg, svgUrl, SCENE_COUNT } from "@/lib/figures";
import { composeStrip, FOOTER, SIZE, SLOTS, THEMES, type FrameTheme, type Orient } from "./compose";
import { useCamera } from "./useCamera";

// "Coba booth-nya": a playable booth on the landing page. The visitor picks portrait/landscape, a frame, multi-camera mode and
// mirror/original, then takes three real photos with their own webcam / phone camera. Without a camera (none connected, permission
// refused, unplugged) the little characters from our reels pose and the shutter fires by itself. The result is composed on a canvas,
// so the printed strip really follows the orientation and frame, and can be downloaded. Nothing is uploaded anywhere.

type Multi = "off" | "alternate" | "dual";
type Step = "ready" | "shoot" | "making" | "result";
type Shot = { a: string; b?: string };

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const fit = (svg: string) => svg.replace("<svg ", '<svg preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block" ');
const stamp = () => new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const CAST_L = { hair: "long" as const, expr: "senang" as const, skin: 1, color: 1, jacket: "#ff6b5a", bag: "#7a6bff" };
const CAST_R = { hair: "hijab" as const, expr: "lega" as const, skin: 3, color: 3, scarf: "#7a6bff", glasses: true };

/** The frame as a thumbnail: same rectangles as the real output, filled with little vector scenes. */
function FrameThumb({ orient, theme, className = "" }: { orient: Orient; theme: FrameTheme; className?: string }) {
  const { w, h } = SIZE[orient];
  const f = FOOTER[orient];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden="true">
      <rect width={w} height={h} rx="40" fill={theme.bg} />
      <defs>{SLOTS[orient].map((r, i) => <clipPath key={i} id={`ft-${theme.id}-${orient}-${i}`}><rect x={r.x} y={r.y} width={r.w} height={r.h} rx="28" /></clipPath>)}</defs>
      {SLOTS[orient].map((r, i) => (
        <g key={i} clipPath={`url(#ft-${theme.id}-${orient}-${i})`}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={theme.slot} />
          <image href={svgUrl(sceneSvg(i * 2 + 1))} x={r.x} y={r.y} width={r.w} height={r.h} preserveAspectRatio="xMidYMid slice" />
        </g>
      ))}
      <circle cx={f.x + 34} cy={f.y + f.h / 2} r="18" fill={theme.accent} />
      <rect x={f.x + 70} y={f.y + f.h / 2 - 12} width={w * 0.2} height="24" rx="12" fill={theme.ink} opacity="0.75" />
    </svg>
  );
}

function Seg<T extends string>({ value, onChange, options, disabled }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; sub?: string }[]; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} disabled={disabled} onClick={() => onChange(o.v)}
          className={`rounded-2xl px-4 py-2.5 text-left text-[13px] font-semibold ring-1 transition disabled:opacity-50 ${value === o.v ? "bg-accent/12 text-accent ring-accent" : "bg-panel/70 ring-black/10 hover:ring-accent/50 dark:ring-white/12"}`}>
          {o.label}
          {o.sub && <span className="block text-[11px] font-normal text-muted">{o.sub}</span>}
        </button>
      ))}
    </div>
  );
}

export function BoothDemo() {
  const { ref, visible } = useInView<HTMLElement>(0.3);
  const cam = useCamera();
  const [orient, setOrient] = useState<Orient>("portrait");
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [multi, setMulti] = useState<Multi>("off");
  const [mirror, setMirror] = useState(true);
  const [step, setStep] = useState<Step>("ready");
  const [count, setCount] = useState(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [base, setBase] = useState(3);
  const [angleNow, setAngleNow] = useState<1 | 2>(1);
  const [flash, setFlash] = useState(0);
  const [pick, setPick] = useState<1 | 2>(1);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const video = useRef<HTMLVideoElement | null>(null);
  const run = useRef(0);
  const touched = useRef(false);
  const autoDone = useRef(false);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const camOn = cam.status === "live" && !!cam.stream;
  const busy = step === "shoot" || step === "making";

  // Attach the stream to whichever <video> is mounted (ready and shoot screens).
  const setVideo = useCallback((el: HTMLVideoElement | null) => {
    video.current = el;
    if (el && cam.stream && el.srcObject !== cam.stream) el.srcObject = cam.stream;
  }, [cam.stream]);

  const grab = useCallback((angle: 1 | 2, idx: number): string => {
    const v = video.current;
    if (camOn && v && v.videoWidth) {
      const vw = v.videoWidth, vh = v.videoHeight;
      const z = angle === 2 ? 1.7 : 1; // a second physical camera is not available in a browser: Sudut 2 is a tighter crop, and says so
      const sw = vw / z, sh = vh / z;
      const sx = angle === 2 ? vw * 0.36 : 0, sy = angle === 2 ? vh * 0.1 : 0;
      const c = document.createElement("canvas");
      c.width = 960; c.height = Math.round(960 * (vh / vw));
      c.getContext("2d")?.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", 0.9);
    }
    return svgUrl(sceneSvg(idx, angle));
  }, [camOn]);

  const start = useCallback(async () => {
    const token = ++run.current;
    const alive = () => token === run.current;
    const b0 = Math.floor(Math.random() * SCENE_COUNT);
    setBase(b0);
    setErr("");
    setOut("");
    setShots([]);
    setPick(1);
    setStep("shoot");
    const got: Shot[] = [];
    try {
      for (let i = 0; i < 3; i++) {
        const angle: 1 | 2 = multi === "alternate" && i % 2 === 1 ? 2 : 1;
        setAngleNow(angle);
        for (let c = 3; c > 0; c--) {
          setCount(c);
          await sleep(850);
          if (!alive()) return;
        }
        setCount(0);
        setFlash((n) => n + 1);
        const a = grab(angle, b0 + i);
        const b = multi === "dual" ? grab(2, b0 + i) : undefined;
        got.push({ a, b });
        setShots([...got]);
        await sleep(750);
        if (!alive()) return;
      }
      setStep("making");
      await sleep(900);
      if (!alive()) return;
      setStep("result");
    } catch {
      if (alive()) { setErr("Foto gagal diambil, coba lagi."); setStep("ready"); }
    }
  }, [grab, multi]);

  const reset = useCallback(() => {
    run.current++;
    setStep("ready");
    setShots([]);
    setOut("");
    setCount(0);
  }, []);

  // Compose the print whenever the result or any choice changes (orientation switches re-flow the same photos into the other layout).
  useEffect(() => {
    if (step !== "result" || !shots.length) return;
    let dead = false;
    const urls = shots.map((s) => (pick === 2 && s.b ? s.b : s.a));
    composeStrip(urls, orient, theme, mirror && camOn, stamp())
      .then((u) => { if (!dead) setOut(u); })
      .catch(() => { if (!dead) setErr("Hasil gagal dibuat."); });
    return () => { dead = true; };
  }, [step, shots, pick, orient, theme, mirror, camOn]);

  // Let the page feel alive: the first time the booth scrolls into view and nobody has touched it, the characters take a first photo set on their own.
  useEffect(() => {
    if (!visible || autoDone.current || touched.current || camOn) return;
    const t = window.setTimeout(() => {
      if (touched.current || autoDone.current) return;
      autoDone.current = true;
      void start();
    }, 1400);
    return () => window.clearTimeout(t);
  }, [visible, camOn, start]);

  useEffect(() => () => { run.current++; }, []);

  const touch = () => { touched.current = true; };
  const useMyCamera = async () => { touch(); reset(); await cam.start(); };

  const portrait = orient === "portrait";
  const sceneIdx = shots.length;
  const pose = step === "shoot" ? "hold" : step === "result" ? "up" : "wave";

  return (
    <section ref={ref} id="coba" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Coba sendiri" title="Rasakan jadi pengunjung booth, langsung dari sini." />
      <p data-reveal="up" className="mx-auto -mt-6 max-w-[620px] text-center text-[16px] leading-relaxed text-muted">
        Pilih orientasi dan frame, lalu foto lewat kamera HP atau webcam Anda. Kalau kamera tidak tersambung, karakter kami yang berpose dan jepret sendiri. Foto diproses di browser Anda dan tidak diunggah.
      </p>

      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ---------- controls ---------- */}
        <div data-reveal="up" className="glass flex flex-col gap-6 p-6 md:p-7">
          <div>
            <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">1 · Orientasi layar</div>
            <Seg value={orient} disabled={busy} onChange={(v) => { touch(); setOrient(v); }} options={[{ v: "portrait", label: "Portrait", sub: "Layar tegak" }, { v: "landscape", label: "Landscape", sub: "Layar lebar" }]} />
            <p className="mt-2 text-[12px] text-muted">Layar, frame, dan hasil cetak ikut menyesuaikan otomatis, bahkan setelah foto jadi.</p>
          </div>
          <div>
            <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">2 · Frame</div>
            <div className="flex gap-3">
              {THEMES.map((t) => (
                <button key={t.id} type="button" disabled={busy} onClick={() => { touch(); setThemeId(t.id); }} aria-label={`Frame ${t.name}`} aria-pressed={t.id === themeId}
                  className={`flex w-[84px] flex-col items-center gap-1.5 rounded-2xl p-2 ring-1 transition disabled:opacity-50 ${t.id === themeId ? "bg-accent/10 ring-accent" : "bg-panel/70 ring-black/10 dark:ring-white/12"}`}>
                  <div className="flex h-[74px] w-full items-center justify-center"><FrameThumb orient={orient} theme={t} className={portrait ? "h-full w-auto" : "h-auto w-full"} /></div>
                  <span className="text-[11px] font-semibold">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">3 · Multi kamera</div>
            <Seg value={multi} disabled={busy} onChange={(v) => { touch(); setMulti(v); }} options={[{ v: "off", label: "Satu kamera" }, { v: "alternate", label: "Bergantian", sub: "Foto 2 dari Sudut 2" }, { v: "dual", label: "Dua sudut", sub: "Pilih sudut di hasil" }]} />
            {multi !== "off" && camOn && <p className="mt-2 text-[12px] text-muted">Browser hanya membuka satu kamera, jadi Sudut 2 di sini berupa potongan lebih dekat. Di booth asli ini kamera kedua yang terpisah.</p>}
          </div>
          <div>
            <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">4 · Hasil cetak</div>
            <Seg value={mirror ? "m" : "a"} onChange={(v) => { touch(); setMirror(v === "m"); }} options={[{ v: "m", label: "Cermin", sub: "Sama seperti layar" }, { v: "a", label: "Asli", sub: "Seperti dilihat orang" }]} />
          </div>
          <div className="flex flex-col gap-2.5 border-t border-black/5 pt-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <button type="button" onClick={camOn ? () => { touch(); cam.stop(); reset(); } : useMyCamera} disabled={busy || cam.status === "asking"} className="btn btn-primary px-5 py-3 text-sm disabled:opacity-60">
                {cam.status === "asking" ? "Menunggu izin…" : camOn ? "Matikan kamera saya" : "Pakai kamera saya"}
              </button>
              <span className={`flex items-center gap-2 text-[12px] font-semibold ${camOn ? "text-[#12a06f]" : "text-muted"}`}>
                <span className={`h-2 w-2 rounded-full ${camOn ? "bg-[#22c58b]" : "bg-muted/50"}`} />
                {camOn ? "Kamera tersambung" : "Ilustrasi otomatis"}
              </span>
            </div>
            {cam.reason && <p className="text-[12px] text-[#c2410c]" role="status">{cam.reason}</p>}
          </div>
        </div>

        {/* ---------- the booth ---------- */}
        <div data-reveal="up" data-delay="120" className="relative mx-auto flex w-full max-w-[820px] items-end justify-center gap-2 sm:gap-4">
          <div className="bd-bob hidden w-[100px] shrink-0 xl:block" dangerouslySetInnerHTML={{ __html: figureSvg({ ...CAST_L, pose }) }} />

          <div className="flex w-full max-w-[580px] flex-col items-center">
            {/* camera head: the lenses light up with the multi-camera mode, the lamp flashes on every shot */}
            <div className="relative z-10 -mb-3 flex items-center justify-center gap-4 rounded-[26px] bg-gradient-to-b from-[#3b3566] to-[#1d1a38] px-6 py-3 shadow-[0_10px_30px_rgba(40,30,110,0.35)]">
              <span key={flash} className={`h-6 w-9 rounded-xl bg-gradient-to-b from-[#ffe6ad] to-[#ffb040] ${flash ? "bd-flash" : ""}`} aria-hidden="true" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0c0b1c] ring-4 ring-[#5b5588]" aria-label="Kamera 1">
                <span className="h-5 w-5 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#1b1b30]" />
                {busy && angleNow === 1 && <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-[#ff5a6e]" />}
              </span>
              <span className={`relative flex h-9 w-9 items-center justify-center rounded-full ring-4 transition ${multi === "off" ? "bg-[#12112a] opacity-30 ring-[#3a3566]" : "bg-[#0c0b1c] ring-[#8a7bff]"}`} aria-label="Kamera 2">
                <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#1b1b30]" />
                {busy && angleNow === 2 && multi !== "off" && <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-[#ff5a6e]" />}
              </span>
            </div>

            {/* screen: its shape follows the chosen orientation */}
            <div className="relative w-full rounded-[34px] bg-gradient-to-b from-[#2b2750] to-[#14122b] p-3.5 shadow-[0_24px_60px_rgba(40,30,110,0.32)]">
              <div className="mx-auto overflow-hidden rounded-[22px] bg-[#0c0b1c] transition-all duration-500" style={{ width: portrait ? "88%" : "100%", aspectRatio: portrait ? "3 / 4" : "4 / 3" }}>
                <div className="relative h-full w-full">
                  {(step === "ready" || step === "shoot") && (
                    <>
                      {camOn ? (
                        <video ref={setVideo} autoPlay muted playsInline className="h-full w-full object-cover"
                          style={{ transform: `scaleX(-1)${angleNow === 2 && step === "shoot" ? " scale(1.7)" : ""}`, transformOrigin: "62% 40%", transition: "transform .4s" }} />
                      ) : (
                        <div key={`${step}-${sceneIdx}-${angleNow}`} className="bd-pop h-full w-full" dangerouslySetInnerHTML={{ __html: fit(sceneSvg(base + sceneIdx, angleNow)) }} />
                      )}
                      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff5a6e]" />{camOn ? "LIVE" : "DEMO"}{multi !== "off" && ` · SUDUT ${angleNow}`}
                      </span>
                    </>
                  )}
                  {step === "ready" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-end gap-3 bg-gradient-to-t from-black/55 via-transparent to-transparent p-5">
                      <button type="button" onClick={() => { touch(); void start(); }} className="btn btn-primary bd-pulse px-7 py-3.5 text-[15px]">Sentuh untuk mulai</button>
                      <span className="text-[11px] font-medium text-white/85">3 foto · countdown 3-2-1</span>
                    </div>
                  )}
                  {step === "shoot" && (
                    <>
                      {count > 0 && <div key={`${shots.length}-${count}`} className="bd-pop absolute inset-0 flex items-center justify-center font-display text-[110px] font-semibold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.4)]">{count}</div>}
                      <div key={flash} className={`pointer-events-none absolute inset-0 bg-white ${flash ? "bd-shutter" : "opacity-0"}`} />
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2">
                        {[0, 1, 2].map((i) => <span key={i} className={`h-2 w-8 rounded-full transition ${i < shots.length ? "bg-[#22c58b]" : i === shots.length ? "bg-white" : "bg-white/35"}`} />)}
                      </div>
                    </>
                  )}
                  {step === "making" && (
                    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#14122b] text-white">
                      <span className="spin h-9 w-9 rounded-full border-4 border-white/20 border-t-white" />
                      <span className="text-[13px] font-semibold">Mencetak foto Anda…</span>
                    </div>
                  )}
                  {step === "result" && (
                    <div className="bd-pop flex h-full flex-col items-center gap-2.5 bg-[#14122b] p-3 text-white">
                      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                        {out ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={out} alt="Hasil foto demo Anda" className="max-h-full max-w-full rounded-lg object-contain shadow-lg" />
                        ) : <span className="spin h-7 w-7 rounded-full border-4 border-white/20 border-t-white" />}
                      </div>
                      <div className="flex w-full items-center justify-between gap-2">
                        <FakeQr className="h-8 w-8 shrink-0 rounded bg-white p-0.5" />
                        <span className="text-[10px] leading-tight text-white/75">QR galeri (contoh)</span>
                        <button type="button" onClick={reset} className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/25">Ulangi</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-white/15" />
            </div>

            {/* base: QRIS plate and the printer slot, the strip slides out when the shots are done */}
            <div className="relative -mt-2 flex w-[88%] flex-col items-center rounded-b-[30px] bg-gradient-to-b from-[#26224a] to-[#171432] px-5 pb-5 pt-6">
              <div className="flex w-full items-center justify-between gap-3">
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest text-white/80">QRIS</span>
                <div className="relative h-3 flex-1 rounded-full bg-black/60" />
                <span className="text-[10px] font-semibold text-white/60">{portrait ? "PORTRAIT" : "LANDSCAPE"}</span>
              </div>
              <div className="relative mt-3 h-[110px] w-[70%] overflow-hidden">
                {step === "result" && out && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={out.length} src={out} alt="" aria-hidden="true" className="bd-strip absolute inset-x-0 top-0 mx-auto w-[56%] rounded-md shadow-xl" style={{ width: portrait ? "36%" : "62%" }} />
                )}
                <div className="absolute inset-x-0 top-0 h-2 rounded-full bg-black/70" />
              </div>
            </div>
          </div>

          <div className="bd-bob hidden w-[100px] shrink-0 xl:block" style={{ animationDelay: "-1.4s" }} dangerouslySetInnerHTML={{ __html: figureSvg({ ...CAST_R, pose: step === "result" ? "wave" : step === "shoot" ? "chin" : "down" }) }} />
        </div>
      </div>

      {step === "result" && (
        <div className="mx-auto flex flex-wrap items-center justify-center gap-3" data-reveal="up">
          {out && <a href={out} download={`studiodo-demo-${orient}.jpg`} className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"><Icon name="download" className="h-4 w-4" />Unduh hasil ({portrait ? "portrait" : "landscape"})</a>}
          {multi === "dual" && shots.some((s) => s.b) && (
            <Seg value={String(pick) as "1" | "2"} onChange={(v) => setPick(v === "2" ? 2 : 1)} options={[{ v: "1", label: "Pakai Sudut 1" }, { v: "2", label: "Pakai Sudut 2" }]} />
          )}
          <a href="/daftar" className="btn px-6 py-3 text-sm">Pasang di booth saya</a>
        </div>
      )}
      {err && <p className="text-center text-sm text-[#c2410c]" role="alert">{err}</p>}
    </section>
  );
}
