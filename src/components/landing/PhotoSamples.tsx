"use client";

import { useId } from "react";
import { Icon } from "../Icon";
import { SectionHeading } from "../SectionHeading";

// Illustrated sample "photos" (flat SVG, no real people) used to show what a booth session produces:
// a printed strip sliding out, a GIF flipbook, and the QR → cloud gallery on the customer's phone.

type Look = { a: string; b: string; skin: string; hair: string; shirt: string; two?: boolean; prop?: "heart" | "star" | "glasses" };
const LOOKS: Look[] = [
  { a: "#ffd3e4", b: "#c7ceff", skin: "#f5c6a5", hair: "#2b2140", shirt: "#4f4fe8", two: true, prop: "heart" },
  { a: "#ffe3b8", b: "#ffc8de", skin: "#e9ad86", hair: "#1c1c28", shirt: "#ff6f91", prop: "star" },
  { a: "#b8f0e6", b: "#bfd8ff", skin: "#fad5b8", hair: "#6b3f2a", shirt: "#12a06f", two: true, prop: "glasses" },
  { a: "#d5ccff", b: "#bfc6ff", skin: "#d99a73", hair: "#15131f", shirt: "#ffa43a", prop: "heart" },
];

function Person({ x, s, look, tilt = 0 }: { x: number; s: number; look: Look; tilt?: number }) {
  return (
    <g transform={`translate(${x} 0) rotate(${tilt} ${100} 200) scale(${s})`} style={{ transformOrigin: "100px 200px" }}>
      <path d="M30 220c0-34 30-52 70-52s70 18 70 52z" fill={look.shirt} />
      <rect x="88" y="138" width="24" height="34" rx="10" fill={look.skin} />
      <circle cx="100" cy="112" r="38" fill={look.skin} />
      <path d="M60 108c-2-30 20-48 42-46 24 2 40 22 36 48-8-18-20-28-40-28-16 0-30 8-38 26z" fill={look.hair} />
      <circle cx="87" cy="116" r="3.6" fill="#1b1730" /><circle cx="113" cy="116" r="3.6" fill="#1b1730" />
      <path d="M88 130q12 12 24 0" stroke="#1b1730" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <circle cx="78" cy="127" r="6" fill="#ff8aa5" opacity=".45" /><circle cx="122" cy="127" r="6" fill="#ff8aa5" opacity=".45" />
      {look.prop === "glasses" && <g fill="none" stroke="#1b1730" strokeWidth="3"><circle cx="87" cy="116" r="10" /><circle cx="113" cy="116" r="10" /><path d="M97 116h6" /></g>}
    </g>
  );
}

export function Portrait({ i, className = "" }: { i: number; className?: string }) {
  const look = LOOKS[i % LOOKS.length];
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={look.a} /><stop offset="1" stopColor={look.b} /></linearGradient></defs>
      <rect width="200" height="200" fill={`url(#${id})`} />
      <circle cx="40" cy="38" r="26" fill="#fff" opacity=".35" /><circle cx="170" cy="70" r="16" fill="#fff" opacity=".3" />
      {look.two ? (<><Person x={-34} s={0.78} look={{ ...look, shirt: look.hair === "#2b2140" ? "#ff6f91" : "#4f4fe8", hair: "#3a2a1c" }} tilt={-6} /><Person x={44} s={0.78} look={look} tilt={6} /></>) : <Person x={0} s={0.92} look={look} />}
      {look.prop === "heart" && <path d="M165 40c-6-10-20-4-14 8 3 5 14 12 14 12s11-7 14-12c6-12-8-18-14-8z" fill="#ff5a8a" />}
      {look.prop === "star" && <path d="M170 28l5 11 12 2-9 8 3 12-11-6-11 6 3-12-9-8 12-2z" fill="#ffc94a" />}
    </svg>
  );
}

function Strip() {
  return (
    <div className="relative mx-auto flex h-[420px] w-[200px] items-start justify-center overflow-hidden">
      {/* printer slot */}
      <div className="absolute inset-x-0 top-0 z-10 h-7 rounded-b-2xl bg-foreground shadow-lg" />
      <div className="absolute inset-x-6 top-6 z-10 h-1 rounded-full bg-accent-soft/70 blur-[1px]" />
      <div className="strip-print absolute top-5 w-[148px] rounded-md bg-white p-2.5 pb-7 shadow-[0_14px_36px_rgba(60,70,140,0.28)]">
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => <Portrait key={i} i={i} className="aspect-[4/3] w-full rounded-[3px]" />)}
        </div>
        <div className="mt-2 text-center font-display text-[11px] font-semibold tracking-[0.25em] text-accent">STUDIODO</div>
      </div>
    </div>
  );
}

function Flipbook() {
  return (
    <div className="relative mx-auto w-[240px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_14px_36px_rgba(60,70,140,0.22)]">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          {[0, 1, 2, 3].map((i) => <Portrait key={i} i={i} className="flip-frame absolute inset-0 h-full w-full" />)}
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-sm">GIF</span>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-accent/15"><div className="flip-progress h-full rounded-full bg-accent" /></div>
    </div>
  );
}

// Deterministic fake QR (not scannable — purely decorative).
const QR = (() => {
  const n = 21; const cells: [number, number][] = []; let s = 7;
  const finder = (x: number, y: number) => x < 8 && y < 8 || x > n - 9 && y < 8 || x < 8 && y > n - 9;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { s = (s * 9301 + 49297) % 233280; if (!finder(x, y) && s / 233280 > 0.5) cells.push([x, y]); }
  return { n, cells };
})();

export function FakeQr({ className = "h-[132px] w-[132px]" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${QR.n} ${QR.n}`} className={className} shapeRendering="crispEdges" aria-hidden="true">
      {[[0, 0], [QR.n - 7, 0], [0, QR.n - 7]].map(([x, y]) => (<g key={`${x}${y}`}><rect x={x} y={y} width="7" height="7" fill="#0b1020" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="#0b1020" /></g>))}
      {QR.cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0b1020" />)}
    </svg>
  );
}

function PhoneGallery() {
  return (
    <div className="relative mx-auto h-[420px] w-[220px] rounded-[34px] bg-foreground p-2 shadow-[0_20px_50px_rgba(11,16,32,0.3)]">
      <div className="relative h-full overflow-hidden rounded-[27px] bg-panel">
        <div className="px-4 pb-2 pt-4 text-center text-[11px] font-semibold text-muted">galeri.studiodo.id</div>
        <div className="grid grid-cols-2 gap-1.5 px-2.5">
          {[0, 1, 2, 3].map((i) => <Portrait key={i} i={i} className="gallery-pop aspect-square w-full rounded-xl" />)}
        </div>
        <div className="mx-2.5 mt-3 flex items-center justify-center gap-1.5 rounded-full bg-accent py-2 text-[12px] font-semibold text-white"><Icon name="download" className="h-3.5 w-3.5" />Unduh semua</div>
        {/* QR overlay that scans, then reveals the gallery */}
        <div className="qr-overlay absolute inset-0 flex flex-col items-center justify-center gap-3 bg-panel">
          <div className="relative rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
            <svg viewBox={`0 0 ${QR.n} ${QR.n}`} className="h-[132px] w-[132px]" shapeRendering="crispEdges" aria-hidden="true">
              {[[0, 0], [QR.n - 7, 0], [0, QR.n - 7]].map(([x, y]) => (<g key={`${x}${y}`}><rect x={x} y={y} width="7" height="7" fill="#0b1020" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="#0b1020" /></g>))}
              {QR.cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0b1020" />)}
            </svg>
            <div className="qr-scan absolute inset-x-3 h-0.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          </div>
          <div className="text-[12px] font-semibold text-muted">Scan untuk ambil foto</div>
        </div>
      </div>
    </div>
  );
}

const CARDS = [
  { title: "Cetak instan", body: "Strip, grid, atau satu foto keluar dari printer dalam hitungan detik — lengkap dengan frame brand Anda.", node: <Strip />, tag: "Cetak" },
  { title: "GIF & video otomatis", body: "Setiap sesi bisa jadi GIF atau video pendek yang siap di-posting. Pelanggan makin sering membagikan.", node: <Flipbook />, tag: "Digital" },
  { title: "Scan, simpan, bagikan", body: "QR di layar kiosk membuka galeri cloud di HP pelanggan. Tanpa kabel, tanpa kirim satu-satu.", node: <PhoneGallery />, tag: "Galeri" },
];

const FRAME_COLORS = [["#4f4fe8", "#fff"], ["#ff6f91", "#fff0f6"], ["#12a06f", "#eafbf8"], ["#ffa43a", "#fff6e6"], ["#0b1020", "#c7ceff"], ["#9aa6ff", "#edefff"], ["#e0455a", "#fff"], ["#2d8cff", "#eaf2ff"]];

function FrameStrips() {
  const row = [...FRAME_COLORS, ...FRAME_COLORS];
  return (
    <div className="relative overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" aria-hidden="true">
      <div className="marquee flex w-max gap-5">
        {row.map(([c, bg], i) => (
          <div key={i} className="w-[84px] shrink-0 rounded-md p-1.5 pb-4 shadow-[0_10px_24px_rgba(60,70,140,0.18)]" style={{ background: bg, boxShadow: `0 0 0 3px ${c}, 0 10px 24px rgba(60,70,140,.18)` }}>
            <div className="flex flex-col gap-1">{[0, 1, 2].map((k) => <Portrait key={k} i={i + k} className="aspect-[4/3] w-full rounded-[2px]" />)}</div>
            <div className="mt-1 text-center text-[7px] font-bold tracking-[0.2em]" style={{ color: c }}>STUDIODO</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhotoSamples() {
  return (
    <section id="hasil" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Hasil sesi" title="Dari satu tap jadi foto, GIF, dan galeri yang dibagikan." />
      <div className="grid gap-6 lg:grid-cols-3">
        {CARDS.map((c, i) => (
          <article key={c.title} data-reveal="up" data-delay={String(i * 120)} className="glass lift flex flex-col gap-6 overflow-hidden p-7 sm:p-8">
            <div className="flex h-[440px] items-center justify-center">{c.node}</div>
            <div>
              <span className="eyebrow mb-2 inline-block">{c.tag}</span>
              <h3 className="mb-2 font-display text-2xl tracking-tight">{c.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{c.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div data-reveal="up" className="flex flex-col items-center gap-2 text-center">
        <p className="text-[15px] font-semibold">Frame sesuai tema event — pasang dari marketplace dalam satu klik</p>
        <FrameStrips />
        <p className="text-[12px] text-muted">Ilustrasi contoh. Hasil asli memakai foto pelanggan Anda.</p>
      </div>
    </section>
  );
}
