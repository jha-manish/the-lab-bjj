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

  // /pricing and /programs were retired in favour of /memberships. Redirect
  // rather than 404 so old backlinks and any indexed Google results still land.
  async redirects() {
    return [
      { source: '/pricing', destination: '/memberships', permanent: true },
      { source: '/programs', destination: '/memberships', permanent: true },
    ]
  },
}

export default nextConfig
