/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    turbo: {},
    optimizePackageImports: ['lucide-react'],
  },
  // Deshabilitar cache en desarrollo
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Headers para evitar cache del navegador
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
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
