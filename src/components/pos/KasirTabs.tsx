"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

const TABS = [
  { href: "/portal/kasir", label: "Kasir", icon: "receipt" },
  { href: "/portal/kasir/antrian", label: "Antrian", icon: "users" },
  { href: "/portal/kasir/shift", label: "Shift & kas", icon: "wallet" },
  { href: "/portal/kasir/transaksi", label: "Transaksi", icon: "file" },
  { href: "/portal/kasir/pengaturan", label: "Produk & pengaturan", icon: "sliders" },
];

export function KasirTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu kasir" className="dash-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {TABS.map((t) => {
        const active = t.href === "/portal/kasir" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition ${active ? "bg-[var(--ink)] text-white shadow-sm" : "bg-[var(--card)] text-muted ring-1 ring-[var(--card-edge)] hover:text-foreground"}`}>
            <Icon name={t.icon} className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
