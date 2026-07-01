/**
 * The Jiu-Jitsu Lab — analytics public API.
 *
 * This is the ONLY module UI/code should import to track behaviour. It exposes
 * typed, intent-revealing helpers (trackTrialSubmitted, trackPurchase, …) that
 * build a canonical event and fan it out to every enabled marketing platform
 * (GA4, GTM dataLayer, Meta Pixel, Google Ads) via the dispatcher in core.ts.
 *
 * Never call gtag / fbq / dataLayer directly anywhere else in the app.
 *
 * Full event catalogue & parameters: lib/analytics/README.md
 */
import { dispatch, dispatchPageView, initAnalytics } from './core'
import { AnalyticsEvents } from './events'
import type { AnalyticsItem, AnalyticsParams } from './types'

export { initAnalytics }
export { AnalyticsEvents, GA4_CONVERSION_EVENTS } from './events'
export { getAttribution } from './attribution'
export { analyticsConfig } from './config'
export type { Attribution, AnalyticsItem, AnalyticsParams } from './types'

/** Drop undefined values so providers receive clean parameter bags. */
function clean(params: AnalyticsParams): AnalyticsParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  )
}

// ── Page & engagement ──────────────────────────────────────────────────────

export interface PageViewInput {
  path: string
  location: string
  title: string
}

/** Track a page view. Fired on initial load and every SPA route change. */
export function trackPageView({ path, location, title }: PageViewInput): void {
  dispatchPageView({ page_path: path, page_location: location, page_title: title })
}

export interface CtaInput {
  /** Stable identifier, e.g. "book_free_trial". */
  id: string
  /** Where on the site the CTA lives, e.g. "navbar", "home_hero". */
  location?: string
  /** Visible label / text of the control. */
  text?: string
  /** Destination href, if the CTA is a link. */
  destination?: string
}

/** Track a marketing CTA button/link click. */
export function trackCTA(input: CtaInput): void {
  dispatch({
    name: AnalyticsEvents.CTA_CLICK,
    type: 'navigation',
    params: clean({ cta_id: input.id, cta_location: input.location, cta_text: input.text, link_url: input.destination }),
  })
}

/** Track a primary navigation click (header / footer menu). */
export function trackNavClick(input: { label: string; destination: string; location?: string }): void {
  dispatch({
    name: AnalyticsEvents.NAV_CLICK,
    type: 'navigation',
    params: clean({ nav_label: input.label, link_url: input.destination, nav_location: input.location }),
  })
}

/** Track an outbound link click (different host than ours). */
export function trackExternalLink(input: { url: string; text?: string }): void {
  dispatch({
    name: AnalyticsEvents.EXTERNAL_LINK_CLICK,
    type: 'navigation',
    params: clean({ link_url: input.url, link_text: input.text, outbound: true }),
  })
}

/** Track a file download. */
export function trackDownload(input: { url: string; fileName?: string; fileExtension?: string }): void {
  dispatch({
    name: AnalyticsEvents.FILE_DOWNLOAD,
    type: 'navigation',
    params: clean({ link_url: input.url, file_name: input.fileName, file_extension: input.fileExtension }),
  })
}

/** Track scroll-depth milestones (25 / 50 / 75 / 100). Deduped per page+depth. */
export function trackScrollDepth(input: { depth: 25 | 50 | 75 | 100; path: string }): void {
  dispatch({
    name: AnalyticsEvents.SCROLL_DEPTH,
    type: 'engagement',
    params: { percent_scrolled: input.depth, page_path: input.path },
    dedupeKey: `scroll:${input.path}:${input.depth}`,
  })
}

/** Track time spent on a page when the visitor leaves it. */
export function trackTimeOnPage(input: { path: string; seconds: number }): void {
  dispatch({
    name: AnalyticsEvents.TIME_ON_PAGE,
    type: 'engagement',
    params: { page_path: input.path, time_seconds: input.seconds },
  })
}

/** Track that a session became "engaged" (meaningful interaction / dwell). */
export function trackEngagedSession(input: { path: string }): void {
  dispatch({
    name: AnalyticsEvents.SESSION_ENGAGED,
    type: 'engagement',
    params: { page_path: input.path },
    dedupeKey: 'session_engaged', // once per page load
  })
}

// ── Free-trial funnel (PRIMARY conversion) ──────────────────────────────────

export interface TrialClassInput {
  className?: string
  classLevel?: string
}

/** Stage 1: Free Trial page viewed. */
export function trackTrialPageView(): void {
  dispatch({
    name: AnalyticsEvents.TRIAL_PAGE_VIEW,
    type: 'lead',
    params: {},
    dedupeKey: 'trial_page_view', // once per page load
  })
}

/** Stage 2: a Free Trial CTA was clicked. */
export function trackTrialCtaClick(input: { location?: string } = {}): void {
  dispatch({
    name: AnalyticsEvents.TRIAL_CTA_CLICK,
    type: 'lead',
    params: clean({ cta_location: input.location }),
  })
}

/** Stage 3: visitor started filling in the trial booking form. */
export function trackTrialStarted(input: TrialClassInput = {}): void {
  dispatch({
    name: AnalyticsEvents.TRIAL_STARTED,
    type: 'lead',
    params: clean({ class_name: input.className, class_level: input.classLevel }),
    dedupeKey: 'trial_form_start', // only the first interaction counts
  })
}

export interface TrialSubmittedInput extends TrialClassInput {
  /** Square booking ID — used both as the dedupe key and value reference. */
  bookingId: string
  startAt?: string
}

/**
 * Stage 4: free-trial signup completed successfully.
 *
 * This is the PRIMARY conversion: GA4 `generate_lead` (mark as a conversion in
 * the GA4 UI), Meta `Lead`, and the Google Ads primary conversion all fire from
 * this single call. Deduped by booking ID so a re-render/retry cannot double
 * count.
 */
export function trackTrialSubmitted(input: TrialSubmittedInput): void {
  dispatch({
    name: AnalyticsEvents.TRIAL_SUBMITTED,
    type: 'conversion_lead',
    params: clean({
      class_name: input.className,
      class_level: input.classLevel,
      booking_id: input.bookingId,
      transaction_id: input.bookingId,
      start_at: input.startAt,
      // Currency present so GA4/Meta accept it as a (zero-value) lead.
      value: 0,
      currency: 'CAD',
    }),
    dedupeKey: `trial_submitted:${input.bookingId}`,
  })
}

/** Stage 4 (failure): trial submission failed. */
export function trackTrialFailed(input: { message: string } & TrialClassInput): void {
  dispatch({
    name: AnalyticsEvents.TRIAL_FAILED,
    type: 'error',
    params: clean({ error_message: input.message, class_name: input.className, class_level: input.classLevel }),
  })
}

// ── Purchase funnel (SECONDARY conversion) ──────────────────────────────────

/** Pricing / memberships list viewed. */
export function trackPricingView(input: { items?: AnalyticsItem[]; listName?: string } = {}): void {
  dispatch({
    name: AnalyticsEvents.PRICING_VIEW,
    type: 'checkout',
    params: clean({ item_list_name: input.listName, items: input.items }),
    dedupeKey: 'pricing_view', // once per page load
  })
}

export interface CheckoutInput {
  value: number
  currency?: string
  membershipPlan?: string
  items?: AnalyticsItem[]
}

/** Checkout started (visitor reached the payment step). GA4 `begin_checkout`. */
export function trackCheckoutStarted(input: CheckoutInput): void {
  dispatch({
    name: AnalyticsEvents.BEGIN_CHECKOUT,
    type: 'checkout',
    params: clean({
      value: input.value,
      currency: input.currency ?? 'CAD',
      membership_plan: input.membershipPlan,
      items: input.items,
    }),
  })
}

export interface PurchaseInput {
  /** Square payment/transaction ID. Required: dedupes the conversion. */
  transactionId: string
  value: number
  currency?: string
  membershipPlan?: string
  items?: AnalyticsItem[]
}

/**
 * Purchase completed. SECONDARY conversion — fire ONLY after Square confirms
 * the payment succeeded. GA4 `purchase`, Meta `Purchase`, Google Ads secondary
 * conversion. Deduped by transaction ID.
 *
 * NOTE: This tracks ONLINE purchases only. In-person Square sales are not
 * visible to the browser; see the offline-conversion notes in
 * lib/analytics/providers/google-ads.ts and lib/analytics/README.md.
 */
export function trackPurchase(input: PurchaseInput): void {
  dispatch({
    name: AnalyticsEvents.PURCHASE,
    type: 'conversion_purchase',
    params: clean({
      transaction_id: input.transactionId,
      value: input.value,
      currency: input.currency ?? 'CAD',
      membership_plan: input.membershipPlan,
      item_name: input.membershipPlan,
      items: input.items,
    }),
    dedupeKey: `purchase:${input.transactionId}`,
  })
}

/** Checkout / payment failed. */
export function trackPurchaseFailed(input: { message: string; value?: number; membershipPlan?: string }): void {
  dispatch({
    name: AnalyticsEvents.PURCHASE_FAILED,
    type: 'error',
    params: clean({ error_message: input.message, value: input.value, membership_plan: input.membershipPlan }),
  })
}

// ── Auth & errors ────────────────────────────────────────────────────────────

/** Track a login. GA4 recommended `login`. */
export function trackLogin(input: { method?: string } = {}): void {
  dispatch({
    name: AnalyticsEvents.LOGIN,
    type: 'auth',
    params: clean({ method: input.method ?? 'unknown' }),
  })
}

/** Track a 404. */
export function track404(input: { path: string }): void {
  dispatch({
    name: AnalyticsEvents.PAGE_NOT_FOUND,
    type: 'error',
    params: { page_path: input.path },
    dedupeKey: `404:${input.path}`,
  })
}

/**
 * Track a significant client-side error. GA4 recommended `exception`.
 * `fatal` defaults to false.
 */
export function trackError(input: { description: string; fatal?: boolean; context?: string }): void {
  dispatch({
    name: AnalyticsEvents.EXCEPTION,
    type: 'error',
    params: clean({ description: input.description, fatal: input.fatal ?? false, context: input.context }),
  })
}
