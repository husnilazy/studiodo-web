"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { KIND_ICON, SEVERITY_TONE, timeAgo, type NotificationList } from "@/lib/notifications";

const POLL_MS = 60_000;

/**
 * Bell in the dashboard header. Polls once a minute (and when the tab regains focus) — cheap, and good enough until
 * the API grows a push channel. Opening the panel does NOT mark everything read; the person does that ("Tandai semua
 * dibaca") or by opening an item, so an unread message can't vanish just because the panel flashed open.
 */
export function NotificationBell() {
  const [data, setData] = useState<NotificationList | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/portal-api/notifications?limit=12", { cache: "no-store" });
      if (res.ok) setData((await res.json()) as NotificationList);
    } catch { /* offline: keep what we have */ }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch, then keep fresh
    void load();
    const t = setInterval(() => { if (!document.hidden) void load(); }, POLL_MS);
    const onVisible = () => { if (!document.hidden) void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const markRead = async (body: { ids: string[] } | { all: true }) => {
    // Optimistic: the badge drops immediately, the next poll corrects it if the request failed.
    setData((cur) => {
      if (!cur) return cur;
      const ids = "all" in body ? null : new Set(body.ids);
      const items = cur.items.map((n) => (ids === null || ids.has(n.id) ? { ...n, read: true } : n));
      return { items, unread: items.filter((n) => !n.read).length };
    });
    try {
      await fetch("/portal-api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } catch { /* retried implicitly by the next poll */ }
  };

  const unread = data?.unread ?? 0;
  // Let the sidebar show the same count without a second poll.
  useEffect(() => { if (data) window.dispatchEvent(new CustomEvent("studiodo:unread", { detail: data.unread })); }, [data]);
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        aria-expanded={open}
        className="relative grid h-11 w-11 place-items-center rounded-full bg-[var(--card)] text-foreground shadow-sm ring-1 ring-[var(--card-edge)] transition hover:scale-105"
      >
        <Icon name="bell" className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[19px] place-items-center rounded-full bg-[#e5484d] px-1 text-[10.5px] font-bold leading-[19px] text-white ring-2 ring-[var(--background)]">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="dash-pop absolute right-0 top-[calc(100%+10px)] z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-[22px] bg-[var(--card)] shadow-[0_24px_60px_-18px_rgba(15,18,34,0.35)] ring-1 ring-[var(--card-edge)]">
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <h2 className="font-display text-base tracking-tight">Notifikasi</h2>
            {unread > 0 && <button type="button" onClick={() => void markRead({ all: true })} className="text-[12.5px] font-semibold text-accent hover:underline">Tandai semua dibaca</button>}
          </div>
          <div className="dash-scroll max-h-[min(420px,60vh)] overflow-y-auto px-2 pb-2">
            {!data ? (
              <div className="space-y-2 p-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14" />)}</div>
            ) : data.items.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted">
                <Icon name="bell" className="mx-auto mb-3 h-8 w-8 opacity-40" />
                Belum ada notifikasi. Pesan dari STUDIODO dan pelanggan akan muncul di sini.
              </div>
            ) : (
              <ul>
                {data.items.map((n) => {
                  const inner = (
                    <div className={`flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--soft)] ${n.read ? "" : "bg-accent/[0.06]"}`}>
                      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${SEVERITY_TONE[n.severity] ?? SEVERITY_TONE.info}`}><Icon name={KIND_ICON[n.kind] ?? "bell"} className="h-[17px] w-[17px]" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2"><span className={`text-[14px] leading-snug ${n.read ? "font-medium" : "font-semibold"}`}>{n.title}</span>{!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="belum dibaca" />}</span>
                        {n.body && <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-muted">{n.body}</span>}
                        <span className="mt-1 block text-[11.5px] text-muted">{timeAgo(n.createdAt)}</span>
                      </span>
                    </div>
                  );
                  const onOpen = () => { if (!n.read) void markRead({ ids: [n.id] }); setOpen(false); };
                  return (
                    <li key={n.id}>
                      {n.linkUrl?.startsWith("/") ? <Link href={n.linkUrl} onClick={onOpen}>{inner}</Link>
                        : n.linkUrl ? <a href={n.linkUrl} target="_blank" rel="noreferrer" onClick={onOpen}>{inner}</a>
                        : <button type="button" onClick={onOpen} className="block w-full text-left">{inner}</button>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <Link href="/portal/notifikasi" onClick={() => setOpen(false)} className="block border-t border-[var(--card-edge)] px-5 py-3 text-center text-[13px] font-semibold text-accent hover:bg-[var(--soft)]">Lihat semua notifikasi</Link>
        </div>
      )}
    </div>
  );
}
