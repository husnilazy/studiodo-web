// Site-wide constants. Override the URLs per environment in .env.local.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
export const SITE_NAME = "STUDIODO";

export const GITHUB_REPO = { owner: "husnilazy", repo: "studiodo" };

// Where tenants log in today: the admin area of the app (Fase B replaces this with a web portal).
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "";

export type ReleaseInfo = {
  version: string;
  installerUrl: string | null;
  installerSize: number | null;
  portableUrl: string | null;
  portableSize: number | null;
  publishedAt: string | null;
  notes: string;
  releasesUrl: string;
};

type GithubAsset = { name: string; size?: number; browser_download_url: string };

/** Latest published GitHub Release, or null when unreachable / repo private / none yet. */
export async function fetchLatestRelease(revalidateSeconds = 600): Promise<ReleaseInfo | null> {
  const { owner, repo } = GITHUB_REPO;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { tag_name?: string; html_url?: string; body?: string | null; published_at?: string | null; assets?: GithubAsset[] };
    const exes = (data.assets ?? []).filter((a) => /\.exe$/i.test(a.name));
    // GitHub rewrites spaces in uploaded names to "." or "-", so match on "setup" rather than an exact name.
    const installer = exes.find((a) => /setup/i.test(a.name)) ?? exes[0];
    const portable = exes.find((a) => a !== installer && !/setup/i.test(a.name));
    return {
      version: (data.tag_name ?? "").replace(/^v/, ""),
      installerUrl: installer?.browser_download_url ?? null,
      installerSize: installer?.size ?? null,
      portableUrl: portable?.browser_download_url ?? null,
      portableSize: portable?.size ?? null,
      publishedAt: data.published_at ?? null,
      notes: (data.body ?? "").trim().slice(0, 600),
      releasesUrl: data.html_url ?? `https://github.com/${owner}/${repo}/releases`,
    };
  } catch {
    return null;
  }
}
