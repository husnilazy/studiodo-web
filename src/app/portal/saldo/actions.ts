"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

export type WithdrawalInput = { amount: number; bankName: string; accountNumber: string; accountName: string; note: string };

export async function requestWithdrawalAction(input: WithdrawalInput): Promise<ActionResult> {
  const result = await portalCall("POST", "/api/withdrawals", {
    amount: Math.floor(Number(input.amount) || 0),
    bankName: String(input.bankName ?? "").trim().slice(0, 60),
    accountNumber: String(input.accountNumber ?? "").replace(/\s+/g, "").slice(0, 40),
    accountName: String(input.accountName ?? "").trim().slice(0, 100),
    note: String(input.note ?? "").trim().slice(0, 300),
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/saldo");
  return { ok: true, data: undefined };
}

export async function cancelWithdrawalAction(id: string): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Permintaan tidak valid." };
  const result = await portalCall("DELETE", `/api/withdrawals/${id}`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/saldo");
  return { ok: true, data: undefined };
}
