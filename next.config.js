/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. Good to consider Jarren, okay?
    ignoreBuildErrors: true,
  },
  // Enable Next.js 15 middleware features
  experimental: {
    serverComponentsExternalPackages: ['next-auth'],
    trustHostHeader: true,
  },
  // Force cookie security with secure settings
  poweredByHeader: false,
}

module.exports = nextConfig 