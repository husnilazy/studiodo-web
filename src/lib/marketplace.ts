import { API_URL } from "./api";

export type MarketCategory = { key: string; label: string };
export type MarketItem = {
  id: string;
  name: string;
  description: string;
  creatorName: string | null;
  category: string;
  orientation: "portrait" | "landscape" | string;
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  slotCount: number;
  featured: boolean;
  installCount: number;
  /** Absent on an API build older than the catalog search/detail update. */
  createdAt?: string;
  outputPreset?: string;
  ratingAverage?: number | null;
  ratingCount?: number;
};
export type Marketplace = { categories: MarketCategory[]; items: MarketItem[] };

export const SORTS = [
  { key: "unggulan", label: "Unggulan" },
  { key: "populer", label: "Terpopuler" },
  { key: "rating", label: "Rating tertinggi" },
  { key: "terbaru", label: "Terbaru" },
  { key: "nama", label: "Nama A–Z" },
] as const;

export type MarketQuery = { category?: string; q?: string; sort?: string; orientation?: string };

/** Public catalog. null = API unreachable (distinct from an empty catalog). */
export async function fetchMarketplace(query: MarketQuery = {}): Promise<Marketplace | null> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);
  if (query.orientation) params.set("orientation", query.orientation);
  const qs = params.toString();
  try {
    const res = await fetch(`${API_URL}/api/public/marketplace${qs ? `?${qs}` : ""}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Marketplace;
    return Array.isArray(data?.items) ? data : null;
  } catch {
    return null;
  }
}

export type MarketDetail = {
  item: MarketItem;
  creator: { id: string; name: string; instagramHandle: string | null } | null;
  related: MarketItem[];
  reviews?: MarketReview[];
  reportReasons?: { key: string; label: string }[];
};
export type MarketReview = { id: string; rating: number; comment: string; createdAt: string; tenantName: string };

export async function fetchMarketItem(id: string): Promise<MarketDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/marketplace/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as MarketDetail;
  } catch {
    return null;
  }
}

export type CreatorProfile = {
  creator: { id: string; name: string; bio: string | null; instagramHandle: string | null; website: string | null; createdAt: string };
  totalInstalls: number;
  items: MarketItem[];
};

export async function fetchCreatorProfile(id: string): Promise<CreatorProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/creators/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as CreatorProfile;
  } catch {
    return null;
  }
}

/** "Baru" for entries published in the last 14 days. */
export const isNew = (item: MarketItem) => Boolean(item.createdAt) && Date.now() - new Date(item.createdAt!).getTime() < 14 * 86_400_000;
