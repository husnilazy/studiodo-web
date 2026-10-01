import { assetUrl, getSite } from "@/lib/content";

type LogoProps = { src?: string | null; darkSrc?: string | null };

/**
 * The built-in wordmark, or the logo images uploaded in Superadmin → Konten Website → Pengaturan umum.
 * With only a light-mode logo it is shown in both themes; with both, the matching one is shown per theme.
 */
export function Logo({ src, darkSrc }: LogoProps) {
  const cls = "h-8 w-auto max-w-[180px] object-contain";
  if (src && darkSrc) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown size, served by the API */}
        <img src={src} alt="STUDIODO" className={`logo-light ${cls}`} />
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown size, served by the API */}
        <img src={darkSrc} alt="" aria-hidden="true" className={`logo-dark ${cls}`} />
      </>
    );
  }
  if (src || darkSrc) {
    // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown size, served by the API
    return <img src={(src || darkSrc) as string} alt="STUDIODO" className={cls} />;
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
  return <Logo src={assetUrl(site.logoUrl)} darkSrc={assetUrl(site.logoDarkUrl)} />;
}
