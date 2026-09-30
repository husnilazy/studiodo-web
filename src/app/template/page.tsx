import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { TemplateCard } from "@/components/TemplateCard";
import { fetchMarketplace } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Template Frame",
  description: "Koleksi frame photobooth siap pakai untuk pemilik booth STUDIODO: wedding, ulang tahun, korporat, dan lainnya.",
};

export default async function TemplatePage({ searchParams }: PageProps<"/template">) {
  const sp = await searchParams;
  const category = typeof sp.kategori === "string" ? sp.kategori : "";
  const market = await fetchMarketplace(category || undefined);

  return (
    <PageShell eyebrow="Marketplace template" title="Frame siap pakai untuk booth Anda." intro="Pilih frame, pasang ke akun Anda dengan satu klik, dan langsung tampil di kiosk.">
      {market && (
        <ul className="mb-8 flex flex-wrap gap-2.5 text-sm font-medium">
          {[{ key: "", label: "Semua" }, ...market.categories].map((c) => {
            const active = c.key === category;
            return (
              <li key={c.key || "all"}>
                <Link href={c.key ? `/template?kategori=${c.key}` : "/template"} aria-current={active ? "true" : undefined}
                  className={active ? "btn bg-foreground px-5 py-2.5 text-white" : "btn glass rounded-full! px-5 py-2.5 text-muted"}>
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {market === null ? (
        <p className="text-[15px] text-muted">Katalog belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.</p>
      ) : market.items.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-[15px] text-muted">{category ? "Belum ada template di kategori ini." : "Katalog sedang disiapkan. Template pertama segera hadir."}</p>
          {category && <Link href="/template" className="btn glass rounded-full! px-6 py-3">Lihat semua</Link>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {market.items.map((item, i) => (
              <TemplateCard
                key={item.id}
                item={item}
                index={i}
                action={<Link href={`/portal/template?pilih=${item.id}`} className="btn btn-primary block px-4 py-3 text-center text-sm">Pakai template</Link>}
              />
            ))}
          </div>
          <p className="mt-8 text-[13px] text-muted">
            Belum punya akun? <Link href="/daftar" className="font-semibold text-accent underline underline-offset-4">Ajukan akun tenant</Link> untuk memasang template.
          </p>
        </>
      )}
    </PageShell>
  );
}
