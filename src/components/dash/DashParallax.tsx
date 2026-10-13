"use client";

import { useEffect, useRef } from "react";

/**
 * Soft colour glows behind the dashboard that drift slower than the content when the page scrolls (parallax).
 * Radial gradients, not blur filters — they cost almost nothing to paint. Sticky + zero height, so they live in the
 * scrolling area without taking up room. Updates are one transform per animation frame and skipped for reduced motion.
 */
export function DashParallax() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    const scroller = el?.closest<HTMLElement>("[data-dash-scroll]");
    if (!el || !scroller || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => { frame = 0; el.style.setProperty("--sy", String(scroller.scrollTop)); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => { scroller.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return (
    <div ref={layer} aria-hidden="true" className="pointer-events-none sticky top-0 z-0 h-0" style={{ ["--sy" as string]: 0 }}>
      <div className="dash-orb" style={{ right: 0, top: "-9rem", width: 520, height: 520, translate: "0 calc(var(--sy) * -0.28px)", background: "radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--accent-soft) 55%, transparent), transparent 66%)" }} />
      <div className="dash-orb" style={{ left: "-8%", top: "26rem", width: 440, height: 440, translate: "0 calc(var(--sy) * -0.16px)", animationDelay: "-5s", background: "radial-gradient(circle at 50% 50%, color-mix(in srgb, #ff9ec5 42%, transparent), transparent 66%)" }} />
    </div>
  );
}
