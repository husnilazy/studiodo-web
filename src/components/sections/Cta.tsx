import Link from "next/link";
import { whatsappLink, type CtaData, type SiteData } from "@/lib/content";

export function Cta({ data, site }: { data: CtaData; site: SiteData }) {
  const wa = whatsappLink(site);
  const secondary = "btn border border-foreground/20 py-4 text-center text-[15px]";
  return (
    <section id="daftar" className="relative z-10 mx-auto w-full max-w-[1312px] px-4 md:px-16">
      <div className="glass flex flex-col items-start justify-between gap-8 rounded-[40px]! bg-white/45 px-8 py-14 md:px-[72px] lg:flex-row lg:items-center">
        <div className="flex max-w-[640px] flex-col gap-4">
          <h2 className="font-display text-4xl font-normal leading-[1.04] tracking-[-0.035em] md:text-[56px]">{data.title}</h2>
          <p className="text-[17px] leading-relaxed text-muted">{data.body}</p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-[280px]">
          <Link href="/daftar" className="btn btn-primary py-[17px] text-center text-base">{data.primaryCta}</Link>
          {wa ? (
            <a href={wa} className={secondary}>{data.secondaryCta}</a>
          ) : (
            <Link href="/kontak" className={secondary}>{data.secondaryCta}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
