import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dxi4wb638ujep.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
