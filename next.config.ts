import path from "path";
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
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "stripe"],
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "edge") {
      const stub = path.join(process.cwd(), "src/instrumentation.edge.ts");
      config.resolve ??= {};
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/instrumentation.node": stub,
        [path.join(process.cwd(), "src/instrumentation.node.ts")]: stub,
        [path.join(process.cwd(), "src/instrumentation.node")]: stub,
      };
    }
    return config;
  },
};

export default nextConfig;
