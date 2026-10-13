import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { SiteLogo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PortalChrome, type NavGroup } from "@/components/dash/PortalChrome";
import { creatorLogoutAction } from "@/app/kreator/masuk/actions";
import { getCreatorToken } from "@/lib/creator";

export const metadata: Metadata = { title: "Portal Kreator", robots: { index: false, follow: false } };

const groups: NavGroup[] = [
  {
    title: "Karya",
    items: [
      { href: "/kreator/portal", label: "Template saya", icon: "image", hint: "dashboard statistik" },
      { href: "/kreator/portal/panduan", label: "Panduan", icon: "file", hint: "cara membuat frame" },
    ],
  },
  {
    title: "Akun",
    items: [
      { href: "/kreator/portal/akun", label: "Profil & keamanan", icon: "user", hint: "bio password" },
      { href: "/template", label: "Lihat marketplace", icon: "globe", hint: "katalog" },
    ],
  },
];

export default async function CreatorPortalLayout({ children }: { children: ReactNode }) {
  if (!(await getCreatorToken())) redirect("/kreator/masuk");
  return (
    <PortalChrome
      groups={groups}
      homeHref="/kreator/portal"
      logo={<SiteLogo />}
      theme={<ThemeToggle className="h-11! w-11! bg-[var(--card)] shadow-sm ring-1 ring-[var(--card-edge)]" />}
      account={
        <form action={creatorLogoutAction}>
          <button type="submit" aria-label="Keluar" title="Keluar" className="grid h-11 w-11 place-items-center rounded-full bg-[var(--card)] text-muted shadow-sm ring-1 ring-[var(--card-edge)] transition hover:text-foreground"><Icon name="logout" className="h-[18px] w-[18px]" /></button>
        </form>
      }
      promo={
        <Link href="/kreator/portal/panduan" className="dash-card-hover block rounded-[22px] bg-gradient-to-br from-[var(--ink)] to-[var(--ink-2)] p-4 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/12"><Icon name="sparkles" className="h-[18px] w-[18px]" /></span>
          <div className="mt-3 text-[14px] font-semibold leading-tight">Tips frame laris</div>
          <div className="mt-1 text-[12px] leading-snug text-white/65">Ukuran, slot foto, dan cara lolos tinjauan.</div>
        </Link>
      }
    >
      {children}
    </PortalChrome>
  );
}
