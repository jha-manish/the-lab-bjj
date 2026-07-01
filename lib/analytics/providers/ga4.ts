import { analyticsConfig } from '../config'
import { gtag } from './gtag'
import type { AnalyticsProvider, Attribution, PageViewPayload, AnalyticsEvent } from '../types'

/**
 * Google Analytics 4 provider (gtag.js).
 *
 * Fires GA4 events directly. The external gtag.js library is loaded by
 * <AnalyticsScripts>; this provider buffers calls through the shared gtag shim
 * until it executes. Page views are sent manually (the config tag is created
 * with send_page_view:false) so SPA route changes are tracked accurately.
 *
 * Disabled automatically when `ga4.viaGtm` is set — in that case the GA4 tag is
 * managed inside GTM and the dataLayer push (gtm provider) feeds it instead,
 * preventing double counting.
 */

/** Attribution fields worth attaching to GA4 events as custom dimensions. */
function attributionParams(attribution: Attribution) {
  return {
    utm_source: attribution.utm_source ?? undefined,
    utm_medium: attribution.utm_medium ?? undefined,
    utm_campaign: attribution.utm_campaign ?? undefined,
    utm_content: attribution.utm_content ?? undefined,
    utm_term: attribution.utm_term ?? undefined,
    qr_id: attribution.qr_id ?? undefined,
    landing_page: attribution.landing_page ?? undefined,
    visitor_type: attribution.visitor_type,
    device_type: attribution.device_type,
  }
}

export function createGa4Provider(): AnalyticsProvider {
  return {
    id: 'ga4',
    isEnabled: () => Boolean(analyticsConfig.ga4.measurementId) && !analyticsConfig.ga4.viaGtm,
    init() {
      gtag('js', new Date())
      gtag('config', analyticsConfig.ga4.measurementId, {
        // We send page_view manually on every (initial + SPA) navigation.
        send_page_view: false,
      })
    },
    trackPageView(payload: PageViewPayload, attribution: Attribution) {
      gtag('event', 'page_view', {
        page_path: payload.page_path,
        page_location: payload.page_location,
        page_title: payload.page_title,
        ...attributionParams(attribution),
        ...payload.params,
      })
    },
    trackEvent(event: AnalyticsEvent, attribution: Attribution) {
      gtag('event', event.name, {
        ...attributionParams(attribution),
        ...event.params,
      })
    },
  }
}
