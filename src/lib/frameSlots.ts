// Browser-only helper for the "Frame custom" upload: turns a customer's frame design (PNG) into what the kiosk needs.
// The photo windows are found automatically: pure-green areas (#00FF00 style, painted by the designer) and areas that are
// already transparent both count as "photo goes here". Green is made transparent in the exported PNG so the photo shows
// through. Slots come back as fractions (0..1) of the canvas, exactly the kiosk's template format.

export type FrameSlot = { x: number; y: number; w: number; h: number };
export type AnalysedFrame = { dataUrl: string; width: number; height: number; slots: FrameSlot[]; orientation: "portrait" | "landscape"; usedGreen: boolean };

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1800;
const MIN_SLOT_AREA = 0.012; // a window smaller than ~1.2 % of the frame is noise (an anti-aliased edge, a speck)

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("File gambar tidak dapat dibaca. Gunakan PNG.")); };
    img.src = url;
  });
}

export async function analyseFrame(file: File): Promise<AnalysedFrame> {
  if (!/^image\/(png|webp)$/.test(file.type)) throw new Error("Gunakan file PNG (area foto berwarna hijau atau sudah transparan).");
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_WIDTH / img.naturalWidth, MAX_HEIGHT / img.naturalHeight);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar.");
  ctx.drawImage(img, 0, 0, width, height);
  const image = ctx.getImageData(0, 0, width, height);
  const px = image.data;

  // 1) which pixels are "a photo goes here"
  const hole = new Uint8Array(width * height);
  let greenCount = 0;
  for (let i = 0, p = 0; i < px.length; i += 4, p += 1) {
    const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3];
    const green = a > 200 && g > 170 && r < 110 && b < 110 && g - Math.max(r, b) > 80;
    if (green) { hole[p] = 1; greenCount += 1; px[i + 3] = 0; } // punch the green out of the exported frame
    else if (a < 12) hole[p] = 1;
  }
  const usedGreen = greenCount > 0;

  // 2) connected regions on a downsampled grid (fast and plenty accurate for a rectangle)
  const step = Math.max(1, Math.round(Math.max(width, height) / 400));
  const gw = Math.ceil(width / step), gh = Math.ceil(height / step);
  const grid = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy += 1) for (let gx = 0; gx < gw; gx += 1) grid[gy * gw + gx] = hole[Math.min(height - 1, gy * step + (step >> 1)) * width + Math.min(width - 1, gx * step + (step >> 1))];
  const seen = new Uint8Array(gw * gh);
  const slots: FrameSlot[] = [];
  const stack: number[] = [];
  for (let start = 0; start < grid.length; start += 1) {
    if (!grid[start] || seen[start]) continue;
    let minX = gw, minY = gh, maxX = 0, maxY = 0, count = 0;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const cur = stack.pop()!;
      const cx = cur % gw, cy = (cur / gw) | 0;
      count += 1;
      if (cx < minX) minX = cx; if (cx > maxX) maxX = cx; if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const ni = ny * gw + nx;
        if (grid[ni] && !seen[ni]) { seen[ni] = 1; stack.push(ni); }
      }
    }
    const boxArea = (maxX - minX + 1) * (maxY - minY + 1);
    // skip specks, and "regions" that are not window-shaped (a transparent corner glow or the whole background)
    if (count / (gw * gh) < MIN_SLOT_AREA || count / boxArea < 0.6) continue;
    const x = Math.max(0, (minX * step) / width), y = Math.max(0, (minY * step) / height);
    const w = Math.min(1 - x, ((maxX - minX + 1) * step) / width), h = Math.min(1 - y, ((maxY - minY + 1) * step) / height);
    slots.push({ x: round(x), y: round(y), w: round(w), h: round(h) });
  }
  // reading order: top to bottom, then left to right
  slots.sort((a, b) => (Math.abs(a.y - b.y) < 0.02 ? a.x - b.x : a.y - b.y));

  ctx.putImageData(image, 0, 0);
  return { dataUrl: canvas.toDataURL("image/png"), width, height, slots, orientation: width > height ? "landscape" : "portrait", usedGreen };
}

const round = (n: number) => Math.round(n * 10000) / 10000;
