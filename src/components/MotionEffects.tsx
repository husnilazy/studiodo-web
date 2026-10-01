"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Site-wide motion, in one place so server components only need data attributes:
//   data-reveal="up|left|right|scale" [data-delay=ms]  → fades/slides in once when scrolled into view
//   data-parallax="0.12"                                → drifts at that fraction of the scroll speed (negative = opposite)
// plus: same-page anchor links that scroll smoothly to the right spot, a scroll-progress bar and a back-to-top button.
//
// Anchor links are handled here (not by CSS `scroll-behavior`) so the jump is always measured against the
// real document scroll position and works identically from any page that links to "/#section".

const HEADER_OFFSET = 96;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function scrollToHash(hash: string, smooth: boolean) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  const target = id ? document.getElementById(id) : null;
  const top = id === "" || id === "top" ? 0 : target ? target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET + 8 : null;
  if (top === null) return false;
  window.scrollTo({ top: Math.max(0, top), behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  return true;
}

export function MotionEffects() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  // Reveal-on-scroll + parallax, re-scanned on every route change.
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const reduce = reducedMotion();

    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    reveals.forEach((el) => { if (el.dataset.delay) el.style.setProperty("--d", `${el.dataset.delay}ms`); });
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
      );
      reveals.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    const layers = reduce ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const info = new Map<HTMLElement, { base: number; h: number; speed: number }>();
    const measure = () => {
      layers.forEach((el) => { el.style.translate = "0 0"; });
      layers.forEach((el) => {
        const r = el.getBoundingClientRect();
        info.set(el, { base: r.top + window.scrollY, h: r.height, speed: Number(el.dataset.parallax) || 0 });
      });
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const mid = y + window.innerHeight / 2;
      for (const el of layers) {
        const m = info.get(el);
        if (!m) continue;
        const dist = mid - (m.base + m.h / 2);
        if (Math.abs(dist) > window.innerHeight * 2.2) continue; // far off-screen: leave as is
        el.style.translate = `0 ${(dist * m.speed).toFixed(1)}px`;
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    if (layers.length) {
      measure();
      update();
      window.addEventListener("scroll", schedule, { passive: true });
      const onResize = () => { measure(); schedule(); };
      window.addEventListener("resize", onResize);
      const settle = window.setTimeout(() => { measure(); update(); }, 900); // images/fonts shift layout after first paint
      cleanups.push(() => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", onResize); window.clearTimeout(settle); if (frame) cancelAnimationFrame(frame); });
    }

    // Landing on /#section from another page: Next scrolls natively, we only correct for the sticky header.
    if (window.location.hash) {
      const t = window.setTimeout(() => scrollToHash(window.location.hash, false), 60);
      cleanups.push(() => window.clearTimeout(t));
    }
    return () => cleanups.forEach((c) => c());
  }, [pathname]);

  // Same-page anchor clicks, scroll progress, back-to-top visibility.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || !url.hash) return;
      if (url.pathname.replace(/\/$/, "") !== window.location.pathname.replace(/\/$/, "")) return; // other page: let Next navigate
      if (!scrollToHash(url.hash, true)) return;
      e.preventDefault();
      e.stopPropagation(); // keep Next's <Link> from also jumping (that was a second, competing scroll)
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      document.querySelector<HTMLDetailsElement>("header details[open]")?.removeAttribute("open"); // close the phone menu
    };
    document.addEventListener("click", onClick, true);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        barRef.current?.style.setProperty("--sp", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
        setShowTop(window.scrollY > 900);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { document.removeEventListener("click", onClick, true); window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={barRef} className="scroll-progress" aria-hidden="true" />
      <button
        type="button"
        aria-label="Kembali ke atas"
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" })}
        className={`glass fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full! text-foreground transition-all duration-300 md:bottom-8 md:right-8 ${showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </>
  );
}
