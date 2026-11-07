"use server";

import { API_URL } from "@/lib/api";

export type PayStatus = "pending" | "paid" | "failed" | "expired";

/** Asks the API whether this order has been paid (the page polls it). Never throws: an unreachable API just means "still pending". */
export async function checkPayAction(orderId: string, token: string): Promise<PayStatus> {
  if (!/^SDO-[A-Z0-9-]{4,40}$/.test(orderId) || !token) return "pending";
  try {
    const res = await fetch(`${API_URL}/api/public/billing/pay/${encodeURIComponent(orderId)}/check?token=${encodeURIComponent(token)}`, { method: "POST", cache: "no-store" });
    if (!res.ok) return "pending";
    const b = (await res.json()) as { status?: PayStatus };
    return b.status ?? "pending";
  } catch {
    return "pending";
  }
}
