import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

const nextConfig: NextConfig = {
  images: {
    // Cloudflare serves images statically — disable Next.js image optimisation
    unoptimized: true,
  },
}

export default nextConfig

initOpenNextCloudflareForDev()
