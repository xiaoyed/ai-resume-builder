import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    // @ts-ignore
    config.resolve.alias.encoding = false;
    return config;
  },
  experimental: {
    // @ts-ignore
    turbo: {
      resolveAlias: {
        canvas: false,
        encoding: false,
      },
    },
  },
};

export default nextConfig;
