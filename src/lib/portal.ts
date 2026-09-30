import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "./api";

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
    locked: boolean;
    graceDaysRemaining: number | null;
  };
  kiosks: { id: string; label: string | null; appVersion: string | null; paired: boolean; lastUsedAt: string | null; online: boolean }[];
  last30Days: { sessions: number; revenue: number };
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
