"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult, VoucherRow } from "@/lib/portalTypes";

const UUID = /^[0-9a-f-]{36}$/i;

export type VoucherInput = {
  code?: string;
  discountType: "percent" | "fixed" | "free";
  discountValue: number;
  maxUses: number | null;
  expiresAt: string | null; // YYYY-MM-DD, end of that day (WIB)
};

function body(input: VoucherInput) {
  const discountType = input.discountType === "fixed" || input.discountType === "free" ? input.discountType : "percent";
  const value = Math.max(0, Number(input.discountValue) || 0);
  const maxUses = input.maxUses === null || !Number.isFinite(Number(input.maxUses)) || Number(input.maxUses) <= 0 ? null : Math.floor(Number(input.maxUses));
  const expiresAt = input.expiresAt && /^\d{4}-\d{2}-\d{2}$/.test(input.expiresAt) ? new Date(`${input.expiresAt}T23:59:59+07:00`).toISOString() : null;
  return { discountType, discountValue: discountType === "free" ? 0 : discountType === "percent" ? Math.min(100, value) : value, maxUses, expiresAt };
}

export async function createVoucherAction(input: VoucherInput): Promise<ActionResult> {
  const code = String(input.code ?? "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40);
  if (!code) return { ok: false, error: "Kode voucher wajib diisi (huruf, angka, - atau _)." };
  const result = await portalCall("POST", "/api/vouchers", { code, ...body(input) });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/voucher");
  return { ok: true, data: undefined };
}

export async function bulkVouchersAction(input: VoucherInput & { count: number; codePrefix: string }): Promise<ActionResult<string[]>> {
  const count = Math.floor(Number(input.count) || 0);
  if (count < 1 || count > 200) return { ok: false, error: "Jumlah voucher harus antara 1 dan 200." };
  const result = await portalCall<{ codes: { code: string }[] }>("POST", "/api/vouchers/bulk", { ...body(input), count, codePrefix: String(input.codePrefix ?? "PROMO").slice(0, 12) });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/voucher");
  return { ok: true, data: result.data.codes.map((c) => c.code) };
}

export async function setVoucherActiveAction(id: string, active: boolean): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Voucher tidak valid." };
  const result = await portalCall("PATCH", `/api/vouchers/${id}`, { active: Boolean(active) });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/voucher");
  return { ok: true, data: undefined };
}

export async function deleteVoucherAction(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Voucher tidak valid." };
  const result = await portalCall("DELETE", `/api/vouchers/${id}`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/voucher");
  return { ok: true, data: undefined };
}

export type VoucherReport = { summary: { totalRedemptions: number; totalDiscountGiven: number; totalRevenueAfterDiscount: number } };
export type VoucherList = VoucherRow[];
