import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SiteLogo } from "@/components/Logo";
import { PortalNav, type NavGroup } from "@/components/PortalNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logoutAction } from "@/app/masuk/actions";
import { getToken } from "@/lib/portal";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

const groups: NavGroup[] = [
  {
    title: "Ringkasan",
    items: [
      { href: "/portal", label: "Dashboard" },
      { href: "/portal/monitor", label: "Monitor booth" },
      { href: "/portal/pelanggan", label: "Pelanggan (CRM)" },
      { href: "/portal/riwayat", label: "Riwayat transaksi" },
      { href: "/portal/saldo", label: "Saldo QRIS" },
    ],
  },
  {
    title: "Kelola kiosk",
    items: [
      { href: "/portal/booth", label: "Booth & langganan" },
      { href: "/portal/paket", label: "Paket foto" },
      { href: "/portal/voucher", label: "Voucher" },
      { href: "/portal/frame", label: "Frame & template" },
      { href: "/portal/pembayaran", label: "Pembayaran kiosk" },
      { href: "/portal/pengaturan", label: "Tampilan & pengaturan" },
    ],
  },
  {
    title: "Akun",
    items: [
      { href: "/portal/tagihan", label: "Tagihan langganan" },
      { href: "/portal/direktori", label: "Direktori" },
      { href: "/portal/akun", label: "Akun & keamanan" },
      { href: "/unduh", label: "Unduh aplikasi" },
    ],
  },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  if (!(await getToken())) redirect("/masuk");
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <div className="blob left-[55%] -top-20 h-[520px] w-[520px] bg-[#bfc6ff] opacity-70" />
      <div className="blob -left-32 top-[600px] h-[420px] w-[420px] bg-[#ffc8de] opacity-55" />
      <header className="relative z-20 px-4 pt-4 md:px-10">
        <div className="glass mx-auto flex h-14 max-w-[1280px] items-center justify-between rounded-full! pl-5 pr-2 md:h-16 md:pl-7">
          <Link href="/portal" aria-label="Dashboard STUDIODO"><SiteLogo /></Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={logoutAction}>
              <button type="submit" className="btn px-5 py-2.5 text-sm">Keluar</button>
            </form>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] flex-1 gap-6 px-4 pb-16 pt-6 md:grid-cols-[230px_minmax(0,1fr)] md:gap-8 md:px-10 md:pt-10">
        <PortalNav groups={groups} />
        <main id="konten" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
