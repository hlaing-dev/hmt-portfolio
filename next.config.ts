import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets a local production preview build next to the dev server without clobbering it.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
