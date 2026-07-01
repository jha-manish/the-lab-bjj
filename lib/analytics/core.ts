import { analyticsConfig } from './config'
import { getAttribution } from './attribution'
import { createGtmProvider } from './providers/gtm'
import { createGa4Provider } from './providers/ga4'
import { createMetaProvider } from './providers/meta'
import { createGoogleAdsProvider } from './providers/google-ads'
import type { AnalyticsEvent, AnalyticsProvider, PageViewPayload } from './types'

/**
 * Central analytics dispatcher.
 *
 * Owns the list of enabled providers and fans every event out to all of them.
 * Call sites never touch gtag / fbq / dataLayer directly — they call the typed
 * helpers in ./index.ts, which build an AnalyticsEvent and hand it to dispatch().
 *
 * Register a new marketing platform by adding its factory to PROVIDER_FACTORIES.
 */
const PROVIDER_FACTORIES = [
  createGtmProvider,
  createGa4Provider,
  createMetaProvider,
  createGoogleAdsProvider,
]

let providers: AnalyticsProvider[] | null = null
let initialized = false

/** Keys of events that have already fired, to guarantee once-only delivery. */
const firedDedupeKeys = new Set<string>()

function getProviders(): AnalyticsProvider[] {
  if (!providers) {
    providers = PROVIDER_FACTORIES.map((factory) => factory()).filter((provider) => provider.isEnabled())
  }
  return providers
}

function debugLog(label: string, payload: unknown): void {
  if (!analyticsConfig.debug || typeof window === 'undefined') return
  console.debug(`%c[analytics] ${label}`, 'color:#14b8a6;font-weight:bold;', payload)
}

/**
 * Initialise every enabled provider exactly once. Safe to call on every mount;
 * subsequent calls are no-ops.
 */
export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  getProviders().forEach((provider) => {
    try {
      provider.init()
    } catch (err) {
      debugLog(`init failed: ${provider.id}`, err)
    }
  })
  debugLog('initialized providers', getProviders().map((p) => p.id))
}

/** Dispatch a fully-formed event to every enabled provider (with dedupe). */
export function dispatch(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return
  initAnalytics() // guarantee providers are configured before any event

  if (event.dedupeKey) {
    if (firedDedupeKeys.has(event.dedupeKey)) {
      debugLog(`deduped ${event.name}`, event.dedupeKey)
      return
    }
    firedDedupeKeys.add(event.dedupeKey)
  }

  const attribution = getAttribution()
  debugLog(event.name, event.params)

  getProviders().forEach((provider) => {
    try {
      provider.trackEvent(event, attribution)
    } catch (err) {
      debugLog(`trackEvent failed: ${provider.id}`, err)
    }
  })
}

/** Dispatch a page view to every enabled provider. */
export function dispatchPageView(payload: PageViewPayload): void {
  if (typeof window === 'undefined') return
  initAnalytics() // guarantee providers are configured before the first page view
  const attribution = getAttribution()
  debugLog('page_view', payload)

  getProviders().forEach((provider) => {
    try {
      provider.trackPageView(payload, attribution)
    } catch (err) {
      debugLog(`trackPageView failed: ${provider.id}`, err)
    }
  })
}
