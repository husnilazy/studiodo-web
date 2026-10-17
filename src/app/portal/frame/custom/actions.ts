"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

const UUID = /^[0-9a-f-]{36}$/i;
const CUSTOM_FRAME_CATEGORY = "__custom";

export type CustomFrameInput = {
  name: string;
  customerName: string;
  price: number;
  /** PNG data URI, already resized in the browser (green windows punched out). */
  imageDataUrl: string;
  slots: { x: number; y: number; w: number; h: number }[];
  canvasWidth: number;
  canvasHeight: number;
  orientation: "portrait" | "landscape";
};

export async function createCustomFrameAction(input: CustomFrameInput): Promise<ActionResult> {
  const name = String(input.name ?? "").trim().slice(0, 80);
  if (!name) return { ok: false, error: "Nama frame wajib diisi." };
  if (!String(input.imageDataUrl ?? "").startsWith("data:image/png")) return { ok: false, error: "File frame harus PNG." };
  if (!Array.isArray(input.slots) || input.slots.length === 0) return { ok: false, error: "Slot foto belum terdeteksi." };
  const price = Math.max(0, Math.round(Number(input.price) || 0));
  const result = await portalCall("POST", "/api/frames", {
    name, frameImageUrl: input.imageDataUrl, slots: input.slots.slice(0, 12),
    canvasWidth: input.canvasWidth, canvasHeight: input.canvasHeight, orientation: input.orientation,
    category: CUSTOM_FRAME_CATEGORY, style: "Custom frame", outputPreset: "4r",
    price, customerName: String(input.customerName ?? "").trim().slice(0, 100),
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/frame/custom");
  revalidatePath("/portal/kasir");
  return { ok: true, data: undefined };
}

export async function updateCustomFrameAction(id: string, patch: { name: string; customerName: string; price: number; active?: boolean }): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Frame tidak valid." };
  const body: Record<string, unknown> = {
    name: String(patch.name ?? "").trim().slice(0, 80),
    customerName: String(patch.customerName ?? "").trim().slice(0, 100),
    price: Math.max(0, Math.round(Number(patch.price) || 0)),
  };
  if (!body.name) return { ok: false, error: "Nama frame wajib diisi." };
  if (patch.active !== undefined) body.active = Boolean(patch.active);
  const result = await portalCall("PATCH", `/api/frames/${id}`, body);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/frame/custom");
  revalidatePath("/portal/kasir");
  return { ok: true, data: undefined };
}

export async function deleteCustomFrameAction(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Frame tidak valid." };
  const result = await portalCall("DELETE", `/api/frames/${id}`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/frame/custom");
  revalidatePath("/portal/kasir");
  return { ok: true, data: undefined };
}
