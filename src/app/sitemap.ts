import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const routes = ["", "/daftar", "/unduh", "/kontak", "/kreator", "/blog", "/privasi", "/syarat"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${SITE_URL}${r}`,
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : 0.6,
  }));
}
