import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#template", label: "Template" },
  { href: "/#harga", label: "Harga" },
  { href: "/#komunitas", label: "Komunitas" },
  { href: "/#faq", label: "Bantuan" },
];

export function Navbar() {
  return (
    <header className="relative z-20 px-4 pt-4 md:px-16 md:pt-5">
      <div className="glass relative mx-auto flex h-14 max-w-[1312px] items-center justify-between rounded-full! pl-5 pr-2 md:h-16 md:pl-7">
        <Link href="/" aria-label="STUDIODO beranda">
          <Logo />
        </Link>
        <nav aria-label="Utama" className="hidden gap-8 text-sm font-medium text-muted lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <details className="group lg:hidden">
            <summary aria-label="Menu" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden">
              <span className="flex flex-col gap-[5px]" aria-hidden="true">
                <span className="h-0.5 w-5 bg-foreground transition-transform group-open:translate-y-[3.5px] group-open:rotate-45" />
                <span className="h-0.5 w-5 bg-foreground transition-transform group-open:-translate-y-[3.5px] group-open:-rotate-45" />
              </span>
            </summary>
            <nav aria-label="Menu ponsel" className="absolute right-0 top-[calc(100%+8px)] z-30 flex w-60 flex-col gap-1 rounded-3xl border border-white bg-white p-3 text-[15px] font-medium shadow-[0_20px_50px_rgba(60,70,140,0.18)]">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-2xl px-4 py-3 hover:bg-foreground/[0.05]">{l.label}</Link>
              ))}
              <Link href="/masuk" className="rounded-2xl px-4 py-3 hover:bg-foreground/[0.05]">Masuk</Link>
            </nav>
          </details>
          <Link href="/masuk" className="btn hidden px-5 py-2.5 text-sm sm:inline-block">
            Masuk
          </Link>
          <Link href="/daftar" className="btn btn-primary whitespace-nowrap px-4 py-2.5 text-[13px] sm:px-5 sm:py-3 sm:text-sm md:px-6">
            Coba Gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
