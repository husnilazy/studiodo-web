import { API_URL } from "./api";

export type BlogSummary = { slug: string; title: string; excerpt: string; author: string | null; publishedAt: string };
export type BlogPost = BlogSummary & { body: string };

/** Published posts, newest first. null = API unreachable (distinct from "no posts yet" = []). */
export async function fetchBlogPosts(): Promise<BlogSummary[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/blog`, { next: { revalidate: 60 } });
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
