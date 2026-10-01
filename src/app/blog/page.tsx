import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { BlogCard } from "@/components/BlogCard";
import { BLOG_CATEGORIES, fetchBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Panduan memakai STUDIODO, tips bisnis photobooth, dan kabar terbaru.",
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const category = typeof sp.kategori === "string" && BLOG_CATEGORIES.some((c) => c.key === sp.kategori) ? sp.kategori : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";

  const all = await fetchBlogPosts({ category: category || undefined });
  // Search is a simple case-insensitive match on title and excerpt — plenty for a small blog.
  const posts = all && q ? all.filter((p) => `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase())) : all;

  return (
    <PageShell eyebrow="Blog" title="Bisnis photobooth, tanpa misteri." intro="Panduan memakai STUDIODO, tips menjalankan booth, dan kabar terbaru.">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap gap-2.5 text-sm font-medium">
          {[{ key: "" }, ...BLOG_CATEGORIES].map((c) => {
            const active = c.key === category;
            const href = `/blog${c.key || q ? "?" : ""}${[c.key ? `kategori=${encodeURIComponent(c.key)}` : "", q ? `q=${encodeURIComponent(q)}` : ""].filter(Boolean).join("&")}`;
            return (
              <li key={c.key || "all"}>
                <Link href={href} aria-current={active ? "true" : undefined} className={active ? "btn bg-foreground px-5 py-2.5 text-white" : "btn glass rounded-full! px-5 py-2.5 text-muted"}>
                  {c.key || "Semua"}
                </Link>
              </li>
            );
          })}
        </ul>
        <form action="/blog" role="search" className="flex gap-2">
          {category && <input type="hidden" name="kategori" value={category} />}
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Cari artikel…"
            aria-label="Cari artikel"
            className="w-full rounded-full border border-foreground/10 bg-white/70 px-5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 lg:w-64"
          />
          <button type="submit" className="btn btn-primary px-5 py-2.5 text-sm">Cari</button>
        </form>
      </div>

      {posts === null ? (
        <p className="text-[15px] text-muted">Artikel belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.</p>
      ) : posts.length === 0 ? (
        <div className="flex max-w-[560px] flex-col items-start gap-4">
          <p className="text-[15px] leading-relaxed text-muted">{q || category ? "Tidak ada artikel yang cocok." : "Artikel pertama sedang ditulis. Sementara itu, punya pertanyaan? Tim kami siap membantu."}</p>
          {q || category ? <Link href="/blog" className="btn glass rounded-full! px-6 py-3">Lihat semua artikel</Link> : <Link href="/kontak" className="btn glass rounded-full! px-7 py-3.5">Hubungi Kami</Link>}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <BlogCard key={p.slug} post={p} />)}
        </div>
      )}
    </PageShell>
  );
}
