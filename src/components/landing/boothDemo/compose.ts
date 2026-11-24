// Frame layouts for the demo booth. One set of normalised rectangles drives both the on-screen thumbnails (SVG) and the
// downloadable image (canvas), so what the visitor picks is exactly what they get — in portrait AND landscape, like the real kiosk.

export type Orient = "portrait" | "landscape";
export type Rect = { x: number; y: number; w: number; h: number };
export type FrameTheme = { id: string; name: string; bg: string; ink: string; slot: string; accent: string };

export const SIZE: Record<Orient, { w: number; h: number }> = { portrait: { w: 1200, h: 1800 }, landscape: { w: 1800, h: 1200 } };

// 3 photo slots + a footer band (caption). Numbers are on the 1200x1800 / 1800x1200 canvases.
export const SLOTS: Record<Orient, Rect[]> = {
  portrait: [
    { x: 60, y: 60, w: 1080, h: 810 },
    { x: 60, y: 900, w: 525, h: 700 },
    { x: 615, y: 900, w: 525, h: 700 },
  ],
  landscape: [
    { x: 60, y: 60, w: 1020, h: 900 },
    { x: 1110, y: 60, w: 630, h: 435 },
    { x: 1110, y: 525, w: 630, h: 435 },
  ],
};
export const FOOTER: Record<Orient, Rect> = {
  portrait: { x: 60, y: 1630, w: 1080, h: 110 },
  landscape: { x: 60, y: 990, w: 1680, h: 150 },
};

export const THEMES: FrameTheme[] = [
  { id: "lavender", name: "Lavender", bg: "#ece9ff", ink: "#2a2466", slot: "#ffffff", accent: "#7a6bff" },
  { id: "peach", name: "Peach Pop", bg: "#ffe3d6", ink: "#7a2e1c", slot: "#fffaf6", accent: "#ff6b5a" },
  { id: "noir", name: "Noir Klasik", bg: "#14141f", ink: "#f4f1ff", slot: "#2a2a3d", accent: "#ffd23f" },
];

const rr = (ctx: CanvasRenderingContext2D, r: Rect, rad: number) => {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, rad);
};

/** Draws `img` into `r` like CSS object-fit: cover; `mirror` flips it horizontally (the kiosk's Mirror/Asli switch). */
function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource, iw: number, ih: number, r: Rect, mirror: boolean) {
  const k = Math.max(r.w / iw, r.h / ih);
  const w = iw * k, h = ih * k;
  ctx.save();
  rr(ctx, r, 28);
  ctx.clip();
  if (mirror) { ctx.translate(r.x + r.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(r.x + r.w / 2), 0); }
  ctx.drawImage(img, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
  ctx.restore();
}

const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("gambar gagal dimuat"));
    im.src = src;
  });

/** Composes the finished print. `shots` are image URLs (camera JPEGs or vector SVG data URLs), up to 3. */
export async function composeStrip(shots: string[], orient: Orient, theme: FrameTheme, mirror: boolean, stamp: string): Promise<string> {
  const { w, h } = SIZE[orient];
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("canvas tidak tersedia");
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, w, h);
  const imgs = await Promise.all(shots.map(load));
  SLOTS[orient].forEach((r, i) => {
    ctx.fillStyle = theme.slot;
    rr(ctx, r, 28);
    ctx.fill();
    const im = imgs[i % imgs.length];
    if (im) drawCover(ctx, im, im.naturalWidth || 800, im.naturalHeight || 600, r, mirror);
  });
  const f = FOOTER[orient];
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(f.x + 34, f.y + f.h / 2, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.ink;
  ctx.textBaseline = "middle";
  ctx.font = "700 60px system-ui, sans-serif";
  ctx.fillText("studiodo.", f.x + 70, f.y + f.h / 2 - 2);
  ctx.textAlign = "right";
  ctx.globalAlpha = 0.65;
  ctx.font = "500 38px system-ui, sans-serif";
  ctx.fillText(stamp, f.x + f.w, f.y + f.h / 2);
  ctx.globalAlpha = 1;
  return cv.toDataURL("image/jpeg", 0.92);
}
