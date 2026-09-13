import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/game": ["./data/**/*"],
    "/api/game/questions": ["./data/**/*"],
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
