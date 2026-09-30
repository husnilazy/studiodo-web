"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/portal";

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
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return { error: body.error ?? "Gagal mengganti password.", ok: false };
  return { error: null, ok: true };
}
