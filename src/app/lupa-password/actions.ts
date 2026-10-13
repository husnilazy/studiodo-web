"use server";

import { API_URL } from "@/lib/api";

// Server actions behind the email-link pages. They only talk to the public account-email API; the signed token in the
// email is the credential, so no session is involved.

export type FormState = { error: string | null; ok: boolean };

async function post(path: string, body: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/api/public${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true } : { ok: false, error: data.error ?? `Permintaan gagal (HTTP ${res.status})` };
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server. Coba lagi." };
  }
}

const realm = (v: FormDataEntryValue | null) => (v === "creator" ? "creator" : "tenant");

export async function requestResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Isi alamat email Anda", ok: false };
  const r = await post("/password-reset/request", { jenis: realm(formData.get("jenis")), email });
  return r.ok ? { error: null, ok: true } : { error: r.error, ok: false };
}

export async function confirmResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password !== String(formData.get("confirm") ?? "")) return { error: "Konfirmasi kata sandi tidak sama", ok: false };
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter", ok: false };
  const r = await post("/password-reset/confirm", { jenis: realm(formData.get("jenis")), token: String(formData.get("token") ?? ""), password });
  return r.ok ? { error: null, ok: true } : { error: r.error, ok: false };
}

export async function resendVerificationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Isi alamat email Anda", ok: false };
  const r = await post("/resend-verification", { jenis: realm(formData.get("jenis")), email });
  return r.ok ? { error: null, ok: true } : { error: r.error, ok: false };
}

/** Called by the /verifikasi page on load. */
export async function verifyEmailRequest(jenis: string, id: string, token: string): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/public/verify-email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jenis, id, token }), cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    return res.ok ? { ok: true } : { ok: false, error: data.error ?? "Verifikasi gagal", code: data.code };
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server. Coba muat ulang halaman." };
  }
}

export async function unsubscribeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const r = await post("/email-unsubscribe", { token: String(formData.get("token") ?? "") });
  return r.ok ? { error: null, ok: true } : { error: r.error, ok: false };
}
