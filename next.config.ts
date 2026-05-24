import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Pages serves images statically — disable Next.js image optimisation
    unoptimized: true,
  },
}

export default nextConfig
