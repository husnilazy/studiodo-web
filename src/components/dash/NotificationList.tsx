"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { KIND_ICON, KIND_LABEL, SEVERITY_TONE, timeAgo, type NotificationList as NotificationData } from "@/lib/notifications";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "unread", label: "Belum dibaca" },
  { id: "platform", label: "Dari STUDIODO" },
  { id: "customer_message", label: "Pelanggan" },
  { id: "billing", label: "Tagihan" },
] as const;

/** Inbox page: filter chips, the list inside one scrolling panel, mark-read per item or all at once. */
export function NotificationList({ initial }: { initial: NotificationData }) {
  const [data, setData] = useState(initial);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const markRead = async (body: { ids: string[] } | { all: true }) => {
    setData((cur) => {
      const ids = "all" in body ? null : new Set(body.ids);
      const items = cur.items.map((n) => (ids === null || ids.has(n.id) ? { ...n, read: true } : n));
      return { items, unread: items.filter((n) => !n.read).length };
    });
    try { await fetch("/portal-api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); } catch { /* next poll corrects the badge */ }
  };

  const items = data.items.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.kind === filter));

  return (
    <section className="glass fit-panel p-4 md:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${filter === f.id ? "bg-[var(--ink)] text-white" : "bg-[var(--soft)] text-muted hover:text-foreground"}`}>{f.label}</button>
        ))}
        {data.unread > 0 && <button type="button" onClick={() => void markRead({ all: true })} className="ml-auto text-[13px] font-semibold text-accent hover:underline">Tandai semua dibaca</button>}
      </div>
      <div className="fit-scroll dash-scroll -mx-1 px-1">
        {items.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center text-[14px] text-muted">
            <Icon name="bell" className="mb-3 h-10 w-10 opacity-35" />
            {filter === "all" ? "Belum ada notifikasi." : "Tidak ada notifikasi untuk filter ini."}
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((n) => (
              <li key={n.id}>
                <div className={`flex gap-3.5 rounded-[18px] px-4 py-3.5 transition hover:bg-[var(--soft)] ${n.read ? "" : "bg-accent/[0.06]"}`}>
                  <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${SEVERITY_TONE[n.severity] ?? SEVERITY_TONE.info}`}><Icon name={KIND_ICON[n.kind] ?? "bell"} className="h-[18px] w-[18px]" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <span className={`text-[14.5px] ${n.read ? "font-medium" : "font-semibold"}`}>{n.title}</span>
                      <span className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[10.5px] font-semibold text-muted">{KIND_LABEL[n.kind] ?? n.kind}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-accent" aria-label="belum dibaca" />}
                    </div>
                    {n.body && <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-muted">{n.body}</p>}
                    <div className="mt-1.5 flex items-center gap-3 text-[12px] text-muted">
                      <span>{timeAgo(n.createdAt)}</span>
                      {n.linkUrl && (n.linkUrl.startsWith("/")
                        ? <Link href={n.linkUrl} onClick={() => { if (!n.read) void markRead({ ids: [n.id] }); }} className="font-semibold text-accent hover:underline">Buka</Link>
                        : <a href={n.linkUrl} target="_blank" rel="noreferrer" onClick={() => { if (!n.read) void markRead({ ids: [n.id] }); }} className="font-semibold text-accent hover:underline">Buka tautan</a>)}
                      {!n.read && <button type="button" onClick={() => void markRead({ ids: [n.id] })} className="font-semibold hover:text-foreground">Tandai dibaca</button>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
