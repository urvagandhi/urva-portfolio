/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Target modern browsers to reduce polyfills and bundle size
  compiler: {
    // Remove console logs in production for cleaner output
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize images with modern formats
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
