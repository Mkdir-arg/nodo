/** @type {import('next').NextConfig} */
const API_INTERNAL = process.env.API_URL_INTERNAL || "http://backend:8000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_INTERNAL.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
