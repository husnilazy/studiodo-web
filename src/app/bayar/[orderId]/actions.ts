"use server";

import { API_URL } from "@/lib/api";
import type { PayData } from "@/components/PayQris";

export type PayStatus = "pending" | "paid" | "failed" | "expired";

const ORDER = /^SDO-[A-Z0-9-]{4,40}$/;
const url = (orderId: string, token: string, tail: string) => `${API_URL}/api/public/billing/pay/${encodeURIComponent(orderId)}${tail}?token=${encodeURIComponent(token)}`;

/** Asks the API whether this order has been paid (the page polls it). Never throws: an unreachable API just means "still pending". */
export async function checkPayAction(orderId: string, token: string): Promise<PayStatus> {
  if (!ORDER.test(orderId) || !token) return "pending";
  try {
    const res = await fetch(url(orderId, token, "/check"), { method: "POST", cache: "no-store" });
    if (!res.ok) return "pending";
    const b = (await res.json()) as { status?: PayStatus };
    return b.status ?? "pending";
  } catch {
    return "pending";
  }
}

/** Charges the payment method the tenant picked and returns the refreshed page data (QR, VA number, ...). */
export async function chooseMethodAction(orderId: string, token: string, method: string): Promise<{ ok: true; data: PayData } | { ok: false; error: string }> {
  if (!ORDER.test(orderId) || !token) return { ok: false, error: "Tautan tidak valid" };
  try {
    const res = await fetch(url(orderId, token, "/charge"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method }), cache: "no-store" });
    const b = (await res.json().catch(() => ({}))) as PayData & { error?: string };
    if (!res.ok) return { ok: false, error: b.error ?? "Gagal membuat pembayaran. Coba metode lain." };
    return { ok: true, data: b };
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server. Coba lagi." };
  }
}

/** Midtrans' hosted page for cards and anything else; only ever returns a midtrans.com address. */
export async function otherMethodAction(orderId: string, token: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!ORDER.test(orderId) || !token) return { ok: false, error: "Tautan tidak valid" };
  try {
    const res = await fetch(url(orderId, token, "/other"), { method: "POST", cache: "no-store" });
    const b = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !b.url) return { ok: false, error: b.error ?? "Gagal membuka halaman pembayaran." };
    let target: URL;
    try { target = new URL(b.url); } catch { return { ok: false, error: "Alamat pembayaran tidak valid." }; }
    if (target.protocol !== "https:" || !/(^|\.)midtrans\.com$/.test(target.hostname)) return { ok: false, error: "Alamat pembayaran tidak valid." };
    return { ok: true, url: b.url };
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server. Coba lagi." };
  }
}
