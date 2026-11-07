"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/portal";

export type InstantSignupState = { error: string | null };

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

/**
 * Instant sign-up: creates the tenant account + trial key through the API, signs the new owner in, and sends them on, either to the
 * dashboard (trial) or straight to the payment tab with the chosen plan and period (paid). Only used when a STUDIODO admin switched the
 * platform to "daftar langsung"; the API refuses it otherwise (code signup_closed), and the page then shows the review form again.
 */
export async function instantSignupAction(_prev: InstantSignupState, formData: FormData): Promise<InstantSignupState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const wantsToPay = text(formData, "mulai") === "bayar";
  const plan = text(formData, "plan").slice(0, 60);
  const periode = text(formData, "periode") === "tahunan" ? "tahunan" : "bulanan";
  if (password !== String(formData.get("password2") ?? "")) return { error: "Konfirmasi password tidak sama." };

  let signup: Response;
  try {
    signup = await fetch(`${API_URL}/api/public/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: text(formData, "businessName"), ownerName: text(formData, "ownerName"), email, password,
        whatsapp: text(formData, "whatsapp"), city: text(formData, "city"), businessType: text(formData, "businessType"),
        plan, wantsToPay, company: text(formData, "company"),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi." };
  }
  const result = (await signup.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!signup.ok) {
    if (result.code === "signup_closed") return { error: "Pendaftaran langsung sedang tidak dibuka. Muat ulang halaman ini untuk mengirim pengajuan." };
    return { error: result.error ?? "Pendaftaran gagal. Coba lagi." };
  }

  // Sign the new owner in right away (same cookie as the normal login).
  let login: Response;
  try {
    login = await fetch(`${API_URL}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" });
  } catch {
    redirect("/masuk");
  }
  const body = (await login.json().catch(() => ({}))) as { token?: string };
  if (!login.ok || !body.token) redirect("/masuk"); // account exists; they can sign in by hand
  (await cookies()).set(SESSION_COOKIE, body.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });

  if (wantsToPay) redirect(`/portal/booth?bayar=1&periode=${periode}${/^[a-z0-9-]{1,60}$/i.test(plan) ? `&plan=${encodeURIComponent(plan)}` : ""}`);
  redirect("/portal?baru=1");
}
