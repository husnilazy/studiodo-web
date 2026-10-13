"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { getToken, portalCall } from "@/lib/portal";

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

// --- Reviews & reports (called from the public template page by a signed-in tenant) -----------------------

export type FeedbackResult = { ok: boolean; error?: string };

async function feedbackCall(method: "PUT" | "DELETE" | "POST", id: string, path: string, body?: unknown): Promise<FeedbackResult> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Template tidak valid" };
  const r = await portalCall(method, `/api/portal/marketplace/${id}/${path}`, body);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/template/${id}`);
  return { ok: true };
}

export async function saveReviewAction(id: string, rating: number, comment: string): Promise<FeedbackResult> {
  return feedbackCall("PUT", id, "review", { rating, comment });
}
export async function deleteReviewAction(id: string): Promise<FeedbackResult> {
  return feedbackCall("DELETE", id, "review");
}
export async function reportTemplateAction(id: string, reason: string, detail: string): Promise<FeedbackResult> {
  return feedbackCall("POST", id, "report", { reason, detail });
}
