import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { fetchBlogPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips bisnis photobooth, panduan penggunaan STUDIODO, dan catatan rilis.",
};

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  return (
    <PageShell eyebrow="Blog" title="Tips dan panduan booth." intro="Panduan memakai STUDIODO dan cerita seputar bisnis photobooth.">
      {posts === null ? (
        <p className="text-[15px] text-muted">Artikel belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.</p>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-[15px] text-muted">Artikel pertama sedang ditulis. Sementara itu, punya pertanyaan? Tim kami siap membantu.</p>
          <Link href="/kontak" className="btn glass rounded-full! px-7 py-3.5">Hubungi Kami</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="glass group flex min-h-[220px] flex-col justify-between gap-6 p-8 transition-transform hover:-translate-y-1">
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-2xl leading-snug tracking-tight">{p.title}</h2>
                {p.excerpt && <p className="text-[15px] leading-relaxed text-muted">{p.excerpt}</p>}
              </div>
              <div className="flex items-center justify-between text-[13px] text-muted">
                <span>{formatDate(p.publishedAt)}{p.author ? ` · ${p.author}` : ""}</span>
                <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
