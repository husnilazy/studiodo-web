"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/portal";

export type CheckoutState = { error: string | null };

export async function checkoutAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const token = await getToken();
  if (!token) redirect("/masuk?sesi=habis");
  const planSlug = String(formData.get("planSlug") ?? "");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/portal/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ planSlug }),
      cache: "no-store",
    });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi." };
  }
  if (res.status === 401) redirect("/masuk?sesi=habis");
  const body = (await res.json().catch(() => ({}))) as { redirectUrl?: string; error?: string };
  if (!res.ok || !body.redirectUrl) return { error: body.error ?? "Gagal membuat pembayaran." };

  // Only ever follow Midtrans' hosted page — never redirect to an arbitrary URL the API returned.
  const target = new URL(body.redirectUrl);
  if (target.protocol !== "https:" || !/(^|\.)midtrans\.com$/.test(target.hostname)) {
    return { error: "Alamat pembayaran tidak valid." };
  }
  redirect(body.redirectUrl);
}
