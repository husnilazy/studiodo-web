import { API_URL } from "./api";

export const BLOG_CATEGORIES = [
  { key: "Panduan", icon: "monitor", tint: "from-[#c7ceff] to-[#edefff]", blurb: "Langkah demi langkah memakai aplikasi STUDIODO." },
  { key: "Tips Bisnis", icon: "chart", tint: "from-[#b8f0e6] to-[#eafbf8]", blurb: "Cara menjalankan dan mengembangkan bisnis photobooth." },
  { key: "Informasi", icon: "sparkles", tint: "from-[#ffd3e4] to-[#fff0f6]", blurb: "Kabar dan penjelasan seputar STUDIODO." },
  { key: "Rilis", icon: "bolt", tint: "from-[#ffe3b8] to-[#fff6e6]", blurb: "Fitur dan perbaikan terbaru." },
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]["key"];

export function categoryMeta(key: string | undefined) {
  return BLOG_CATEGORIES.find((c) => c.key === key) ?? BLOG_CATEGORIES[2];
}

// category/coverUrl/readMinutes only exist once the API has the blog upgrade deployed; every consumer
// below tolerates their absence so web and API can ship in either order.
export type BlogSummary = {
  slug: string;
  title: string;
  excerpt: string;
  author: string | null;
  publishedAt: string;
  category?: string;
  coverUrl?: string | null;
  position?: number | null;
  readMinutes?: number;
};
export type BlogPost = BlogSummary & { body: string };

/** Published posts. null = API unreachable (distinct from "no posts yet" = []). */
export async function fetchBlogPosts(opts: { category?: string; guideOrder?: boolean } = {}): Promise<BlogSummary[] | null> {
  const qs = new URLSearchParams();
  if (opts.category) qs.set("category", opts.category);
  if (opts.guideOrder) qs.set("sort", "urutan");
  try {
    const res = await fetch(`${API_URL}/api/public/blog${qs.size ? `?${qs}` : ""}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as BlogSummary[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/blog/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}
