import Link from "next/link";
import type { ReactNode } from "react";
import { isNew, type MarketItem } from "@/lib/marketplace";

const backdrops = [
  "from-[#ffd3e4] to-[#c7ceff]",
  "from-[#b8f0e6] to-[#bfd8ff]",
  "from-[#ffe3b8] to-[#ffc8de]",
  "from-[#d5ccff] to-[#bfc6ff]",
];

/** Frames are transparent PNG overlays, so they sit on a soft gradient to look like a finished strip. */
export function TemplateCard({ item, index, action, href }: { item: MarketItem; index: number; action?: ReactNode; href?: string }) {
  const art = (
    <div className={`relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b p-3 lg:h-[340px] ${backdrops[index % backdrops.length]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote frame art of arbitrary size; next/image would need every host allow-listed */}
      <img src={item.imageUrl} alt={`Frame ${item.name}`} loading="lazy" className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(60,70,140,0.25)] transition-transform duration-500 group-hover/card:scale-[1.04]" />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {item.featured && <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-on-foreground">Unggulan</span>}
        {isNew(item) && <span className="rounded-full bg-[#1fb26b] px-3 py-1 text-[11px] font-semibold text-white">Baru</span>}
      </div>
      <span className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#2b3350] backdrop-blur">{item.slotCount} foto · {item.orientation === "landscape" ? "Lanskap" : "Potret"}</span>
    </div>
  );
  return (
    <article data-reveal="up" data-delay={String((index % 5) * 80)} className="group/card glass lift flex flex-col gap-3.5 rounded-3xl! p-3 pb-[18px]">
      {href ? <Link href={href} aria-label={`Lihat detail ${item.name}`}>{art}</Link> : art}
      <div className="flex flex-col gap-1 px-1.5">
        <div className="text-[15px] font-semibold">{href ? <Link href={href} className="hover:text-accent">{item.name}</Link> : item.name}</div>
        <div className="text-[13px] text-muted">
          {item.creatorName ? `oleh ${item.creatorName}` : "oleh STUDIODO"} · {item.installCount} pakai
        </div>
        {item.ratingCount ? <div className="text-[13px] font-medium text-[#b7791f]">★ {item.ratingAverage?.toFixed(1)} <span className="font-normal text-muted">({item.ratingCount})</span></div> : null}
        {item.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">{item.description}</p>}
      </div>
      {action && <div className="px-1.5">{action}</div>}
    </article>
  );
}
