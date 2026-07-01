import { analyticsConfig } from '../config'
import { AnalyticsEvents } from '../events'
import { gtag } from './gtag'
import type { AnalyticsProvider, AnalyticsEvent } from '../types'

/**
 * Google Ads conversion tracking provider (gtag.js).
 *
 * Fires Google Ads conversions only for the two events that matter to the
 * business, using the gtag account loaded by <AnalyticsScripts>:
 *
 *   generate_lead -> PRIMARY conversion  (free-trial signup)
 *   purchase      -> SECONDARY conversion (online membership / merch sale)
 *
 * Conversion labels come from the Google Ads UI and are supplied via env vars
 * (see config.ts). If a label is missing the conversion is skipped (and logged
 * in debug mode) rather than firing an invalid send_to.
 *
 * Disabled automatically when `googleAds.viaGtm` is set, so conversions managed
 * inside GTM are not double-counted.
 *
 * ── FUTURE: OFFLINE CONVERSION TRACKING ──────────────────────────────────────
 * Most memberships are sold IN PERSON via Square after a free trial. To close
 * the loop on those offline sales, capture the GCLID at signup
 * (attribution.gclid is already collected) and store it against the lead in
 * Square. When the in-person sale completes, upload an offline conversion to
 * Google Ads (Enhanced Conversions for Leads / Offline Conversion Import) using
 * that GCLID. That import happens server-side and does not run through this
 * client provider — see lib/analytics/README.md.
 */
export function createGoogleAdsProvider(): AnalyticsProvider {
  const { conversionId, trialConversionLabel, purchaseConversionLabel } = analyticsConfig.googleAds

  function sendConversion(label: string | null, event: AnalyticsEvent): void {
    if (!label) {
      if (analyticsConfig.debug) {
        console.warn(`[analytics] Google Ads conversion label missing for "${event.name}" — skipped.`)
      }
      return
    }
    gtag('event', 'conversion', {
      send_to: `${conversionId}/${label}`,
      value: typeof event.params.value === 'number' ? event.params.value : undefined,
      currency: typeof event.params.currency === 'string' ? event.params.currency : undefined,
      transaction_id: typeof event.params.transaction_id === 'string' ? event.params.transaction_id : undefined,
    })
  }

  return {
    id: 'google_ads',
    isEnabled: () => Boolean(conversionId) && !analyticsConfig.googleAds.viaGtm,
    init() {
      // gtag('js') is idempotent — safe even when the GA4 provider also calls it.
      gtag('js', new Date())
      gtag('config', conversionId)
    },
    trackPageView() {
      // Google Ads has no page-view concept; conversions only.
    },
    trackEvent(event: AnalyticsEvent) {
      if (event.name === AnalyticsEvents.TRIAL_SUBMITTED) {
        sendConversion(trialConversionLabel, event) // PRIMARY
      } else if (event.name === AnalyticsEvents.PURCHASE) {
        sendConversion(purchaseConversionLabel, event) // SECONDARY
      }
    },
  }
}
