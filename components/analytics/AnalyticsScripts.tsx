import Script from 'next/script'
import { analyticsConfig } from '@/lib/analytics'

/**
 * Loads the third-party marketing libraries (transport only).
 *
 * This component is the SINGLE place vendor <script> tags live. It does NOT
 * decide what to track or configure — that is owned by the analytics providers
 * (lib/analytics/providers/*), which buffer their config/events through stubs
 * until these libraries execute. Tracking always flows through lib/analytics.
 *
 * Each library is loaded only when its platform is configured:
 *   - GTM container        when NEXT_PUBLIC_GTM_ID is set.
 *   - gtag.js (GA4 + Ads)  when GA4 or Google Ads is enabled directly.
 *   - fbevents.js (Meta)   when the Meta Pixel is enabled directly.
 */
export default function AnalyticsScripts() {
  const { gtmId, ga4, meta, googleAds } = analyticsConfig

  const ga4Direct = Boolean(ga4.measurementId) && !ga4.viaGtm
  const adsDirect = Boolean(googleAds.conversionId) && !googleAds.viaGtm
  const metaDirect = Boolean(meta.pixelId) && !meta.viaGtm

  // gtag.js is shared by GA4 and Google Ads. Load it once under any available
  // ID; each provider issues its own gtag('config', …) at init time.
  const gtagId = ga4Direct ? ga4.measurementId : adsDirect ? googleAds.conversionId : null

  return (
    <>
      {/* Google Tag Manager container */}
      {gtmId && (
        <Script id="gtm-loader" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}</Script>
      )}

      {/* Google gtag.js (GA4 + Google Ads). Config is issued by the providers. */}
      {gtagId && (
        <Script
          id="gtag-loader"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
          strategy="afterInteractive"
        />
      )}

      {/* Meta Pixel loader (fbevents.js). init + PageView are issued by the provider. */}
      {metaDirect && (
        <Script
          id="meta-pixel-loader"
          src="https://connect.facebook.net/en_US/fbevents.js"
          strategy="afterInteractive"
        />
      )}
    </>
  )
}

/**
 * <noscript> fallbacks for GTM and the Meta Pixel. Rendered separately so they
 * can be placed at the top of <body>, per each vendor's install instructions.
 */
export function AnalyticsNoScript() {
  const { gtmId, meta } = analyticsConfig
  const metaDirect = Boolean(meta.pixelId) && !meta.viaGtm

  return (
    <>
      {gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="gtm"
          />
        </noscript>
      )}
      {metaDirect && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://www.facebook.com/tr?id=${meta.pixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
      )}
    </>
  )
}
