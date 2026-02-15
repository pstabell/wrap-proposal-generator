import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: false // Disable Turbopack to fix WASM binding issues
  }
};

export default nextConfig;
