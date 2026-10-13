import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "./api";
import type { LicenseSummary, PortalBooth } from "./portalTypes";

// Tenant-portal session: the API's tenant-admin JWT (12h) is kept in an httpOnly
// cookie, so page scripts never see it. Pages are server components that read it
// and call the API on the tenant's behalf.
export const SESSION_COOKIE = "studiodo_session";
export const SESSION_MAX_AGE = 12 * 60 * 60; // matches the server's token TTL

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export type PortalSummary = {
  email: string | null;
  tenant: {
    name: string;
    status: string;
    planSlug: string;
    planName: string;
    kioskLimit: number | null;
    subscriptionEndsAt: string | null;
    /** True when NO booth can run (every booth is locked). Individual booths carry their own state in `kiosks`. */
    locked: boolean;
    graceDaysRemaining: number | null;
    /** Negotiated discount a STUDIODO admin granted this account (0 = none). */
    boothDiscountPercent?: number;
  };
  /** Per-booth licence picture. Absent on an API build older than per-booth licences. */
  licenses?: LicenseSummary;
  kiosks: PortalBooth[];
  last30Days: { sessions: number; revenue: number };
  /** Optional: absent until the API with daily series is deployed. */
  daily?: { date: string; sessions: number; revenue: number }[];
  recentPayments: { id: string; planName: string | null; amount: number; method: string; periodDays: number; createdAt: string }[];
  onlinePaymentEnabled: boolean;
};

export type BillingOrder = {
  orderId: string;
  planName: string;
  amount: number;
  periodDays: number;
  status: "pending" | "paid" | "failed" | "expired";
  paymentType: string | null;
  createdAt: string;
  paidAt: string | null;
  boothCount?: number;
  discountPercent?: number;
};

/** Authenticated GET against the portal API. Sends the visitor to /masuk when there is no valid session. */
export async function portalGet<T>(path: string): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/masuk");
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/portal${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  } catch {
    throw new Error("Tidak dapat terhubung ke server STUDIODO. Coba muat ulang halaman.");
  }
  if (res.status === 401) redirect("/masuk?sesi=habis");
  if (!res.ok) throw new Error(`Gagal memuat data (HTTP ${res.status})`);
  return (await res.json()) as T;
}

export const getSummary = () => portalGet<PortalSummary>("/summary");
export const getOrders = () => portalGet<BillingOrder[]>("/billing/orders");

export type SessionHistory = {
  page: number; pageSize: number; total: number; totalPages: number; paidCount: number; revenue: number;
  items: { id: string; createdAt: string; packageName: string | null; paymentMethod: string; paymentStatus: string; paymentPurpose: string; totalAmount: number; voucherCode: string | null; orientation: string; photoCount: number }[];
};
export const getSessionHistory = (query: URLSearchParams) => portalGet<SessionHistory>(`/sessions?${query.toString()}`);

export type CallResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

/**
 * Authenticated call to ANY tenant-admin API route (`/api/...`) on the tenant's behalf. Returns a result instead of
 * throwing so server actions can hand a readable message to the form. A dead session sends the visitor to the login page.
 */
export async function portalCall<T = unknown>(method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown): Promise<CallResult<T>> {
  const token = await getToken();
  if (!token) redirect("/masuk?sesi=habis");
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server STUDIODO. Coba lagi.", status: 0 };
  }
  if (res.status === 401) redirect("/masuk?sesi=habis");
  const text = await res.text();
  let parsed: unknown;
  try { parsed = text ? JSON.parse(text) : undefined; } catch { parsed = undefined; }
  if (!res.ok) {
    const message = (parsed as { error?: string } | undefined)?.error ?? `Permintaan gagal (HTTP ${res.status})`;
    return { ok: false, error: message, status: res.status };
  }
  return { ok: true, data: parsed as T };
}

/** Page-side GET against any tenant-admin route; throws (error boundary) on failure, like portalGet. */
export async function portalFetch<T>(path: string): Promise<T> {
  const result = await portalCall<T>("GET", path);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
