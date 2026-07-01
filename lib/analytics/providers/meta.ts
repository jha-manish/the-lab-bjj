import { analyticsConfig } from '../config'
import { AnalyticsEvents } from '../events'
import type { AnalyticsProvider, Attribution, PageViewPayload, AnalyticsEvent } from '../types'

/**
 * Meta (Facebook) Pixel provider.
 *
 * Installed and configured for future advertising. Sends standard Meta events
 * for the moments Meta's conversion optimisation cares about:
 *
 *   page_view      -> PageView      (standard)
 *   generate_lead  -> Lead          (standard)  ← free-trial signup
 *   purchase       -> Purchase      (standard, with value + currency)
 *   begin_checkout -> InitiateCheckout (standard)
 *   view_item_list -> ViewContent   (standard)
 *
 * Funnel/error events are forwarded as custom events so they are available for
 * future custom audiences. High-frequency engagement events (scroll, time on
 * page, nav clicks) are intentionally NOT forwarded to keep the pixel signal
 * clean. The pixel base code is loaded by <AnalyticsScripts>.
 *
 * Structured so Meta conversion optimisation can be enabled later without code
 * changes: switch the Lead/Purchase events to Meta's Conversions API (CAPI) by
 * adding a server route and an `eventID` for deduplication (see README).
 */

const STANDARD_EVENT_MAP: Partial<Record<string, string>> = {
  [AnalyticsEvents.TRIAL_SUBMITTED]: 'Lead',
  [AnalyticsEvents.PURCHASE]: 'Purchase',
  [AnalyticsEvents.BEGIN_CHECKOUT]: 'InitiateCheckout',
  [AnalyticsEvents.PRICING_VIEW]: 'ViewContent',
  [AnalyticsEvents.TRIAL_PAGE_VIEW]: 'ViewContent',
}

/** Engagement noise we deliberately keep out of the pixel. */
const SKIP_EVENTS = new Set<string>([
  AnalyticsEvents.SCROLL_DEPTH,
  AnalyticsEvents.TIME_ON_PAGE,
  AnalyticsEvents.SESSION_ENGAGED,
  AnalyticsEvents.NAV_CLICK,
  AnalyticsEvents.EXTERNAL_LINK_CLICK,
])

/**
 * Standard Meta Pixel stub. Buffers calls on fbq.queue until fbevents.js (loaded
 * by <AnalyticsScripts>) executes and drains them, so calls are safe regardless
 * of script load order.
 */
function fbq(...args: unknown[]): void {
  if (typeof window === 'undefined') return
  if (typeof window.fbq !== 'function') {
    const stub = function fbqStub(...stubArgs: unknown[]) {
      if (stub.callMethod) stub.callMethod(...stubArgs)
      else stub.queue!.push(stubArgs)
    } as NonNullable<Window['fbq']>
    stub.queue = []
    window.fbq = stub
    window._fbq = window._fbq || stub
  }
  window.fbq!(...args)
}

function metaParams(event: AnalyticsEvent) {
  const params: Record<string, unknown> = {}
  if (typeof event.params.value === 'number') params.value = event.params.value
  if (typeof event.params.currency === 'string') params.currency = event.params.currency
  if (typeof event.params.transaction_id === 'string') params.order_id = event.params.transaction_id
  if (typeof event.params.item_name === 'string') params.content_name = event.params.item_name
  if (typeof event.params.membership_plan === 'string') params.content_name = event.params.membership_plan
  return params
}

export function createMetaProvider(): AnalyticsProvider {
  return {
    id: 'meta',
    isEnabled: () => Boolean(analyticsConfig.meta.pixelId) && !analyticsConfig.meta.viaGtm,
    init() {
      // fbevents.js itself is loaded by <AnalyticsScripts>; the stub buffers
      // this call until it executes. We deliberately DO NOT fire PageView here:
      // the initial PageView (and every SPA route change) comes through
      // trackPageView below, so the pixel is not double-counted on load.
      fbq('init', analyticsConfig.meta.pixelId)
    },
    trackPageView(_payload: PageViewPayload, _attribution: Attribution) {
      void _payload
      void _attribution
      fbq('track', 'PageView')
    },
    trackEvent(event: AnalyticsEvent, _attribution: Attribution) {
      void _attribution
      if (SKIP_EVENTS.has(event.name)) return

      const standard = STANDARD_EVENT_MAP[event.name]
      if (standard) {
        fbq('track', standard, metaParams(event))
        return
      }
      // Everything else (trial funnel steps, errors, CTA clicks) is a custom event.
      fbq('trackCustom', event.name, metaParams(event))
    },
  }
}
