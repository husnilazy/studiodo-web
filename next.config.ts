import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The dashboard uploads a logo / package photo through a server action; the default 1 MB cap is too tight for that.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
