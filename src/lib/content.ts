import defaults from "./defaultContent.json";
import { API_URL } from "./api";

// Shapes of each editable section. The server (server/lib/siteContent.ts) is the
// source of truth for fields; defaultContent.json is generated from it and is only
// used when the API is unreachable, so the site never renders empty.
export type Bullet = { text: string };
export type HeroData = { badge: string; titleLine1: string; titleLine2: string; subtitle: string; primaryCta: string; secondaryCta: string; bullets: Bullet[] };
export type TrustData = { caption: string; logos: { name: string }[] };
export type FeaturesData = { eyebrow: string; title: string; items: { title: string; body: string }[] };
export type HowData = { eyebrow: string; title: string; steps: { title: string; body: string }[] };
export type TemplatesData = { eyebrow: string; title: string; tags: Bullet[] };
export type PricingData = { eyebrow: string; title: string };
export type CommunityData = { eyebrow: string; title: string; body: string; perks: { title: string; body: string }[] };
export type TestimonialsData = { title: string; items: { quote: string; name: string; business: string; city: string }[] };
export type FaqData = { eyebrow: string; title: string; items: { q: string; a: string }[] };
export type CtaData = { title: string; body: string; primaryCta: string; secondaryCta: string };
export type SiteData = { tagline: string; whatsappNumber: string; supportEmail: string };

export type SectionKey = "hero" | "trust" | "features" | "howItWorks" | "templates" | "pricing" | "community" | "testimonials" | "faq" | "cta";
export type SiteContent = { site: SiteData; sections: { key: string; data: Record<string, unknown> }[] };

const fallback = defaults as unknown as SiteContent;

/** Content from the CMS, or the built-in defaults when the API is unreachable. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API_URL}/api/public/content`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    const data = (await res.json()) as SiteContent;
    return Array.isArray(data?.sections) && data.site ? data : fallback;
  } catch {
    return fallback;
  }
}

export async function getSite(): Promise<SiteData> {
  return (await getSiteContent()).site;
}

export function whatsappLink(site: SiteData, message = "Halo STUDIODO, saya ingin konsultasi soal photobooth."): string | null {
  return site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}` : null;
}
