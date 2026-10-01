import { API_URL } from "./api";

export type PlatformStats = { tenants: number; kiosks: number; kiosksOnline: number; sessions30d: number };

/** Aggregate, public platform counters (real data). null when the API is unreachable or predates the endpoint. */
export async function fetchStats(): Promise<PlatformStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/stats`, { next: { revalidate: 300 } });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) return null;
    const d = (await res.json()) as Partial<PlatformStats>;
    return typeof d.kiosks === "number" ? { tenants: d.tenants ?? 0, kiosks: d.kiosks, kiosksOnline: d.kiosksOnline ?? 0, sessions30d: d.sessions30d ?? 0 } : null;
  } catch {
    return null;
  }
}
