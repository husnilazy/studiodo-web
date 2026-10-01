import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { fetchBlogPosts } from "@/lib/blog";

const routes = ["", "/template", "/booth","/daftar", "/unduh", "/kontak", "/kreator", "/blog", "/bantuan", "/privasi", "/syarat"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await fetchBlogPosts()) ?? [];
  return [
    ...routes.map((r) => ({
      url: `${SITE_URL}${r}`,
      changeFrequency: (r === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: r === "" ? 1 : 0.6,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
