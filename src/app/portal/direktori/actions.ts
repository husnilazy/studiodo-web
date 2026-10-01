"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/portal";

export type DirectoryState = { error: string | null; ok: boolean };

export async function saveDirectoryAction(_prev: DirectoryState, formData: FormData): Promise<DirectoryState> {
  const token = await getToken();
  if (!token) redirect("/masuk?sesi=habis");
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/portal/directory`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        listed: formData.get("listed") === "on",
        showWhatsapp: formData.get("showWhatsapp") === "on",
        description: get("description"),
        city: get("city"),
        instagram: get("instagram"),
        website: get("website"),
      }),
      cache: "no-store",
    });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi.", ok: false };
  }
  if (res.status === 401) redirect("/masuk?sesi=habis");
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return { error: body.error ?? "Gagal menyimpan.", ok: false };
  revalidatePath("/portal/direktori");
  return { error: null, ok: true };
}
