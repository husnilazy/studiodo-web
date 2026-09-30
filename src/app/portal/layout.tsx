import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/masuk/actions";
import { getToken } from "@/lib/portal";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

const nav = [
  { href: "/portal", label: "Ringkasan" },
  { href: "/portal/tagihan", label: "Langganan & tagihan" },
  { href: "/portal/akun", label: "Akun" },
  { href: "/unduh", label: "Unduh aplikasi" },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  if (!(await getToken())) redirect("/masuk");
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <div className="blob left-[55%] -top-20 h-[520px] w-[520px] bg-[#bfc6ff] opacity-70" />
      <div className="blob -left-32 top-[600px] h-[420px] w-[420px] bg-[#ffc8de] opacity-55" />
      <header className="relative z-20 px-4 pt-4 md:px-10">
        <div className="glass mx-auto flex h-14 max-w-[1200px] items-center justify-between rounded-full! pl-5 pr-2 md:h-16 md:pl-7">
          <Link href="/portal" aria-label="Dashboard STUDIODO"><Logo /></Link>
          <nav aria-label="Portal" className="hidden gap-7 text-sm font-medium text-muted md:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="transition-colors hover:text-foreground">{n.label}</Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="btn px-5 py-2.5 text-sm">Keluar</button>
          </form>
        </div>
        <nav aria-label="Portal (ponsel)" className="mx-auto mt-3 flex max-w-[1200px] gap-2 overflow-x-auto text-sm font-medium text-muted md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="glass shrink-0 rounded-full! px-4 py-2">{n.label}</Link>
          ))}
        </nav>
      </header>
      <main id="konten" className="relative z-10 mx-auto w-full max-w-[1200px] flex-1 px-4 pb-16 pt-10 md:px-10">{children}</main>
    </div>
  );
}
