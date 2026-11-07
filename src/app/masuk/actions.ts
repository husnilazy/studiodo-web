"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/portal";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan password wajib diisi" };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
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

  (await cookies()).set(SESSION_COOKIE, body.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/portal");
}

/** Which sign-in options the API offers (Google needs GOOGLE_CLIENT_ID on the API). Null when unreachable, so the page just shows the password form. */
export async function loadGoogleClientId(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/providers`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const b = (await res.json()) as { googleButton?: boolean; googleClientId?: string | null };
    return b.googleButton && b.googleClientId ? b.googleClientId : null;
  } catch {
    return null;
  }
}

/** Google Identity Services hands the browser an ID token; the API verifies it and, if the e-mail is a registered tenant admin, returns the session token. */
export async function googleLoginAction(credential: string): Promise<{ error: string } | undefined> {
  if (!credential) return { error: "Token Google tidak ada." };
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential }), cache: "no-store" });
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi." };
  }
  const body = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!res.ok || !body.token) return { error: body.error ?? "Gagal masuk dengan Google." };
  (await cookies()).set(SESSION_COOKIE, body.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
  redirect("/portal");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/masuk");
}
