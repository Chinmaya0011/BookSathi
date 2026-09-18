/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react', 'framer-motion', 'recharts', 'animejs'],
  images: {
    domains: ['images.unsplash.com', 'ui-avatars.com', 'api.dicebear.com'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000',
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
    APP_DOMAIN: process.env.APP_DOMAIN || 'localhost:3000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
