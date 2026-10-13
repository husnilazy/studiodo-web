"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { SORTS, type MarketCategory } from "@/lib/marketplace";

/**
 * Catalog toolbar: search (debounced), category chips, orientation, sort. Everything lives in the URL
 * (?q=&kategori=&arah=&urut=), so a filtered view can be shared and the back button works. A spinner shows
 * while the new result is loading.
 */
export function MarketFilters({ basePath, categories, keep = [] }: { basePath: string; categories: MarketCategory[]; keep?: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const first = useRef(true);

  const go = (patch: Record<string, string>) => {
    const next = new URLSearchParams();
    for (const k of ["q", "kategori", "arah", "urut", ...keep]) { const v = sp.get(k); if (v) next.set(k, v); }
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    start(() => router.push(`${basePath}${next.toString() ? `?${next}` : ""}`));
  };

  // Search as you type, after a short pause.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => { if (q !== (sp.get("q") ?? "")) go({ q: q.trim() }); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text should retrigger
  }, [q]);

  const category = sp.get("kategori") ?? "";
  const orientation = sp.get("arah") ?? "";
  const sort = sp.get("urut") ?? "unggulan";
  const chip = (active: boolean) => `btn px-4 py-2 text-[13px] ${active ? "bg-foreground text-on-foreground" : "glass rounded-full! text-muted"}`;

  return (
    <div className="mb-8 flex flex-col gap-4" aria-busy={pending}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[240px] flex-1 md:max-w-[420px]">
          <span className="sr-only">Cari template</span>
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, kreator, atau gaya…" className="h-12 w-full rounded-full border border-foreground/10 bg-panel/80 pl-11 pr-11 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25" />
          {pending && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-accent"><Spinner className="h-4 w-4" /></span>}
        </label>
        <select value={sort} onChange={(e) => go({ urut: e.target.value === "unggulan" ? "" : e.target.value })} aria-label="Urutkan" className="h-12 rounded-full border border-foreground/10 bg-panel/80 px-5 text-[14px] outline-none focus:border-accent">
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <div role="group" aria-label="Orientasi" className="flex gap-1.5">
          {[["", "Semua arah"], ["portrait", "Potret"], ["landscape", "Lanskap"]].map(([v, label]) => (
            <button key={v} type="button" onClick={() => go({ arah: v })} aria-pressed={orientation === v} className={chip(orientation === v)}>{label}</button>
          ))}
        </div>
      </div>
      <ul className="flex flex-wrap gap-2 text-sm font-medium">
        {[{ key: "", label: "Semua kategori" }, ...categories].map((c) => (
          <li key={c.key || "all"}><button type="button" onClick={() => go({ kategori: c.key })} aria-pressed={category === c.key} className={chip(category === c.key)}>{c.label}</button></li>
        ))}
      </ul>
    </div>
  );
}
