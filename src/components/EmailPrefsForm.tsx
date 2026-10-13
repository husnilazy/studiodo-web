"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";

type Category = { key: string; label: string; hint: string };

/** One switch per optional email category; each change saves immediately (no separate Save button to forget). */
export function EmailPrefsForm({ categories, initial, save }: { categories: Category[]; initial: Record<string, boolean>; save: (patch: Record<string, boolean>) => Promise<{ ok: boolean; error?: string; prefs?: Record<string, boolean> }> }) {
  const [prefs, setPrefs] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  const toggle = (key: string) => {
    const next = !prefs[key];
    setError(null); setBusy(key);
    setPrefs((p) => ({ ...p, [key]: next })); // optimistic
    start(async () => {
      const r = await save({ [key]: next });
      setBusy(null);
      if (!r.ok) { setPrefs((p) => ({ ...p, [key]: !next })); setError(r.error ?? "Gagal menyimpan"); }
      else if (r.prefs) setPrefs(r.prefs);
    });
  };

  return (
    <div>
      <ul className="divide-y divide-[var(--card-edge)]">
        {categories.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-4 py-3.5">
            <div className="min-w-0"><div className="text-[14.5px] font-semibold">{c.label}</div><div className="text-[13px] text-muted">{c.hint}</div></div>
            <button type="button" role="switch" aria-checked={prefs[c.key] !== false} aria-label={c.label} onClick={() => toggle(c.key)} disabled={busy === c.key}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${prefs[c.key] !== false ? "bg-accent" : "bg-foreground/20"} disabled:opacity-70`}>
              <span className={`absolute top-0.5 grid h-6 w-6 place-items-center rounded-full bg-white shadow transition-all ${prefs[c.key] !== false ? "left-[22px]" : "left-0.5"}`}>{busy === c.key && <Spinner className="m-0 h-3.5 w-3.5 !mr-0 text-accent" />}</span>
            </button>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="mt-3 rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
    </div>
  );
}
