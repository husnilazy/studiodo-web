"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { getToken, portalCall, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/portal";

export type PasswordState = { error: string | null; ok: boolean };

export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const token = await getToken();
  if (!token) redirect("/masuk?sesi=habis");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (newPassword !== confirm) return { error: "Konfirmasi password tidak sama", ok: false };
  if (newPassword.length < 8) return { error: "Password baru minimal 8 karakter", ok: false };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/portal/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: "no-store",
    });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi.", ok: false };
  }
  if (res.status === 401) redirect("/masuk?sesi=habis");
  const body = (await res.json().catch(() => ({}))) as { error?: string; token?: string };
  if (!res.ok) return { error: body.error ?? "Gagal mengganti password.", ok: false };
  // The server ended every session that was signed in with the old password (other devices included). This one keeps
  // going: swap in the token it issued for the new password.
  if (body.token) {
    (await cookies()).set(SESSION_COOKIE, body.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
  }
  return { error: null, ok: true };
}

export type EmailPrefsResult = { ok: boolean; error?: string; prefs?: Record<string, boolean> };

export async function saveEmailPrefsAction(patch: Record<string, boolean>): Promise<EmailPrefsResult> {
  const r = await portalCall<{ prefs: Record<string, boolean> }>("PATCH", "/api/portal/email-preferences", patch);
  return r.ok ? { ok: true, prefs: r.data.prefs } : { ok: false, error: r.error };
}
