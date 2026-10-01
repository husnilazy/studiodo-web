import Link from "next/link";
import { SiteLogo } from "./Logo";
import { Icon } from "./Icon";
import { getSite, waDigits } from "@/lib/content";

const columns = [
  { title: "Produk", links: [["Fitur", "/#fitur"], ["Harga", "/#harga"], ["Unduh", "/unduh"]] },
  { title: "Komunitas", links: [["Template", "/template"], ["Cari Booth", "/booth"], ["Jadi Kreator", "/kreator"], ["Blog", "/blog"], ["Pusat Bantuan", "/bantuan"]] },
  { title: "Perusahaan", links: [["Kontak", "/kontak"], ["Privasi", "/privasi"], ["Syarat", "/syarat"]] },
];

export async function Footer() {
  const site = await getSite();
  return (
    <footer className="relative z-10 mt-24 border-t border-foreground/10 px-4 pb-10 pt-14 md:px-16">
      <div className="mx-auto grid max-w-[1312px] gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3.5">
          <SiteLogo />
          <p className="max-w-[280px] text-sm leading-relaxed text-muted">
            {site.tagline}
          </p>
          {(site.whatsappNumber || site.supportEmail) && (
            <ul className="mt-1 flex flex-col gap-2.5 text-sm">
              {site.whatsappNumber && (
                <li><a href={`https://wa.me/${waDigits(site.whatsappNumber)}`} className="flex items-center gap-2.5 text-muted transition-colors hover:text-foreground"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/12 text-accent"><Icon name="phone" className="h-4 w-4" /></span>WhatsApp</a></li>
              )}
              {site.supportEmail && (
                <li><a href={`mailto:${site.supportEmail}`} className="flex items-center gap-2.5 text-muted transition-colors hover:text-foreground"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/12 text-accent"><Icon name="mail" className="h-4 w-4" /></span>{site.supportEmail}</a></li>
              )}
            </ul>
          )}
        </div>
        {columns.map((c) => (
          <div key={c.title} className="flex flex-col gap-3 text-sm">
            <div className="mb-1 font-semibold">{c.title}</div>
            {c.links.map(([label, href]) => (
              <Link key={label} href={href} className="text-muted transition-colors hover:text-foreground">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
