import { assetUrl, getSite } from "@/lib/content";

/** The built-in wordmark, or the logo image uploaded in Superadmin → Konten Website → Pengaturan umum. */
export function Logo({ src }: { src?: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown size, served by the API
    return <img src={src} alt="STUDIODO" className="h-8 w-auto max-w-[180px] object-contain" />;
  }
  return (
    <span className="flex items-center gap-2.5">
      <span className="h-[26px] w-[26px] rounded-full bg-gradient-to-br from-accent to-accent-soft" />
      <span className="font-display text-xl font-semibold tracking-[0.02em]">STUDIODO</span>
    </span>
  );
}

/** Logo wired to the CMS. Use this in headers/footers; plain <Logo/> is for places that must not fetch. */
export async function SiteLogo() {
  const site = await getSite();
  return <Logo src={assetUrl(site.logoUrl)} />;
}
