/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Build optimizations
  swcMinify: true,

  // Skip type checking during build (faster, rely on IDE)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Skip ESLint during build (run separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize images
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static export compatibility
  },

  // Experimental features for faster builds
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@react-three/fiber',
      '@react-three/drei',
      'mapbox-gl',
    ],
  },
}

module.exports = nextConfig
