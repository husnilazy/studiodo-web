import type { NextConfig } from "next";

// Baseline security headers for every page. The site is never meant to be embedded in another site (frame-ancestors 'none'), has no
// plugins (object-src 'none'), and only posts forms to itself. A full script/style CSP is deliberately not set here: the site uses
// inline theme/analytics snippets, and a wrong script-src would break pages silently.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    // The dashboard uploads a logo / package photo through a server action; the default 1 MB cap is too tight for that.
    serverActions: { bodySizeLimit: "4mb" },
    // Keep visited dashboard pages in the browser's router cache for a short while so going back to a menu you just
    // used is instant. Every save goes through a server action that calls revalidatePath, which drops this cache.
    staleTimes: { dynamic: 30, static: 180 },
  },
};

export default nextConfig;
