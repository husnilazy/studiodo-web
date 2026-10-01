// Paste/evaluate in the browser console on a page: lists text whose contrast against its effective
// background is below 3:1 (WCAG AA large-text threshold; body text should be 4.5:1). Approximate:
// blends translucent backgrounds up the tree, and skips elements over gradient/image backgrounds.
(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const effectiveBg = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return null; // gradient/image: unknown
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) layers.push(c);
      if (c && c.a >= 1) break;
    }
    let base = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    if (base.a < 1) base = { r: 255, g: 255, b: 255, a: 1 };
    return layers.reverse().reduce((acc, l) => over(l, acc), base);
  };
  const bad = [];
  const seen = new Set();
  for (const el of document.querySelectorAll("body *")) {
    if (!el.childNodes || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const fg = parse(cs.color);
    const bg = effectiveBg(el);
    if (!fg || !bg) continue;
    const text = over(fg, bg);
    const [a, b] = [lum(text), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    if (ratio < 3) {
      const key = `${el.tagName}|${(el.textContent || "").trim().slice(0, 30)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      bad.push({ ratio: Math.round(ratio * 10) / 10, text: (el.textContent || "").trim().slice(0, 40), cls: String(el.className).slice(0, 60), color: cs.color });
    }
  }
  return { theme: document.documentElement.dataset.theme, checked: document.querySelectorAll("body *").length, lowContrast: bad.slice(0, 15), count: bad.length };
})();
