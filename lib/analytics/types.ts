import type { AnalyticsEventName, AnalyticsEventType } from './events'

/** Flat, JSON-serialisable parameter bag attached to an event. */
export type AnalyticsParams = Record<string, string | number | boolean | null | undefined | AnalyticsItem[]>

/** GA4 / Meta ecommerce item shape (used for checkout & purchase). */
export interface AnalyticsItem {
  item_id?: string
  item_name?: string
  item_category?: string
  item_variant?: string
  price?: number
  quantity?: number
}

/**
 * Acquisition / attribution context captured once per session and attached to
 * every event so any conversion can be traced back to the campaign, QR code,
 * or referrer that produced it.
 */
export interface Attribution {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  /** Arbitrary QR identifier, e.g. ?qr=gym-window or utm_source=qr_window. */
  qr_id: string | null
  /** Google click ID — links GA4/Ads sessions to ad clicks. */
  gclid: string | null
  /** Meta click ID. */
  fbclid: string | null
  referrer: string | null
  landing_page: string | null
  device_type: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
  country: string | null
  visitor_type: 'new' | 'returning'
}

/** A fully-formed event ready to be dispatched to every provider. */
export interface AnalyticsEvent {
  name: AnalyticsEventName
  type: AnalyticsEventType
  params: AnalyticsParams
  /**
   * Stable key used to guarantee an event only fires once (e.g. a booking ID
   * for a conversion). Dispatches with a repeated key are dropped.
   */
  dedupeKey?: string
}

/** Page-view payload, kept separate because providers handle it specially. */
export interface PageViewPayload {
  page_path: string
  page_location: string
  page_title: string
  params?: AnalyticsParams
}

/**
 * The contract every marketing platform adapter implements. Add a new platform
 * by creating a file in ./providers that returns one of these and registering
 * it in ./core.ts — no call sites change.
 */
export interface AnalyticsProvider {
  /** Stable identifier, used for debug logging. */
  readonly id: string
  /** Whether this provider is configured and should receive events. */
  isEnabled(): boolean
  /** One-time browser setup (push base config, etc.). Safe to call repeatedly. */
  init(): void
  /** Forward a page view. */
  trackPageView(payload: PageViewPayload, attribution: Attribution): void
  /** Forward a semantic event. */
  trackEvent(event: AnalyticsEvent, attribution: Attribution): void
}
