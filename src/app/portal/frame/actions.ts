"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

const UUID = /^[0-9a-f-]{36}$/i;

export async function setFrameActiveAction(id: string, active: boolean): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Frame tidak valid." };
  const result = await portalCall("PATCH", `/api/frames/${id}`, { active: Boolean(active) });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/frame");
  return { ok: true, data: undefined };
}

export async function renameFrameAction(id: string, name: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Frame tidak valid." };
  const clean = String(name ?? "").trim().slice(0, 80);
  if (!clean) return { ok: false, error: "Nama frame wajib diisi." };
  const result = await portalCall("PATCH", `/api/frames/${id}`, { name: clean });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/frame");
  return { ok: true, data: undefined };
}

export async function deleteFrameAction(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Frame tidak valid." };
  const result = await portalCall("DELETE", `/api/frames/${id}`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/frame");
  return { ok: true, data: undefined };
}
