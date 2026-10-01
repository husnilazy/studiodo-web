import Link from "next/link";
import { Icon } from "../Icon";
import { Orb } from "../Decor";
import { whatsappLink, type CtaData, type SiteData } from "@/lib/content";

export function Cta({ data, site }: { data: CtaData; site: SiteData }) {
  const wa = whatsappLink(site);
  const secondary = "btn border border-foreground/20 py-4 text-center text-[15px]";
  return (
    <section id="daftar" className="relative z-10 mx-auto w-full max-w-[1312px] px-4 md:px-16">
      <Orb className="-right-6 -top-10 h-40 w-40 md:right-20" speed={0.18} />
      <Orb className="left-4 -bottom-12 h-56 w-56" speed={-0.12} ring spin />
      <div data-reveal="scale" className="glass relative flex flex-col items-start justify-between gap-8 rounded-[40px]! bg-panel/45 px-8 py-14 md:px-[72px] lg:flex-row lg:items-center">
        <div className="flex max-w-[640px] flex-col gap-4">
          <h2 className="font-display text-4xl font-normal leading-[1.04] tracking-[-0.035em] md:text-[56px]">{data.title}</h2>
          <p className="text-[17px] leading-relaxed text-muted">{data.body}</p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-[280px]">
          <Link href="/daftar" className="btn btn-primary group flex items-center justify-center gap-2.5 py-[17px] text-center text-base">{data.primaryCta}<Icon name="rocket" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
          {wa ? (
            <a href={wa} className={`${secondary} flex items-center justify-center gap-2`}><Icon name="phone" className="h-4 w-4" />{data.secondaryCta}</a>
          ) : (
            <Link href="/kontak" className={secondary}>{data.secondaryCta}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
