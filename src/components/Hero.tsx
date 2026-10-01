import Link from "next/link";
import { Icon } from "./Icon";
import { HeroVisual } from "./HeroVisual";
import { assetUrl, type HeroData } from "@/lib/content";
import type { PlatformStats } from "@/lib/stats";

export function Hero({ data, stats }: { data: HeroData; stats: PlatformStats | null }) {
  const images = (data.visualImages ?? []).map((v) => assetUrl(v.image)).filter((u): u is string => !!u);
  // Floating "booths" card: an admin-typed value wins; otherwise show the real count of kiosks that reported in
  // during the last 30 days. Without either (API down) a neutral label is shown rather than an invented number.
  const liveKiosks = stats && stats.kiosks > 0 ? stats.kiosks : null;
  const boothValue = data.boothValue?.trim() || (liveKiosks ? `${liveKiosks} kiosk` : "Multi-kiosk");
  const boothPercent = stats && stats.kiosks > 0 ? Math.max(8, Math.round((stats.kiosksOnline / stats.kiosks) * 100)) : 68;

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
          <Link href="/kontak" className="btn glass rounded-full! px-7 py-4 text-base">
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

      <div data-reveal="scale" data-delay="200" className="w-full max-w-[600px]">
        <HeroVisual
          images={images}
          cameraLabel={data.cameraLabel || "Preview kamera"}
          startButton={data.startButton || "Mulai Foto"}
          paymentLabel={data.paymentLabel || "Pembayaran QRIS masuk"}
          paymentValue={data.paymentValue || "Rp 35.000"}
          boothLabel={data.boothLabel || "Booth aktif hari ini"}
          boothValue={boothValue}
          boothPercent={boothPercent}
          galleryLabel={data.galleryLabel || "Galeri siap dibagikan"}
        />
      </div>
    </section>
  );
}
