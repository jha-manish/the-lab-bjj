'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function MetaRouteTracker() {
  const pathname = usePathname()
  const isFirstPageView = useRef(true)

  useEffect(() => {
    // The base snippet records the initial page view. Only record subsequent
    // client-side route changes here.
    if (isFirstPageView.current) {
      isFirstPageView.current = false
      return
    }

    window.fbq?.('track', 'PageView')
  }, [pathname])

  return null
}

export default function MetaPixel() {
  return <MetaRouteTracker />
}
