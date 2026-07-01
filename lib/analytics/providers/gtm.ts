import { analyticsConfig } from '../config'
import type { AnalyticsProvider, Attribution, PageViewPayload, AnalyticsEvent } from '../types'

/**
 * Google Tag Manager provider.
 *
 * Pushes every event verbatim onto `window.dataLayer` so marketing tags can be
 * created, edited, and routed inside the GTM UI WITHOUT touching application
 * code. The GTM container script itself is loaded by <AnalyticsScripts>.
 *
 * Each push uses a clean, predictable shape:
 *   { event, event_type, ...params, attribution: {...} }
 * which makes it trivial to build GTM triggers ("event equals generate_lead")
 * and variables ("Data Layer Variable -> attribution.utm_campaign").
 */
function push(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

export function createGtmProvider(): AnalyticsProvider {
  return {
    id: 'gtm',
    isEnabled: () => Boolean(analyticsConfig.gtmId),
    init() {
      // The container snippet (in <AnalyticsScripts>) creates dataLayer and
      // pushes gtm.js. Nothing else to do here.
    },
    trackPageView(payload: PageViewPayload, attribution: Attribution) {
      push({
        event: 'page_view',
        event_type: 'page_view',
        ...payload,
        attribution,
      })
    },
    trackEvent(event: AnalyticsEvent, attribution: Attribution) {
      push({
        event: event.name,
        event_type: event.type,
        ...event.params,
        attribution,
      })
    },
  }
}
