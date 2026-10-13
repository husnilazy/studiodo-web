import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The dashboard uploads a logo / package photo through a server action; the default 1 MB cap is too tight for that.
    serverActions: { bodySizeLimit: "4mb" },
    // Keep visited dashboard pages in the browser's router cache for a short while so going back to a menu you just
    // used is instant. Every save goes through a server action that calls revalidatePath, which drops this cache.
    staleTimes: { dynamic: 30, static: 180 },
  },
};

export default nextConfig;
