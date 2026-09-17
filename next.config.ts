import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Fewer pages rendered at once during `next build` → fewer simultaneous
    // Postgres connections opened against Aiven's connection limit.
    staticGenerationMaxConcurrency: 3,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
