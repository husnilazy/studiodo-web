import Link from "next/link";
import { InstallButton } from "@/components/InstallButton";
import { TemplateCard } from "@/components/TemplateCard";
import { fetchMarketplace } from "@/lib/marketplace";
import { portalGet } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function PortalTemplatePage({ searchParams }: PageProps<"/portal/template">) {
  const sp = await searchParams;
  const highlight = typeof sp.pilih === "string" ? sp.pilih : "";
  const category = typeof sp.kategori === "string" ? sp.kategori : "";
  const [market, installed] = await Promise.all([fetchMarketplace(category || undefined), portalGet<string[]>("/marketplace/installed")]);
  const installedIds = new Set(installed);

  // A template picked from the public catalog floats to the front so the visitor lands right on it.
  const items = market ? [...market.items].sort((a, b) => Number(b.id === highlight) - Number(a.id === highlight)) : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Template</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Pasang template</h1>
        <p className="mt-2 max-w-[560px] text-[15px] text-muted">Template yang dipasang langsung muncul di layar &ldquo;Pilih Frame&rdquo; kiosk Anda dan bisa diatur di menu Kelola Frame aplikasi.</p>
      </div>

      {market && (
        <ul className="flex flex-wrap gap-2.5 text-sm font-medium">
          {[{ key: "", label: "Semua" }, ...market.categories].map((c) => {
            const active = c.key === category;
            return (
              <li key={c.key || "all"}>
                <Link href={c.key ? `/portal/template?kategori=${c.key}` : "/portal/template"} className={active ? "btn bg-foreground px-5 py-2.5 text-on-foreground" : "btn glass rounded-full! px-5 py-2.5 text-muted"}>{c.label}</Link>
              </li>
            );
          })}
        </ul>
      )}

      {market === null ? (
        <p className="text-[15px] text-muted">Katalog belum dapat dimuat. Coba muat ulang halaman.</p>
      ) : items.length === 0 ? (
        <p className="text-[15px] text-muted">{category ? "Belum ada template di kategori ini." : "Katalog sedang disiapkan."}</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={item.id} className={item.id === highlight ? "rounded-[28px] ring-2 ring-accent ring-offset-4 ring-offset-transparent" : ""}>
              <TemplateCard item={item} index={i} action={<InstallButton id={item.id} installed={installedIds.has(item.id)} />} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
