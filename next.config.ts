import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
