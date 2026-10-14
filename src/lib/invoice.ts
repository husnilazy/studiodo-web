import "server-only";
import { API_URL } from "./api";
import { portalCall } from "./portal";

// Shape of the API's invoice (server/lib/invoice.ts → InvoiceView). One invoice per subscription order.
export type InvoiceStatus = "paid" | "pending" | "failed" | "expired";

export type Invoice = {
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt: string | null;
  dueAt: string | null;
  paymentMethod: string | null;
  provider: string;
  seller: { name: string; company: string; email: string | null; whatsapp: string | null; website: string };
  customer: { businessName: string; ownerName: string | null; email: string | null; city: string | null; address: string | null };
  plan: string;
  periodDays: number;
  booths: string[];
  boothCount: number;
  unitPrice: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  payUrl: string | null;
};

export type InvoiceResult = { invoice: Invoice; shareUrl: string | null; signedIn: boolean } | null;

/**
 * Loads an invoice either with the signed link token (the one in the email — works without logging in) or, with no token,
 * as the signed-in tenant (the cookie session). Null = not found / not allowed; callers show a friendly "not found" page.
 */
export async function loadInvoice(orderId: string, token?: string): Promise<InvoiceResult> {
  if (!/^SDO-[A-Z0-9-]{4,40}$/.test(orderId)) return null;
  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/public/invoice/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (!res.ok) return null;
      const body = (await res.json()) as { invoice: Invoice };
      return { invoice: body.invoice, shareUrl: null, signedIn: false };
    } catch {
      return null;
    }
  }
  const r = await portalCall<{ invoice: Invoice; shareUrl: string }>("GET", `/api/portal/billing/orders/${encodeURIComponent(orderId)}`);
  return r.ok ? { invoice: r.data.invoice, shareUrl: r.data.shareUrl, signedIn: true } : null;
}
