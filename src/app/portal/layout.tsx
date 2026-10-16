import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteLogo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/dash/NotificationBell";
import { PortalChrome, type NavGroup } from "@/components/dash/PortalChrome";
import { logoutAction } from "@/app/masuk/actions";
import { getToken } from "@/lib/portal";
import { fetchLatestRelease } from "@/lib/site";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

const groups: NavGroup[] = [
  {
    title: "Ringkasan",
    items: [
      { href: "/portal", label: "Dashboard", icon: "home" },
      { href: "/portal/kasir", label: "Kasir (POS)", icon: "receipt", hint: "pos kasir antrian shift refund struk" },
      { href: "/portal/monitor", label: "Monitor booth", icon: "activity", hint: "live online antrian" },
      { href: "/portal/pelanggan", label: "Pelanggan (CRM)", icon: "users", hint: "customer whatsapp database" },
      { href: "/portal/riwayat", label: "Riwayat transaksi", icon: "receipt", hint: "sesi pembayaran csv" },
      { href: "/portal/saldo", label: "Saldo QRIS", icon: "wallet", hint: "penarikan withdraw" },
      { href: "/portal/notifikasi", label: "Notifikasi", icon: "bell", hint: "pesan inbox" },
    ],
  },
  {
    title: "Kelola kiosk",
    items: [
      { href: "/portal/booth", label: "Booth & langganan", icon: "monitor", hint: "key trial perpanjang" },
      { href: "/portal/paket", label: "Paket foto", icon: "box", hint: "harga" },
      { href: "/portal/voucher", label: "Voucher", icon: "ticket", hint: "diskon kode promo" },
      { href: "/portal/frame", label: "Frame & template", icon: "image", hint: "desain" },
      { href: "/portal/frame/custom", label: "Frame custom", icon: "ticket", hint: "frame pelanggan desain khusus voucher jual" },
      { href: "/portal/pembayaran", label: "Pembayaran kiosk", icon: "card", hint: "xendit doku gateway" },
      { href: "/portal/pengaturan", label: "Tampilan & pengaturan", icon: "sliders", hint: "logo warna" },
    ],
  },
  {
    title: "Akun",
    items: [
      { href: "/portal/tagihan", label: "Tagihan langganan", icon: "file", hint: "invoice bayar" },
      { href: "/portal/unduh", label: "Unduh aplikasi", icon: "download", hint: "installer windows kiosk" },
      { href: "/portal/direktori", label: "Direktori", icon: "globe" },
      { href: "/portal/akun", label: "Akun & keamanan", icon: "shield", hint: "password" },
    ],
  },
];

async function DownloadPromo() {
  const release = await fetchLatestRelease(600);
  return (
    <Link href="/portal/unduh" prefetch className="dash-card-hover relative block overflow-hidden rounded-[22px] bg-gradient-to-br from-[var(--ink)] to-[var(--ink-2)] p-4 text-white">
      <span className="dash-orb" style={{ right: -30, top: -30, width: 110, height: 110, background: "radial-gradient(circle, rgba(154,166,255,.55), transparent 68%)" }} aria-hidden="true" />
      <div className="relative">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/12"><Icon name="download" className="h-[18px] w-[18px]" /></span>
        <div className="mt-3 text-[14px] font-semibold leading-tight">Unduh aplikasi kiosk</div>
        <div className="mt-1 text-[12px] leading-snug text-white/65">{release?.version ? `Versi ${release.version} siap diunduh` : "Installer Windows terbaru"}</div>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1.5 text-[12px] font-semibold">Buka <Icon name="chevron-right" className="h-3.5 w-3.5" /></span>
      </div>
    </Link>
  );
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  if (!(await getToken())) redirect("/masuk");
  const promo = (
    <Suspense fallback={<div className="skeleton h-[148px] rounded-[22px]" />}>
      <DownloadPromo />
    </Suspense>
  );
  return (
    <PortalChrome
      groups={groups}
      logo={<SiteLogo />}
      promo={promo}
      bell={<NotificationBell />}
      theme={<ThemeToggle className="h-11! w-11! bg-[var(--card)] shadow-sm ring-1 ring-[var(--card-edge)]" />}
      account={
        <div className="flex items-center gap-2">
          <Link href="/portal/akun" prefetch aria-label="Akun & keamanan" title="Akun & keamanan" className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-accent to-[#a78bfa] text-white shadow-sm transition hover:scale-105"><Icon name="user" className="h-[18px] w-[18px]" /></Link>
          <form action={logoutAction}>
            <button type="submit" aria-label="Keluar" title="Keluar" className="grid h-11 w-11 place-items-center rounded-full bg-[var(--card)] text-muted shadow-sm ring-1 ring-[var(--card-edge)] transition hover:text-foreground"><Icon name="logout" className="h-[18px] w-[18px]" /></button>
          </form>
        </div>
      }
    >
      {children}
    </PortalChrome>
  );
}
