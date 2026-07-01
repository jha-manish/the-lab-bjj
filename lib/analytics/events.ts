/**
 * Canonical analytics event names.
 *
 * Names follow GA4 recommended event naming wherever a recommended event
 * exists (page_view, generate_lead, begin_checkout, purchase, login,
 * exception, file_download, view_item_list). Custom events use snake_case to
 * match GA4 conventions.
 *
 * Providers map these names to platform-specific equivalents:
 *  - GA4:        used as-is.
 *  - Meta Pixel: mapped to standard events in providers/meta.ts.
 *  - Google Ads: mapped to conversion labels in providers/google-ads.ts.
 *  - GTM:        pushed verbatim onto window.dataLayer.
 */
export const AnalyticsEvents = {
  // ── Page & engagement ────────────────────────────────────────────────
  PAGE_VIEW: 'page_view',
  SCROLL_DEPTH: 'scroll',
  TIME_ON_PAGE: 'time_on_page',
  SESSION_ENGAGED: 'session_engaged',
  NAV_CLICK: 'navigation_click',
  CTA_CLICK: 'cta_click',
  EXTERNAL_LINK_CLICK: 'click', // GA4 recommended "click" (outbound)
  FILE_DOWNLOAD: 'file_download',

  // ── Free-trial funnel (PRIMARY conversion path) ──────────────────────
  TRIAL_PAGE_VIEW: 'trial_page_view',
  TRIAL_CTA_CLICK: 'trial_cta_click',
  TRIAL_STARTED: 'trial_form_start',
  /** Successful free-trial signup. GA4 recommended "generate_lead" + GA4 conversion. */
  TRIAL_SUBMITTED: 'generate_lead',
  TRIAL_FAILED: 'trial_submit_failed',

  // ── Purchase funnel (SECONDARY conversion path) ──────────────────────
  PRICING_VIEW: 'view_item_list',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  PURCHASE_FAILED: 'purchase_failed',

  // ── Auth & errors ────────────────────────────────────────────────────
  LOGIN: 'login',
  EXCEPTION: 'exception',
  PAGE_NOT_FOUND: 'page_not_found',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]

/**
 * Semantic category attached to every dispatched event so providers can decide
 * how to treat it (e.g. Meta only forwards leads/purchases/pageviews; Google
 * Ads only fires for conversions). This keeps platform branching out of the
 * call sites.
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'engagement'
  | 'navigation'
  | 'lead' // free-trial funnel steps
  | 'conversion_lead' // successful free-trial signup (primary conversion)
  | 'checkout'
  | 'conversion_purchase' // successful purchase (secondary conversion)
  | 'auth'
  | 'error'

/** Events that GA4 should treat as conversions (mark these in the GA4 UI). */
export const GA4_CONVERSION_EVENTS: readonly AnalyticsEventName[] = [
  AnalyticsEvents.TRIAL_SUBMITTED, // generate_lead — PRIMARY
  AnalyticsEvents.PURCHASE, // purchase — SECONDARY
]
