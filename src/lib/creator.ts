import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "./api";

// Creator-portal session: the API's creator JWT (12h) in an httpOnly cookie — a separate realm from
// the tenant portal's cookie, so a creator login never opens the tenant dashboard or vice versa.
export const CREATOR_COOKIE = "studiodo_creator";
export const CREATOR_MAX_AGE = 12 * 60 * 60;

export async function getCreatorToken(): Promise<string | null> {
  return (await cookies()).get(CREATOR_COOKIE)?.value ?? null;
}

export type { CreatorSlot, CreatorTemplate } from "./creatorTypes";
export { CATEGORIES, PRESETS } from "./creatorTypes";

export type CreatorMe = { name: string; email: string; whatsapp: string | null };

export async function creatorGet<T>(path: string): Promise<T | null> {
  const token = await getCreatorToken();
  if (!token) redirect("/kreator/masuk");
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/creator${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  } catch {
    throw new Error("Tidak dapat terhubung ke server STUDIODO. Coba muat ulang halaman.");
  }
  if (res.status === 401) redirect("/kreator/masuk?sesi=habis");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Gagal memuat data (HTTP ${res.status})`);
  return (await res.json()) as T;
}
