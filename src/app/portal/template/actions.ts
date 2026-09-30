"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/portal";

export type InstallState = { error: string | null; ok: boolean };

export async function installTemplateAction(_prev: InstallState, formData: FormData): Promise<InstallState> {
  const token = await getToken();
  if (!token) redirect("/masuk?sesi=habis");
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Template tidak valid", ok: false };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/portal/marketplace/${id}/install`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi.", ok: false };
  }
  if (res.status === 401) redirect("/masuk?sesi=habis");
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 409) { revalidatePath("/portal/template"); return { error: null, ok: true }; } // already installed = success for the user
  if (!res.ok) return { error: body.error ?? "Gagal memasang template.", ok: false };
  revalidatePath("/portal/template");
  return { error: null, ok: true };
}
