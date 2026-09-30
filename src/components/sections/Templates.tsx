import Link from "next/link";
import { SectionHeading } from "../SectionHeading";
import { TemplateCard } from "../TemplateCard";
import { fetchMarketplace, type MarketItem } from "@/lib/marketplace";
import type { TemplatesData } from "@/lib/content";

const covers = [
  "from-[#ffd3e4] to-[#c7ceff]",
  "from-[#b8f0e6] to-[#bfd8ff]",
  "from-[#ffe3b8] to-[#ffc8de]",
  "from-[#d5ccff] to-[#bfc6ff]",
  "from-[#2a3150] to-[#0b1020]",
];

export async function Templates({ data }: { data: TemplatesData }) {
  const market = await fetchMarketplace();
  const items: MarketItem[] = market?.items.slice(0, 5) ?? [];
  const hasReal = items.length > 0;
  // Tag chips are the CMS-editable labels; they link to the catalog, filtered when the label matches a real category.
  const categoryKeyByLabel = new Map((market?.categories ?? []).map((c) => [c.label.toLowerCase(), c.key]));

  return (
    <section id="template" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-10 px-4 py-20 md:px-16">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading align="left" eyebrow={data.eyebrow} title={data.title} />
        <Link href={hasReal ? "/template" : "/kreator"} className="btn glass rounded-full! px-6 py-3.5 text-[15px]">
          {hasReal ? "Lihat semua template" : "Jadi Kreator"}
        </Link>
      </div>
      <ul className="flex flex-wrap gap-2.5 text-sm font-medium">
        {data.tags.map((t, i) => {
          const key = categoryKeyByLabel.get(t.text.toLowerCase());
          const cls = i === 0 ? "btn bg-foreground px-5 py-2.5 text-white" : "btn glass rounded-full! px-5 py-2.5 text-muted";
          return (
            <li key={`${t.text}-${i}`}>
              {hasReal ? <Link href={key ? `/template?kategori=${key}` : "/template"} className={cls}>{t.text}</Link> : <span className={cls}>{t.text}</span>}
            </li>
          );
        })}
      </ul>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {hasReal
          ? items.map((item, i) => <TemplateCard key={item.id} item={item} index={i} />)
          : covers.map((c, i) => (
              <article key={i} className="glass flex flex-col gap-3.5 rounded-3xl! p-3 pb-[18px]">
                <div className={`h-[300px] rounded-2xl bg-gradient-to-b lg:h-[340px] ${c}`} />
                <div className="px-1.5">
                  <div className="text-[15px] font-semibold">[Nama Template]</div>
                  <div className="text-[13px] text-muted">oleh [Kreator] · [123] pakai</div>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}
