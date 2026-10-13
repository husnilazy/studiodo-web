import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MarketFilters } from "@/components/MarketFilters";
import { PageShell } from "@/components/PageShell";
import { TemplateCard } from "@/components/TemplateCard";
import { fetchMarketplace } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Template Frame",
  description: "Koleksi frame photobooth siap pakai untuk pemilik booth STUDIODO: wedding, ulang tahun, korporat, dan lainnya.",
};

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function TemplatePage({ searchParams }: PageProps<"/template">) {
  const sp = await searchParams;
  const category = one(sp.kategori);
  const q = one(sp.q);
  const sort = one(sp.urut);
  const orientation = one(sp.arah);
  const market = await fetchMarketplace({ category, q, sort, orientation });
  const filtered = Boolean(category || q || orientation);

  return (
    <PageShell eyebrow="Marketplace template" title="Frame siap pakai untuk booth Anda." intro="Cari frame, lihat detailnya, lalu pasang ke akun Anda dengan satu klik — langsung tampil di kiosk.">
      {market && (
        <Suspense fallback={null}>
          <MarketFilters basePath="/template" categories={market.categories} />
        </Suspense>
      )}

      {market === null ? (
        <p className="text-[15px] text-muted">Katalog belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.</p>
      ) : market.items.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-[15px] text-muted">{filtered ? "Tidak ada template yang cocok dengan pencarian ini." : "Katalog sedang disiapkan. Template pertama segera hadir."}</p>
          {filtered && <Link href="/template" className="btn glass rounded-full! px-6 py-3">Hapus semua filter</Link>}
        </div>
      ) : (
        <>
          <p className="mb-5 text-[13px] text-muted">{market.items.length} template{filtered ? " ditemukan" : ""}</p>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {market.items.map((item, i) => (
              <TemplateCard
                key={item.id}
                item={item}
                index={i}
                href={`/template/${item.id}`}
                action={<Link href={`/portal/template?pilih=${item.id}`} className="btn btn-primary block px-4 py-3 text-center text-sm">Pakai template</Link>}
              />
            ))}
          </div>
          <p className="mt-8 text-[13px] text-muted">
            Belum punya akun? <Link href="/daftar" className="font-semibold text-accent underline underline-offset-4">Ajukan akun tenant</Link> untuk memasang template. Desainer?{" "}
            <Link href="/kreator" className="font-semibold text-accent underline underline-offset-4">Jual karya Anda di sini</Link>.
          </p>
        </>
      )}
    </PageShell>
  );
}
