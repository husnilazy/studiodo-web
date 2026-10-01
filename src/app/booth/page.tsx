import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { fetchDirectory } from "@/lib/directory";
import { waDigits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cari Photobooth",
  description: "Temukan booth foto yang memakai STUDIODO di kota Anda untuk acara dan keramaian.",
};

export default async function BoothPage({ searchParams }: PageProps<"/booth">) {
  const sp = await searchParams;
  const city = typeof sp.kota === "string" ? sp.kota.slice(0, 100) : "";
  const dir = await fetchDirectory(city || undefined);

  return (
    <PageShell eyebrow="Komunitas" title="Cari photobooth di kotamu." intro="Daftar pemilik booth yang memakai STUDIODO dan bersedia dihubungi untuk acara Anda.">
      {dir && dir.cities.length > 0 && (
        <ul className="mb-8 flex flex-wrap gap-2.5 text-sm font-medium">
          {[{ c: "", label: "Semua kota" }, ...dir.cities.map((c) => ({ c, label: c }))].map(({ c, label }) => {
            const active = c.toLowerCase() === city.toLowerCase();
            return (
              <li key={c || "all"}>
                <Link href={c ? `/booth?kota=${encodeURIComponent(c)}` : "/booth"} aria-current={active ? "true" : undefined}
                  className={active ? "btn bg-foreground px-5 py-2.5 text-on-foreground" : "btn glass rounded-full! px-5 py-2.5 text-muted"}>{label}</Link>
              </li>
            );
          })}
        </ul>
      )}

      {dir === null ? (
        <p className="text-[15px] text-muted">Daftar booth belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.</p>
      ) : dir.items.length === 0 ? (
        <div className="flex max-w-[560px] flex-col items-start gap-4">
          <p className="text-[15px] leading-relaxed text-muted">{city ? `Belum ada booth terdaftar di ${city}.` : "Direktori sedang diisi. Pemilik booth bisa menampilkan booth-nya dari dashboard."}</p>
          {city ? <Link href="/booth" className="btn glass rounded-full! px-6 py-3">Lihat semua kota</Link> : <Link href="/daftar" className="btn btn-primary px-7 py-3.5">Gabung sebagai pemilik booth</Link>}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dir.items.map((b) => (
            <article key={b.id} className="glass flex flex-col gap-4 p-8">
              <div>
                <h2 className="font-display text-2xl tracking-tight">{b.name}</h2>
                <p className="mt-1 text-[13px] text-muted">{[b.type, b.city].filter(Boolean).join(" · ")}</p>
              </div>
              {b.description && <p className="text-[15px] leading-relaxed text-muted">{b.description}</p>}
              <div className="mt-auto flex flex-wrap gap-2 pt-2 text-sm font-semibold">
                {b.whatsapp && <a href={`https://wa.me/${waDigits(b.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-5 py-2.5">WhatsApp</a>}
                {b.instagram && <a href={`https://instagram.com/${b.instagram}`} target="_blank" rel="noopener noreferrer" className="btn glass rounded-full! px-5 py-2.5">Instagram</a>}
                {b.website && <a href={b.website} target="_blank" rel="noopener noreferrer" className="btn glass rounded-full! px-5 py-2.5">Website</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
