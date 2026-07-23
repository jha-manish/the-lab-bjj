'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

export const META_PIXEL_ID = '1984511812190085'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: (...args: unknown[]) => void
  }
}

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

export function trackMetaLead({
  bookingId,
  className,
}: {
  bookingId: string
  className: string
}) {
  window.fbq?.(
    'track',
    'Lead',
    {
      content_name: className,
      content_category: 'Free Trial',
      currency: 'CAD',
      value: 0,
    },
    { eventID: bookingId },
  )
}

export default function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${META_PIXEL_ID}');
        fbq('track', 'PageView');
      `}</Script>

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>

      <MetaRouteTracker />
    </>
  )
}
