import defaults from "./defaultContent.json";
import { API_URL } from "./api";

// Shapes of each editable section. The server (server/lib/siteContent.ts) is the
// source of truth for fields; defaultContent.json is generated from it and is only
// used when the API is unreachable, so the site never renders empty.
export type Bullet = { text: string };
export type HeroData = { badge: string; titleLine1: string; titleLine2: string; subtitle: string; primaryCta: string; secondaryCta: string; bullets: Bullet[] };
export type TrustData = { caption: string; logos: { name: string; image?: string }[] };
export type FeaturesData = { eyebrow: string; title: string; items: { icon?: string; title: string; body: string }[] };
export type HowData = { eyebrow: string; title: string; steps: { title: string; body: string }[] };
export type TemplatesData = { eyebrow: string; title: string; tags: Bullet[] };
export type PricingData = { eyebrow: string; title: string };
export type CommunityData = { eyebrow: string; title: string; body: string; perks: { icon?: string; title: string; body: string }[] };
export type TestimonialsData = { title: string; items: { quote: string; name: string; business: string; city: string }[] };
export type FaqData = { eyebrow: string; title: string; items: { q: string; a: string }[] };
export type CtaData = { title: string; body: string; primaryCta: string; secondaryCta: string };
export type SiteData = { logoUrl?: string; logoDarkUrl?: string; faviconUrl?: string; tagline: string; whatsappNumber: string; supportEmail: string };

export type SectionKey = "hero" | "trust" | "features" | "howItWorks" | "templates" | "pricing" | "community" | "testimonials" | "faq" | "cta";
export type SiteContent = { site: SiteData; sections: { key: string; data: Record<string, unknown> }[] };


// "[Nama Booth]"-style text is an authoring placeholder, never real copy. Whatever the source (CMS row,
// server default, bundled fallback), a list item that is only a placeholder is dropped so visitors never
// see one; sections that end up empty then hide themselves.
const isPlaceholder = (v: unknown) => typeof v === "string" && /^\s*\[[^\]]*\]\s*$/.test(v);

function scrub(content: SiteContent): SiteContent {
  const dropPlaceholderItems = (items: unknown, key: string) =>
    Array.isArray(items) ? items.filter((it) => !isPlaceholder((it as Record<string, unknown>)[key])) : items;
  return {
    ...content,
    sections: content.sections.map((s) => {
      const d = { ...s.data };
      if (s.key === "trust") d.logos = dropPlaceholderItems(d.logos, "name");
      if (s.key === "testimonials") d.items = dropPlaceholderItems(d.items, "quote");
      if (s.key === "faq") d.items = dropPlaceholderItems(d.items, "a");
      return { ...s, data: d };
    }),
  };
}

const fallback = scrub(defaults as unknown as SiteContent);

/** Content from the CMS, or the built-in defaults when the API is unreachable. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API_URL}/api/public/content`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    const data = (await res.json()) as SiteContent;
    return Array.isArray(data?.sections) && data.site ? scrub(data) : fallback;
  } catch {
    return fallback;
  }
}

/** Turn a CMS image value ("/api/public/assets/<id>") into a loadable URL on the API origin. Anything else is ignored. */
export function assetUrl(path: string | undefined): string | null {
  return path && /^\/api\/public\/assets\/[0-9a-f-]{36}$/i.test(path) ? `${API_URL}${path}` : null;
}

export async function getSite(): Promise<SiteData> {
  return (await getSiteContent()).site;
}

/** wa.me needs digits in international format; Indonesians type "0859…" or "+62 859…". */
export function waDigits(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("62")) return d;
  if (d.startsWith("0")) return "62" + d.slice(1);
  return d;
}

export function whatsappLink(site: SiteData, message = "Halo STUDIODO, saya ingin konsultasi soal photobooth."): string | null {
  const n = waDigits(site.whatsappNumber || "");
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}
