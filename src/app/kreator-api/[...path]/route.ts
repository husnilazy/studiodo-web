import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { getCreatorToken } from "@/lib/creator";

// Browser → creator API bridge. The editor can't hold the API token (it lives in an httpOnly cookie),
// so its fetches go through here and get the Authorization header added server-side. Only the exact
// endpoints the editor needs are forwarded; everything else is a 404.
const ALLOWED = /^(assets|templates\/[0-9a-f-]{36}(\/(submit|withdraw))?)$/i;

async function forward(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const path = (await ctx.params).path.join("/");
  if (!ALLOWED.test(path)) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  const token = await getCreatorToken();
  if (!token) return NextResponse.json({ error: "Sesi berakhir. Muat ulang halaman dan masuk lagi." }, { status: 401 });

  const hasBody = req.method !== "DELETE";
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/creator/${path}`, {
      method: req.method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Tidak dapat terhubung ke server STUDIODO." }, { status: 502 });
  }
  return new NextResponse(await res.text(), { status: res.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export { forward as POST, forward as PATCH, forward as DELETE };
