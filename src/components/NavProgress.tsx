"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

// A thin progress bar across the top while a page change is loading. Next has no router events, so it starts on a
// click of an internal link and finishes when the URL changes (or after a safety timeout). Pure feedback — it never
// blocks or alters navigation.
function Bar() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [state, setState] = useState<"idle" | "run" | "done">("idle");
  const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // The route changed: finish the bar.
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to navigation completing
    setState((s) => (s === "run" ? "done" : s));
    timers.current.push(window.setTimeout(() => setState("idle"), 450));
    return clear;
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      clear();
      setState("run");
      timers.current.push(window.setTimeout(() => setState("idle"), 12_000));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (state === "idle") return null;
  return <div aria-hidden="true" className={`nav-progress ${state === "done" ? "nav-progress-done" : ""}`} />;
}

export function NavProgress() {
  return <Suspense fallback={null}><Bar /></Suspense>;
}
