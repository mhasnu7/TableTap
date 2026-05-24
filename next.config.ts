import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // @ts-ignore
  allowedDevOrigins: ['192.168.31.93'],
};

export default nextConfig;
