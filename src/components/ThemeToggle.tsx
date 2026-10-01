"use client";

import { useEffect, useSyncExternalStore } from "react";

type Mode = "system" | "light" | "dark";
const KEY = "studiodo-theme";
const ORDER: Mode[] = ["system", "light", "dark"];
const LABEL: Record<Mode, string> = { system: "Tema: ikuti sistem", light: "Tema: terang", dark: "Tema: gelap" };

function resolve(mode: Mode): "light" | "dark" {
  if (mode === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return mode;
}

function apply(mode: Mode) {
  document.documentElement.dataset.theme = resolve(mode);
}

function read(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system"; // storage can throw in private/locked-down contexts — just follow the OS
  }
}

// Tiny external store over localStorage so every toggle on the page (navbar, portal header) stays in sync,
// and a change made in another tab is picked up too.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === null) cb(); };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
const notify = () => listeners.forEach((l) => l());

const ICONS: Record<Mode, string> = {
  // monitor / sun / moon, 24×24 stroke paths
  system: "M3 4h18v12H3z M8 20h8 M12 16v4",
  light: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
  dark: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
};

/** Cycles system → light → dark. The initial theme is set before paint by the inline script in layout.tsx. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  // Server render and first client render both see "system", so hydration matches; the real value follows right after.
  const mode = useSyncExternalStore(subscribe, read, () => "system" as Mode);

  // While following the OS, react to it changing (e.g. scheduled dark mode at sunset).
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const next = () => {
    const nextMode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    try {
      if (nextMode === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, nextMode);
    } catch {
      // not persisted — still applied for this visit
    }
    apply(nextMode);
    notify();
  };

  return (
    <button
      type="button"
      onClick={next}
      aria-label={`${LABEL[mode]} (klik untuk mengganti)`}
      title={LABEL[mode]}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d={ICONS[mode]} />
      </svg>
    </button>
  );
}
