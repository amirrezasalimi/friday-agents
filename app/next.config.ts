import { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/search/:path*',
        destination: '/api/search',
      },
      {
        source: '/api/chat/:path*',
        destination: '/api/chat',
      },
    ];
  },
};

export default nextConfig