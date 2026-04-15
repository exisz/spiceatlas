import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ISR: 600+ spice pages > 500 threshold, must use ISR
  async redirects() {
    return [
      {
        source: '/pairing',
        destination: '/pairings',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
