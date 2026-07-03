import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Onboarding submits an optional logo + reference screenshots as compressed
    // data URLs through the create-project action, so allow a larger action body.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
