"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { CREATOR_COOKIE, CREATOR_MAX_AGE, getCreatorToken } from "@/lib/creator";

export type LoginState = { error: string | null };
export type PasswordState = { error: string | null; ok: boolean };

export async function creatorLoginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan password wajib diisi" };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/creator/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi." };
  }
  const body = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!res.ok || !body.token) return { error: body.error ?? "Gagal masuk. Coba lagi." };

  (await cookies()).set(CREATOR_COOKIE, body.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CREATOR_MAX_AGE,
  });
  redirect("/kreator/portal");
}

export async function creatorLogoutAction() {
  (await cookies()).delete(CREATOR_COOKIE);
  redirect("/kreator/masuk");
}

export async function createDraftAction() {
  const token = await getCreatorToken();
  if (!token) redirect("/kreator/masuk?sesi=habis");
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/creator/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: "Template baru" }),
      cache: "no-store",
    });
  } catch {
    redirect("/kreator/portal?galat=koneksi");
  }
  if (res.status === 401) redirect("/kreator/masuk?sesi=habis");
  const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !body.id) redirect(`/kreator/portal?galat=${encodeURIComponent(body.error ?? "Gagal membuat draft")}`);
  redirect(`/kreator/portal/template/${body.id}`);
}

export async function creatorPasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const token = await getCreatorToken();
  if (!token) redirect("/kreator/masuk?sesi=habis");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword !== String(formData.get("confirm") ?? "")) return { error: "Konfirmasi password tidak sama", ok: false };
  if (newPassword.length < 8) return { error: "Password baru minimal 8 karakter", ok: false };
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/creator/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: "no-store",
    });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi.", ok: false };
  }
  if (res.status === 401) redirect("/kreator/masuk?sesi=habis");
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return { error: body.error ?? "Gagal mengganti password.", ok: false };
  return { error: null, ok: true };
}
