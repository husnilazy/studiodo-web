import Link from "next/link";
import { Icon } from "./Icon";
import { BoothDemo } from "./landing/boothDemo/BoothDemo";
import type { HeroData } from "@/lib/content";
import type { PlatformStats } from "@/lib/stats";

// The hero's right side is the playable booth (BoothDemo): visitors can take a photo before reading anything else.
// `stats` stays in the signature (the page passes it) for the stats strip below.
export function Hero({ data }: { data: HeroData; stats: PlatformStats | null }) {
  return (
    <section id="top" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col items-center gap-10 px-4 pb-16 pt-10 md:px-16 md:pt-14 lg:flex-row lg:justify-between lg:gap-14 lg:pb-24 lg:pt-20">
      <div className="flex max-w-[640px] flex-col gap-7">
        <div data-reveal="up" className="glass flex items-center gap-2.5 self-start rounded-full! px-4 py-2 text-[13px] font-medium text-muted">
          <span className="relative flex h-2 w-2">
            <span className="ping-ring absolute inset-0 rounded-full bg-accent" />
            <span className="relative h-2 w-2 rounded-full bg-accent" />
          </span>
          {data.badge}
        </div>
        <h1 data-reveal="up" data-delay="80" className="font-display text-[44px] font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl md:text-7xl">
          {data.titleLine1}
          <br />
          <span className="shimmer-text font-semibold">{data.titleLine2}</span>
        </h1>
        <p data-reveal="up" data-delay="160" className="max-w-[520px] text-lg leading-relaxed text-muted md:text-[19px]">
          {data.subtitle}
        </p>
        <div data-reveal="up" data-delay="240" className="flex flex-wrap items-center gap-3">
          <Link href="/daftar" className="btn btn-primary group flex items-center gap-2.5 px-8 py-4 text-base">
            {data.primaryCta}
            <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/#alur" className="btn glass rounded-full! px-7 py-4 text-base">
            {data.secondaryCta}
          </Link>
        </div>
        <ul data-reveal="up" data-delay="320" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
          {data.bullets.map((b) => (
            <li key={b.text} className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-accent"><Icon name="check" className="h-2.5 w-2.5" /></span>
              {b.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full max-w-[560px] lg:max-w-[520px]">
        <BoothDemo hero />
      </div>
    </section>
  );
}
