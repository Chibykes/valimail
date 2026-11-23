import type { NextConfig } from "next";

const skipTypecheck = process.env.SKIP_TYPECHECK === "1";

const nextConfig: NextConfig = {
  // 1 vCPU / 1GB VPS: standalone runtime, single webpack worker, lower peak RAM.
  output: "standalone",
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: skipTypecheck,
  },
  experimental: {
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
