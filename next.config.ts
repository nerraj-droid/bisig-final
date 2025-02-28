/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true // Temporarily ignore TypeScript errors during build
  }
}

export default config
