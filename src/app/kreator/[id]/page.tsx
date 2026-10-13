import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import { TemplateCard } from "@/components/TemplateCard";
import { fetchCreatorProfile } from "@/lib/marketplace";

export async function generateMetadata({ params }: PageProps<"/kreator/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await fetchCreatorProfile(id);
  return p ? { title: `${p.creator.name} — Kreator STUDIODO`, description: p.creator.bio ?? `Template frame buatan ${p.creator.name} di marketplace STUDIODO.` } : { title: "Kreator tidak ditemukan" };
}

export default async function CreatorProfilePage({ params }: PageProps<"/kreator/[id]">) {
  const { id } = await params;
  const p = await fetchCreatorProfile(id);
  if (!p) notFound();
  const { creator, items, totalInstalls } = p;
  const since = new Date(creator.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <PageShell eyebrow="Kreator" title={creator.name} intro={creator.bio ?? undefined}>
      <div className="mb-10 flex flex-wrap items-center gap-3 text-sm">
        <span className="glass rounded-full! px-4 py-2 text-muted"><strong className="text-foreground">{items.length}</strong> template</span>
        <span className="glass rounded-full! px-4 py-2 text-muted"><strong className="text-foreground">{totalInstalls}</strong> pemasangan</span>
        <span className="glass rounded-full! px-4 py-2 text-muted">Bergabung {since}</span>
        {creator.instagramHandle && <a href={`https://instagram.com/${creator.instagramHandle}`} target="_blank" rel="noreferrer" className="btn glass rounded-full! px-4 py-2 text-accent">@{creator.instagramHandle}</a>}
        {creator.website && <a href={creator.website} target="_blank" rel="noopener noreferrer" className="btn glass inline-flex items-center gap-1.5 rounded-full! px-4 py-2 text-accent">Situs web <Icon name="external" className="h-3.5 w-3.5" /></a>}
      </div>
      {items.length === 0 ? (
        <p className="text-[15px] text-muted">Belum ada template yang terbit.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {items.map((item, i) => <TemplateCard key={item.id} item={item} index={i} href={`/template/${item.id}`} action={<Link href={`/portal/template?pilih=${item.id}`} className="btn btn-primary block px-4 py-3 text-center text-sm">Pakai template</Link>} />)}
        </div>
      )}
    </PageShell>
  );
}
