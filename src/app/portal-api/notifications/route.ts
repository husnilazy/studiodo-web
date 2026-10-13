import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/portal";

// Browser → dashboard bell. The session token lives in an httpOnly cookie, so the page's scripts can't call the API
// directly; this handler forwards the request with the token. GET lists, POST marks read ({ids} or {all:true}).
export const dynamic = "force-dynamic";

async function forward(path: string, init?: RequestInit) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "Sesi habis" }, { status: 401 });
  try {
    const res = await fetch(`${API_URL}/api/portal/notifications${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { "Content-Type": "application/json" } : {}) },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server tidak terjangkau" }, { status: 502 });
  }
}

export async function GET(request: Request) {
  const limit = new URL(request.url).searchParams.get("limit");
  return forward(limit ? `?limit=${encodeURIComponent(limit)}` : "");
}

export async function POST(request: Request) {
  // Only JSON bodies: a cross-site <form> can't send this content type, which is the CSRF guard for a cookie-authenticated POST.
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Bad request" }, { status: 415 });
  const body = await request.text();
  return forward("/read", { method: "POST", body });
}
