import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Remotion's renderer/bundler ship native binaries and non-JS assets
  // (esbuild, the platform compositor package) that Turbopack's bundler
  // chokes on if it tries to trace them — run them as real Node requires
  // instead of bundling, same as any other native-binding server dependency.
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/compositor-linux-x64-gnu",
    "@remotion/media-parser",
    "esbuild",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pagedone.io',
        pathname: '/**', // Allows all image paths from this host
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**', // Allows all image paths from this host
      },
    ],
  },
};

export default nextConfig;
