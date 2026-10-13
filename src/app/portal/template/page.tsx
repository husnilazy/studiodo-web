import { Suspense } from "react";
import { MarketFilters } from "@/components/MarketFilters";
import { PageHeader } from "@/components/dash/PageHeader";
import { InstallButton } from "@/components/InstallButton";
import { TemplateCard } from "@/components/TemplateCard";
import { fetchMarketplace } from "@/lib/marketplace";
import { portalGet } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function PortalTemplatePage({ searchParams }: PageProps<"/portal/template">) {
  const sp = await searchParams;
  const highlight = typeof sp.pilih === "string" ? sp.pilih : "";
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const category = one(sp.kategori);
  const q = one(sp.q);
  const [market, installed] = await Promise.all([fetchMarketplace({ category, q, sort: one(sp.urut), orientation: one(sp.arah) }), portalGet<string[]>("/marketplace/installed")]);
  const installedIds = new Set(installed);

  // A template picked from the public catalog floats to the front so the visitor lands right on it.
  const items = market ? [...market.items].sort((a, b) => Number(b.id === highlight) - Number(a.id === highlight)) : [];

  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Template" title="Pasang template" intro="Template yang dipasang langsung muncul di layar &ldquo;Pilih Frame&rdquo; kiosk Anda dan bisa diatur di menu Kelola Frame aplikasi." />

      {market && (
        <Suspense fallback={null}>
          <MarketFilters basePath="/portal/template" categories={market.categories} keep={["pilih"]} />
        </Suspense>
      )}

      {market === null ? (
        <p className="text-[15px] text-muted">Katalog belum dapat dimuat. Coba muat ulang halaman.</p>
      ) : items.length === 0 ? (
        <p className="text-[15px] text-muted">{category || q ? "Tidak ada template yang cocok." : "Katalog sedang disiapkan."}</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={item.id} className={item.id === highlight ? "rounded-[28px] ring-2 ring-accent ring-offset-4 ring-offset-transparent" : ""}>
              <TemplateCard item={item} index={i} href={`/template/${item.id}`} action={<InstallButton id={item.id} installed={installedIds.has(item.id)} />} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
