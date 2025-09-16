/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  compiler: {
    removeConsole: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
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
