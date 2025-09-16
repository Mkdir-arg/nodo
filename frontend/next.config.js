/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    turbo: {},
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;

// Opcional: rewrites para usar /backend si el front corre en Docker
// module.exports = {
//   ...nextConfig,
//   async rewrites() {
//     const base = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "");
//     if (!base) return [];
//     return [
//       {
//         source: "/backend/:path*",
//         destination: `${base}/:path*`,
//       },
//     ];
//   },
// };
