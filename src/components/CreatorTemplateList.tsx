"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { deleteTemplateAction, duplicateTemplateAction } from "@/app/kreator/masuk/actions";
import type { CreatorTemplate } from "@/lib/creatorTypes";

const STATUS: Record<CreatorTemplate["status"], { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-[var(--soft)] text-muted" },
  pending: { label: "Sedang ditinjau", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  approved: { label: "Terbit", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  rejected: { label: "Perlu diperbaiki", tone: "bg-[#ffe3e3] text-[#a12626]" },
};
const TABS = [
  { id: "all", label: "Semua" },
  { id: "approved", label: "Terbit" },
  { id: "pending", label: "Ditinjau" },
  { id: "draft", label: "Draft" },
  { id: "rejected", label: "Perlu diperbaiki" },
] as const;

/** Template grid with status tabs, search, and per-card duplicate / delete. `apiUrl` prefixes the frame image path. */
export function CreatorTemplateList({ templates, apiUrl }: { templates: CreatorTemplate[]; apiUrl: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  const count = (id: string) => (id === "all" ? templates.length : templates.filter((t) => t.status === id).length);
  const shown = templates.filter((t) => (tab === "all" || t.status === tab) && (!q.trim() || t.name.toLowerCase().includes(q.trim().toLowerCase())));

  const run = (id: string, label: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    setBusy(`${id}:${label}`);
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Gagal");
      setBusy(null);
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-pressed={tab === t.id} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${tab === t.id ? "bg-[var(--ink)] text-white" : "bg-[var(--card)] text-muted ring-1 ring-[var(--card-edge)] hover:text-foreground"}`}>
            {t.label} <span className="ml-1 opacity-60">{count(t.id)}</span>
          </button>
        ))}
        <label className="relative ml-auto min-w-[200px]">
          <span className="sr-only">Cari template</span>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari template saya…" className="h-10 w-full rounded-full border-0 bg-[var(--card)] pl-10 pr-4 text-[13.5px] ring-1 ring-[var(--card-edge)] outline-none focus:ring-2 focus:ring-accent/40" />
        </label>
      </div>

      {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}

      {shown.length === 0 ? (
        <div className="glass p-10 text-center text-[14px] text-muted">{templates.length === 0 ? "Belum ada template." : "Tidak ada template yang cocok."}</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-5">
          {shown.map((t) => {
            const st = STATUS[t.status];
            const editable = t.status === "draft" || t.status === "rejected";
            const working = busy?.startsWith(`${t.id}:`);
            return (
              <li key={t.id} className="glass dash-card-hover flex flex-col gap-3.5 p-4">
                <Link href={`/kreator/portal/template/${t.id}`} className="grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-[var(--soft)]">
                  {t.frameUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={`${apiUrl}${t.frameUrl}`} alt={`Frame ${t.name}`} loading="lazy" className="h-full w-full object-contain p-2" />
                    : <span className="text-sm text-muted">Belum ada frame</span>}
                </Link>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 truncate font-display text-[17px] tracking-tight">{t.name}</h2>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-semibold ${st.tone}`}>{st.label}</span>
                </div>
                {t.status === "rejected" && t.reviewNote && <p className="rounded-xl bg-[#ffe3e3] px-3 py-2 text-[13px] text-[#a12626]">{t.reviewNote}</p>}
                <div className="text-[12.5px] text-muted">{t.slots.length} slot foto{t.status === "approved" ? ` · dipasang ${t.installCount}×` : ""}{t.ratingCount ? ` · ★ ${t.ratingAverage?.toFixed(1)} (${t.ratingCount})` : ""} · diubah {new Date(t.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Link href={`/kreator/portal/template/${t.id}`} className="btn btn-primary px-4 py-2 text-[13px]">{editable ? "Edit" : "Lihat"}</Link>
                  <button type="button" disabled={working} onClick={() => run(t.id, "dup", () => duplicateTemplateAction(t.id))} className="btn px-4 py-2 text-[13px] disabled:opacity-60">
                    {busy === `${t.id}:dup` ? <><Spinner />Menyalin…</> : "Duplikat"}
                  </button>
                  {t.status !== "approved" && (
                    <button type="button" disabled={working} onClick={() => window.confirm(`Hapus "${t.name}"? Ini tidak bisa dibatalkan.`) && run(t.id, "del", () => deleteTemplateAction(t.id))} className="btn px-4 py-2 text-[13px] hover:!text-[#a12626] disabled:opacity-60">
                      {busy === `${t.id}:del` ? <><Spinner />Menghapus…</> : "Hapus"}
                    </button>
                  )}
                  {t.status === "approved" && <Link href="/template" className="ml-auto text-[12.5px] font-semibold text-accent hover:underline">Lihat di katalog</Link>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
