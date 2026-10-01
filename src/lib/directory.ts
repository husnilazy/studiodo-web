import { API_URL } from "./api";

export type DirectoryItem = {
  id: string;
  name: string;
  city: string;
  type: string | null;
  description: string;
  instagram: string | null;
  website: string | null;
  whatsapp: string | null;
};
export type Directory = { cities: string[]; items: DirectoryItem[] };

/** Public booth directory. null = API unreachable (distinct from "nobody listed yet"). */
export async function fetchDirectory(city?: string): Promise<Directory | null> {
  const qs = city ? `?city=${encodeURIComponent(city)}` : "";
  try {
    const res = await fetch(`${API_URL}/api/public/directory${qs}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Directory;
    return Array.isArray(data?.items) ? data : null;
  } catch {
    return null;
  }
}
