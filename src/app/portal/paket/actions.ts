"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

const UUID = /^[0-9a-f-]{36}$/i;

export type PackageInput = {
  name: string;
  price: number;
  photoCount: number;
  hasGif: boolean;
  hasVideo: boolean;
  hasStopMotion: boolean;
  description: string;
  /** Add-ons (extra prints etc.) sold on top of the package, at the kiosk and at the cashier. */
  extraPrints?: { id: string; name: string; price: number }[];
  sortOrder?: number;
  active?: boolean;
  /** A data: URI from the browser (resized client-side), an existing URL, or null to remove. Undefined = leave as is. */
  thumbnailUrl?: string | null;
};

function clean(input: PackageInput) {
  const name = String(input.name ?? "").trim().slice(0, 80);
  const price = Math.max(0, Math.round(Number(input.price) || 0));
  const photoCount = Math.max(1, Math.min(20, Math.round(Number(input.photoCount) || 1)));
  return {
    name, price, photoCount,
    hasGif: Boolean(input.hasGif), hasVideo: Boolean(input.hasVideo), hasStopMotion: Boolean(input.hasStopMotion),
    description: String(input.description ?? "").trim().slice(0, 300),
    ...(input.extraPrints !== undefined ? {
      extraPrints: input.extraPrints
        .map((x, i) => ({ id: String(x.id || `ao${i + 1}`).slice(0, 40), name: String(x.name ?? "").trim().slice(0, 60), price: Math.max(0, Math.round(Number(x.price) || 0)) }))
        .filter((x) => x.name)
        .slice(0, 12),
    } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: Math.round(Number(input.sortOrder) || 0) } : {}),
    ...(input.active !== undefined ? { active: Boolean(input.active) } : {}),
    ...(input.thumbnailUrl !== undefined ? { thumbnailUrl: input.thumbnailUrl } : {}),
  };
}

export async function savePackageAction(id: string | null, input: PackageInput): Promise<ActionResult> {
  const body = clean(input);
  if (!body.name) return { ok: false, error: "Nama paket wajib diisi." };
  if (id && !UUID.test(id)) return { ok: false, error: "Paket tidak valid." };
  const result = id ? await portalCall("PATCH", `/api/packages/${id}`, body) : await portalCall("POST", "/api/packages", body);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/paket");
  return { ok: true, data: undefined };
}

export async function setPackageActiveAction(id: string, active: boolean): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Paket tidak valid." };
  const result = await portalCall("PATCH", `/api/packages/${id}`, { active: Boolean(active) });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/paket");
  return { ok: true, data: undefined };
}

export async function deletePackageAction(id: string): Promise<ActionResult<{ softDeleted: boolean }>> {
  if (!UUID.test(id)) return { ok: false, error: "Paket tidak valid." };
  const result = await portalCall<{ softDeleted?: boolean }>("DELETE", `/api/packages/${id}`);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/paket");
  return { ok: true, data: { softDeleted: Boolean(result.data?.softDeleted) } };
}
