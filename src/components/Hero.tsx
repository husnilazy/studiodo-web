import Link from "next/link";
import type { HeroData } from "@/lib/content";

export function Hero({ data }: { data: HeroData }) {
  return (
    <section id="top" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col items-center gap-14 px-4 pb-16 pt-14 md:px-16 lg:flex-row lg:justify-between lg:pb-24 lg:pt-20">
      <div className="flex max-w-[640px] flex-col gap-7">
        <div className="glass flex items-center gap-2.5 self-start rounded-full! px-4 py-2 text-[13px] font-medium text-muted">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {data.badge}
        </div>
        <h1 className="font-display text-5xl font-normal leading-[1.04] tracking-[-0.035em] md:text-7xl">
          {data.titleLine1}
          <br />
          <span className="font-semibold">{data.titleLine2}</span>
        </h1>
        <p className="max-w-[520px] text-lg leading-relaxed text-muted md:text-[19px]">
          {data.subtitle}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/daftar" className="btn btn-primary px-8 py-4 text-base">
            {data.primaryCta}
          </Link>
          <Link href="/kontak" className="btn glass rounded-full! px-7 py-4 text-base">
            {data.secondaryCta}
          </Link>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted">
          {data.bullets.map((b) => (
            <li key={b.text}>{b.text}</li>
          ))}
        </ul>
      </div>

      <div className="relative h-[660px] w-full max-w-[600px]" aria-hidden="true">
        <div className="glass absolute left-1/2 top-2.5 flex h-[620px] w-[320px] -translate-x-1/2 flex-col gap-3 rounded-[44px]! p-4 lg:left-[150px] lg:translate-x-0">
          <div className="flex flex-1 items-end rounded-[30px] bg-gradient-to-br from-[#ffd3e4] to-[#c7ceff] p-5">
            <span className="text-[13px] font-semibold">Preview kamera</span>
          </div>
          <div className="grid h-[110px] grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-gradient-to-br from-[#ffe3b8] to-[#ffc8de]" />
            <div className="rounded-2xl bg-gradient-to-br from-[#b8f0e6] to-[#bfd8ff]" />
            <div className="rounded-2xl bg-gradient-to-br from-[#d5ccff] to-[#bfc6ff]" />
          </div>
          <div className="flex h-[54px] items-center justify-center rounded-full bg-foreground text-[15px] font-semibold text-white">
            Mulai Foto
          </div>
        </div>

        <div className="glass absolute left-0 top-[120px] hidden items-center gap-3.5 rounded-[22px]! px-5 py-4 sm:flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-accent to-accent-soft text-sm font-semibold text-white">
            Rp
          </div>
          <div>
            <div className="text-xs text-muted">Pembayaran QRIS masuk</div>
            <div className="font-display text-xl tracking-tight">Rp 35.000</div>
          </div>
        </div>

        <div className="glass absolute right-0 top-[330px] hidden w-[200px] rounded-[22px]! px-5 py-4 sm:block">
          <div className="text-xs text-muted">Booth aktif hari ini</div>
          <div className="my-1 mb-2.5 font-display text-3xl tracking-tight">3 kiosk</div>
          <div className="h-1.5 rounded-full bg-accent/15">
            <div className="h-1.5 w-[68%] rounded-full bg-accent" />
          </div>
        </div>

        <div className="glass absolute bottom-7 left-4 hidden items-center gap-3 rounded-[22px]! px-[18px] py-3.5 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22c58b]" />
          <span className="text-sm font-semibold">Galeri siap dibagikan</span>
        </div>
      </div>
    </section>
  );
}
