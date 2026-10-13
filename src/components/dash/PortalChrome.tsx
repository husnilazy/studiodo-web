"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { DashParallax } from "@/components/dash/DashParallax";

export type NavItem = { href: string; label: string; icon: string; hint?: string };
export type NavGroup = { title: string; items: NavItem[] };

const isActive = (pathname: string, href: string, home: string) => (href === home ? pathname === home : pathname === href || pathname.startsWith(`${href}/`));

function NavList({ groups, pathname, home, onNavigate }: { groups: NavGroup[]; pathname: string; home: string; onNavigate?: () => void }) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const onUnread = (e: Event) => setUnread((e as CustomEvent<number>).detail ?? 0);
    window.addEventListener("studiodo:unread", onUnread);
    return () => window.removeEventListener("studiodo:unread", onUnread);
  }, []);
  return (
    <>
      {groups.map((g) => (
        <div key={g.title}>
          <div className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted/80">{g.title}</div>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((n) => {
              const active = isActive(pathname, n.href, home);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    prefetch
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`dash-nav-link flex items-center gap-3 rounded-[14px] px-3 py-[9px] text-[14px] font-medium transition-colors ${active ? "bg-[var(--ink)] text-white shadow-[0_8px_18px_-8px_rgba(15,18,34,0.6)]" : "text-muted hover:bg-[var(--soft)] hover:text-foreground"}`}
                  >
                    <Icon name={n.icon} className="dash-nav-icon h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 truncate">{n.label}</span>
                    {n.href === "/portal/notifikasi" && unread > 0 && <span className="rounded-full bg-[#e5484d] px-1.5 text-[10.5px] font-bold leading-[18px] text-white">{unread > 9 ? "9+" : unread}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

/** Quick "go to…" search over the menu. Ctrl/⌘+K focuses it. */
function QuickSearch({ groups }: { groups: NavGroup[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const all = useMemo(() => groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title }))), [groups]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? all.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(t)).slice(0, 7) : all.slice(0, 6);
  }, [q, all]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => { setQ(""); setFocused(false); input.current?.blur(); router.push(href); };

  return (
    <div className="relative w-full max-w-[420px]">
      <label className="relative block">
        <span className="sr-only">Cari menu</span>
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted" />
        <input
          ref={input}
          value={q}
          onChange={(e) => { setQ(e.target.value); setCursor(0); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
            else if (e.key === "Enter" && results[cursor]) go(results[cursor].href);
            else if (e.key === "Escape") { setQ(""); input.current?.blur(); }
          }}
          placeholder="Cari menu…"
          className="h-11 w-full rounded-full border-0 bg-[var(--card)] pl-11 pr-14 text-[14px] text-foreground shadow-sm ring-1 ring-[var(--card-edge)] outline-none transition placeholder:text-muted focus:ring-2 focus:ring-accent/40"
        />
        <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md bg-[var(--soft)] px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted sm:block">Ctrl K</kbd>
      </label>
      {focused && results.length > 0 && (
        <ul className="dash-pop absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[20px] bg-[var(--card)] p-1.5 shadow-[0_24px_60px_-18px_rgba(15,18,34,0.35)] ring-1 ring-[var(--card-edge)]">
          {results.map((r, i) => (
            <li key={r.href}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(r.href)} onMouseEnter={() => setCursor(i)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] ${i === cursor ? "bg-[var(--soft)]" : ""}`}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent"><Icon name={r.icon} className="h-4 w-4" /></span>
                <span className="font-medium">{r.label}</span>
                <span className="ml-auto text-[11.5px] text-muted">{r.group}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The dashboard frame: a fixed-height app where the sidebar never scrolls away and only the content area scrolls
 * (so data pages can fit one screen). Server-rendered pieces (logo, promo card, bell, logout form) are passed in as nodes.
 */
export function PortalChrome({ groups, logo, promo, bell, theme, account, homeHref = "/portal", children }: { groups: NavGroup[]; logo: ReactNode; promo?: ReactNode; bell?: ReactNode; theme: ReactNode; account: ReactNode; homeHref?: string; children: ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  // Close the drawer after navigating. (Adjusting state during render instead of in an effect avoids a flash.)
  if (lastPath !== pathname) { setLastPath(pathname); setDrawer(false); }

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  return (
    <div className="dash fixed inset-0 flex gap-3 overflow-hidden p-3 lg:gap-4 lg:p-4">
      <aside className="hidden w-[250px] shrink-0 flex-col rounded-[28px] bg-[var(--card)] p-4 shadow-sm ring-1 ring-[var(--card-edge)] lg:flex">
        <Link href={homeHref} prefetch className="mb-5 flex h-11 items-center px-2" aria-label="Dashboard STUDIODO">{logo}</Link>
        <nav aria-label="Portal" className="dash-scroll -mr-2 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2">
          <NavList groups={groups} pathname={pathname} home={homeHref} />
        </nav>
        {promo && <div className="mt-3">{promo}</div>}
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Tutup menu" className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="dash-pop absolute bottom-3 left-3 top-3 flex w-[min(300px,calc(100vw-3rem))] flex-col rounded-[28px] bg-[var(--card)] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between px-2">{logo}<button type="button" onClick={() => setDrawer(false)} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--soft)]"><Icon name="x" className="h-4 w-4" /></button></div>
            <nav className="dash-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"><NavList groups={groups} pathname={pathname} home={homeHref} onNavigate={() => setDrawer(false)} /></nav>
            {promo && <div className="mt-3">{promo}</div>}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-4">
        <header className="flex items-center gap-3">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Buka menu" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--card)] shadow-sm ring-1 ring-[var(--card-edge)] lg:hidden"><Icon name="menu" className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1"><QuickSearch groups={groups} /></div>
          <div className="flex items-center gap-2">
            {bell}
            <div className="hidden sm:block">{theme}</div>
            {account}
          </div>
        </header>
        <main id="konten" className="dash-scroll relative -mr-1 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1" data-dash-scroll>
          <DashParallax />
          <div className="relative h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
