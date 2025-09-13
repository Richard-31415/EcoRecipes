import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        pathname: '**',
      }
    ],
  },
};

export default nextConfig;
