"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { portalCall } from "@/lib/portal";
import type { ActionResult, BoothQuote } from "@/lib/portalTypes";

const UUID = /^[0-9a-f-]{36}$/i;

type CheckoutInput = { planSlug: string; interval: "monthly" | "yearly"; keyIds: string[]; newBooths: number };

function cleanInput(input: CheckoutInput) {
  return {
    planSlug: String(input.planSlug ?? ""),
    interval: input.interval === "yearly" ? "yearly" : "monthly",
    keyIds: (Array.isArray(input.keyIds) ? input.keyIds : []).map(String).filter((id) => UUID.test(id)).slice(0, 100),
    newBooths: Math.max(0, Math.min(100, Math.floor(Number(input.newBooths) || 0))),
  };
}

/** Live price breakdown for the chosen booths — the same numbers checkout will charge. */
export async function quoteAction(input: CheckoutInput): Promise<ActionResult<BoothQuote>> {
  const body = cleanInput(input);
  if (!body.planSlug || body.keyIds.length + body.newBooths === 0) return { ok: false, error: "Pilih minimal satu booth." };
  const result = await portalCall<{ quote: BoothQuote }>("POST", "/api/portal/billing/quote", body);
  return result.ok ? { ok: true, data: result.data.quote } : { ok: false, error: result.error };
}

/** Creates the gateway payment and sends the visitor to its hosted page. Returns only when something went wrong. */
export async function startCheckoutAction(input: CheckoutInput): Promise<ActionResult> {
  const body = cleanInput(input);
  const result = await portalCall<{ redirectUrl?: string }>("POST", "/api/portal/billing/checkout", body);
  if (!result.ok) return { ok: false, error: result.error };
  const url = result.data.redirectUrl;
  if (!url) return { ok: false, error: "Gagal membuat pembayaran." };
  // Only ever follow a payment gateway's hosted page (Midtrans or Xendit) — never redirect to an arbitrary URL the API returned.
  let target: URL;
  try { target = new URL(url); } catch { return { ok: false, error: "Alamat pembayaran tidak valid." }; }
  if (target.protocol !== "https:" || !/(^|\.)(midtrans\.com|xendit\.co)$/.test(target.hostname)) return { ok: false, error: "Alamat pembayaran tidak valid." };
  redirect(url);
}

export async function revealKeyAction(id: string): Promise<ActionResult<string>> {
  if (!UUID.test(id)) return { ok: false, error: "Booth tidak valid" };
  const result = await portalCall<{ key: string }>("GET", `/api/kiosk-keys/${id}/reveal`);
  return result.ok ? { ok: true, data: result.data.key } : { ok: false, error: result.error };
}

export async function renameBoothAction(id: string, label: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Booth tidak valid" };
  const result = await portalCall("PATCH", `/api/kiosk-keys/${id}`, { label });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/booth");
  return { ok: true, data: undefined };
}

export async function setAutoUpdateAction(id: string, enabled: boolean): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Booth tidak valid" };
  const result = await portalCall("PATCH", `/api/kiosk-keys/${id}`, { autoUpdateEnabled: Boolean(enabled) });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/booth");
  return { ok: true, data: undefined };
}

export async function resetDeviceAction(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Booth tidak valid" };
  const result = await portalCall("POST", `/api/kiosk-keys/${id}/reset-device`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/booth");
  return { ok: true, data: undefined };
}

export async function revokeBoothAction(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Booth tidak valid" };
  const result = await portalCall("DELETE", `/api/kiosk-keys/${id}`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/booth");
  return { ok: true, data: undefined };
}

/** Adds a booth slot without paying yet: it can be paired right away but stays locked until subscribed. */
export async function createBoothAction(label: string): Promise<ActionResult<{ key: string }>> {
  const result = await portalCall<{ key: string }>("POST", "/api/kiosk-keys", { label: String(label ?? "").slice(0, 80) });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/booth");
  return { ok: true, data: { key: result.data.key } };
}

export async function checkOrderAction(orderId: string): Promise<ActionResult<{ status: string; result: string }>> {
  if (!/^SDO-[A-Z0-9-]{4,40}$/.test(orderId)) return { ok: false, error: "Order tidak valid" };
  const result = await portalCall<{ status: string; result: string }>("POST", `/api/portal/billing/orders/${orderId}/check`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/tagihan");
  revalidatePath("/portal/booth");
  return { ok: true, data: result.data };
}
