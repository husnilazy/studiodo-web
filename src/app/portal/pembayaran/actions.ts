"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

export type PaymentInput = {
  paymentProvider?: "xendit" | "doku";
  secretKey?: string;
  webhookToken?: string;
  dokuClientId?: string;
  dokuSecretKey?: string;
  dokuEnvironment?: "sandbox" | "production";
  qrisEnabled?: boolean;
  cashPaymentEnabled?: boolean;
  clearXendit?: boolean;
  clearDoku?: boolean;
};

const short = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

/** Saves the tenant's own kiosk payment settings. Secrets are write-only: the API never sends them back. */
export async function savePaymentAction(input: PaymentInput): Promise<ActionResult> {
  const body: PaymentInput = {};
  if (input.paymentProvider === "xendit" || input.paymentProvider === "doku") body.paymentProvider = input.paymentProvider;
  const secretKey = short(input.secretKey, 300);
  const webhookToken = short(input.webhookToken, 300);
  const dokuClientId = short(input.dokuClientId, 100);
  const dokuSecretKey = short(input.dokuSecretKey, 300);
  if (secretKey) body.secretKey = secretKey;
  if (webhookToken) body.webhookToken = webhookToken;
  if (dokuClientId) body.dokuClientId = dokuClientId;
  if (dokuSecretKey) body.dokuSecretKey = dokuSecretKey;
  if (input.dokuEnvironment === "sandbox" || input.dokuEnvironment === "production") body.dokuEnvironment = input.dokuEnvironment;
  if (typeof input.qrisEnabled === "boolean") body.qrisEnabled = input.qrisEnabled;
  if (typeof input.cashPaymentEnabled === "boolean") body.cashPaymentEnabled = input.cashPaymentEnabled;
  if (input.clearXendit === true) body.clearXendit = true;
  if (input.clearDoku === true) body.clearDoku = true;

  const result = await portalCall("PATCH", "/api/config/payment", body);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/pembayaran");
  return { ok: true, data: undefined };
}

export async function testPaymentAction(provider: "xendit" | "doku"): Promise<ActionResult<{ ok: boolean; message: string }>> {
  const result = await portalCall<{ ok: boolean; message: string }>("POST", "/api/config/payment/test", { provider });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}
