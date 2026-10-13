"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavGroup = { title: string; items: { href: string; label: string }[] };

/** Portal navigation: a sidebar on wide screens, horizontally scrolling pills on phones. */
export function PortalNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/portal" ? pathname === "/portal" : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <>
      <nav aria-label="Portal" className="glass sticky top-6 hidden flex-col gap-5 self-start p-5 md:flex">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{g.title}</div>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active(n.href) ? "page" : undefined}
                    className={`block rounded-xl px-3 py-2 text-[14px] font-medium transition ${active(n.href) ? "bg-foreground text-on-foreground" : "text-muted hover:bg-foreground/[0.06] hover:text-foreground"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <nav aria-label="Portal (ponsel)" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 text-sm font-medium md:hidden">
        {groups.flatMap((g) => g.items).map((n) => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-2 ${active(n.href) ? "bg-foreground text-on-foreground" : "glass rounded-full! text-muted"}`}>{n.label}</Link>
        ))}
      </nav>
    </>
  );
}
