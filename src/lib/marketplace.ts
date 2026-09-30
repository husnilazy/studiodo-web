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
};
export type Marketplace = { categories: MarketCategory[]; items: MarketItem[] };

/** Public catalog. null = API unreachable (distinct from an empty catalog). */
export async function fetchMarketplace(category?: string): Promise<Marketplace | null> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  try {
    const res = await fetch(`${API_URL}/api/public/marketplace${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Marketplace;
    return Array.isArray(data?.items) ? data : null;
  } catch {
    return null;
  }
}
