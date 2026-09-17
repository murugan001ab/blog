import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Fewer pages rendered at once during `next build` → fewer simultaneous
    // Postgres connections opened against Aiven's connection limit.
    staticGenerationMaxConcurrency: 3,
  },
};

export default nextConfig;
