// Site-wide constants. Override the URLs per environment in .env.local.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
export const SITE_NAME = "STUDIODO";

export const GITHUB_REPO = { owner: "husnilazy", repo: "studiodo" };

// Where tenants log in today: the admin area of the app (Fase B replaces this with a web portal).
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "";

export type ReleaseInfo = { version: string; installerUrl: string | null; releasesUrl: string };

/** Latest published GitHub Release, or null when unreachable / repo private / none yet. */
export async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  const { owner, repo } = GITHUB_REPO;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { tag_name?: string; html_url?: string; assets?: { name: string; browser_download_url: string }[] };
    const installer = data.assets?.find((a) => /setup.*\.exe$/i.test(a.name)) ?? data.assets?.find((a) => /\.exe$/i.test(a.name));
    return {
      version: (data.tag_name ?? "").replace(/^v/, ""),
      installerUrl: installer?.browser_download_url ?? null,
      releasesUrl: data.html_url ?? `https://github.com/${owner}/${repo}/releases`,
    };
  } catch {
    return null;
  }
}
