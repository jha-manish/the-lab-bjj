/**
 * Shared gtag.js transport shim used by both the GA4 and Google Ads providers.
 *
 * Defines the standard gtag stub if it does not yet exist, so queued calls are
 * buffered on window.dataLayer until the external gtag.js library (loaded by
 * <AnalyticsScripts>) executes and drains them. This makes provider calls safe
 * regardless of script load order.
 */
export function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtagStub() {
      // gtag.js expects the raw `arguments` object on the queue.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments as unknown as Record<string, unknown>)
    }
  }
  window.gtag!(...args)
}
