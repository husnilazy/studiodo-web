import { NextResponse } from "next/server";
import { fetchLatestRelease } from "@/lib/site";

// Stable download address (studiodo.id/unduh/windows) that sends the browser straight to the newest installer on
// GitHub, so the page never links to a file name that can change or go stale in a cache. ?tipe=portable gives the
// single-file portable build. Falls back to the /unduh page if there is no release to download.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const release = await fetchLatestRelease(60);
  const target = url.searchParams.get("tipe") === "portable" ? release?.portableUrl : release?.installerUrl;
  return NextResponse.redirect(target ?? new URL("/unduh", url), 302);
}
