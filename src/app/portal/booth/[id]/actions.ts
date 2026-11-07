"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

const UUID = /^[0-9a-f-]{36}$/i;

export type BoothSettingsInput = {
  label: string;
  overrides: Record<string, string>;
  packageOverrides: Record<string, { price?: number; active?: boolean }>;
};

/** Saves one booth's own name, package prices / visibility and look. The API validates every value again and scopes it to this tenant. */
export async function saveBoothSettingsAction(id: string, input: BoothSettingsInput): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Booth tidak valid." };
  const result = await portalCall("PUT", `/api/booths/${id}`, {
    label: String(input.label ?? "").trim().slice(0, 60) || undefined,
    overrides: input.overrides ?? {},
    packageOverrides: input.packageOverrides ?? {},
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/booth");
  revalidatePath(`/portal/booth/${id}`);
  return { ok: true, data: undefined };
}
