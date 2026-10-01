import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Markdown } from "@/components/Markdown";
import { BlogCard } from "@/components/BlogCard";
import { assetUrl } from "@/lib/content";
import { categoryMeta, fetchBlogPost, fetchBlogPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan", robots: { index: false } };
  const cover = assetUrl(post.coverUrl ?? undefined);
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt || undefined, publishedTime: post.publishedAt, ...(cover ? { images: [cover] } : {}) },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const cat = categoryMeta(post.category);
  const cover = assetUrl(post.coverUrl ?? undefined);
  // Related: other posts in the same category (falls back to the latest posts when the category is thin).
  const pool = (await fetchBlogPosts({ category: post.category })) ?? [];
  const related = pool.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <PageShell eyebrow={cat.key} title={post.title} intro={post.excerpt || undefined} narrow>
      <p className="mb-6 text-[13px] text-muted">
        {formatDate(post.publishedAt)}
        {post.readMinutes ? ` · ${post.readMinutes} menit baca` : ""}
        {post.author ? ` · ${post.author}` : ""}
      </p>
      {cover && (
        <div className="glass mb-8 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded cover of unknown size, served by the API */}
          <img src={cover} alt="" className="h-auto max-h-[420px] w-full object-cover" />
        </div>
      )}
      <article className="glass p-5 sm:p-8 md:p-10">
        <Markdown source={post.body} />
      </article>

      <aside className="glass-dark mt-10 flex flex-col items-start gap-4 p-9 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-[480px] flex-col gap-1.5">
          <h2 className="font-display text-2xl tracking-tight text-white">Siap mencoba STUDIODO?</h2>
          <p className="text-[15px] leading-relaxed text-[#c6cce0]">Coba semua fitur gratis 7 hari, tanpa kartu kredit.</p>
        </div>
        <Link href="/daftar" className="btn shrink-0 bg-white px-7 py-3.5 text-foreground">Mulai Trial Gratis</Link>
      </aside>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl tracking-tight">Artikel lain di {cat.key}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <BlogCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Link href="/blog" className="btn glass rounded-full! px-6 py-3">← Semua artikel</Link>
      </div>
    </PageShell>
  );
}
