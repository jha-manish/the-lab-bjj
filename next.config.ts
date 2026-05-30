import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Pages serves images statically — disable Next.js image optimisation
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.squarecdn.com' },
      { protocol: 'https', hostname: '**.squareup.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
}

export default nextConfig
