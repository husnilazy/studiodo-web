import Link from "next/link";
import { SectionHeading } from "../SectionHeading";
import { TemplateCard } from "../TemplateCard";
import { fetchMarketplace, type MarketItem } from "@/lib/marketplace";
import type { TemplatesData } from "@/lib/content";

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

      {hasReal ? (
        <>
          <ul className="flex flex-wrap gap-2.5 text-sm font-medium">
            {data.tags.map((t, i) => {
              const key = categoryKeyByLabel.get(t.text.toLowerCase());
              const cls = i === 0 ? "btn bg-foreground px-5 py-2.5 text-on-foreground" : "btn glass rounded-full! px-5 py-2.5 text-muted";
              return (
                <li key={`${t.text}-${i}`}>
                  <Link href={key ? `/template?kategori=${key}` : "/template"} className={cls}>{t.text}</Link>
                </li>
              );
            })}
          </ul>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {items.map((item, i) => <TemplateCard key={item.id} item={item} index={i} />)}
          </div>
        </>
      ) : (
        // No catalog yet (or the API is unreachable): an honest teaser instead of fake template cards.
        <div data-reveal="up" className="glass flex flex-col items-start gap-4 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-[560px] flex-col gap-2">
            <h3 className="font-display text-2xl tracking-tight">Koleksi frame segera hadir</h3>
            <p className="text-[15px] leading-relaxed text-muted">Kami sedang menyiapkan frame pilihan untuk wedding, ulang tahun, dan acara korporat. Desainer bisa mendaftar untuk ikut mengisi katalog.</p>
          </div>
          <Link href="/kreator" className="btn btn-primary shrink-0 px-7 py-3.5">Daftar sebagai kreator</Link>
        </div>
      )}
    </section>
  );
}
