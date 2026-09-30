import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Markdown } from "@/components/Markdown";
import { fetchBlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan", robots: { index: false } };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt || undefined, publishedTime: post.publishedAt },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  return (
    <PageShell eyebrow="Blog" title={post.title} intro={post.excerpt || undefined} narrow>
      <p className="mb-6 text-[13px] text-muted">{formatDate(post.publishedAt)}{post.author ? ` · ${post.author}` : ""}</p>
      <article className="glass p-8 md:p-10">
        <Markdown source={post.body} />
      </article>
      <div className="mt-8">
        <Link href="/blog" className="btn glass rounded-full! px-6 py-3">← Semua artikel</Link>
      </div>
    </PageShell>
  );
}
