import type { Attribution } from './types'

/**
 * Acquisition / attribution capture.
 *
 * UTM parameters, click IDs, referrer and landing page are captured on the
 * FIRST page of a session and frozen in sessionStorage so attribution survives
 * client-side navigation (the URL loses the UTMs as soon as the visitor moves
 * to a second page). New-vs-returning is tracked in localStorage.
 */

const SESSION_KEY = 'tjjl_attribution'
const RETURNING_KEY = 'tjjl_returning_visitor'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

function detectDeviceType(ua: string): Attribution['device_type'] {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'tablet'
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua) && /Version\//i.test(ua)) return 'Safari'
  return 'Unknown'
}

function detectOS(ua: string): string {
  if (/Windows NT/i.test(ua)) return 'Windows'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Mac OS X/i.test(ua)) return 'macOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown'
}

/**
 * Best-effort client-side country from the browser locale region subtag
 * (e.g. "en-CA" -> "CA"). This is only an approximation: the authoritative
 * country in GA4 and Google Ads is derived server-side from the visitor IP,
 * and Cloudflare exposes `request.cf.country` if a more reliable value is
 * needed later (see lib/analytics/README.md).
 */
function detectCountry(): string | null {
  try {
    const locale = navigator.language || (navigator.languages && navigator.languages[0])
    const region = locale?.split('-')[1]
    return region ? region.toUpperCase() : null
  } catch {
    return null
  }
}

function isReturningVisitor(): boolean {
  try {
    const seen = localStorage.getItem(RETURNING_KEY)
    if (seen) return true
    localStorage.setItem(RETURNING_KEY, String(Date.now()))
    return false
  } catch {
    return false
  }
}

function captureFresh(): Attribution {
  const url = new URL(window.location.href)
  const params = url.searchParams
  const ua = navigator.userAgent

  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key)])
  ) as Record<(typeof UTM_KEYS)[number], string | null>

  // QR campaigns may arrive as ?qr=... or be encoded in utm_source/medium.
  const qrId =
    params.get('qr') ??
    params.get('qr_id') ??
    (/qr/i.test(utm.utm_medium ?? '') || /qr/i.test(utm.utm_source ?? '')
      ? utm.utm_campaign ?? utm.utm_source
      : null)

  return {
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    qr_id: qrId,
    gclid: params.get('gclid'),
    fbclid: params.get('fbclid'),
    referrer: document.referrer || null,
    landing_page: url.pathname + url.search,
    device_type: detectDeviceType(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
    country: detectCountry(),
    visitor_type: isReturningVisitor() ? 'returning' : 'new',
  }
}

function emptyAttribution(): Attribution {
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    qr_id: null,
    gclid: null,
    fbclid: null,
    referrer: null,
    landing_page: null,
    device_type: 'desktop',
    browser: 'Unknown',
    os: 'Unknown',
    country: null,
    visitor_type: 'new',
  }
}

let cached: Attribution | null = null

/**
 * Returns the session attribution, capturing and persisting it on first call.
 * Subsequent calls (including after route changes) return the frozen value.
 */
export function getAttribution(): Attribution {
  if (cached) return cached
  if (typeof window === 'undefined') return emptyAttribution()

  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      cached = JSON.parse(stored) as Attribution
      return cached
    }
  } catch {
    // sessionStorage unavailable (private mode / blocked) — fall through.
  }

  const fresh = captureFresh()
  cached = fresh
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh))
  } catch {
    // Ignore persistence failures; in-memory cache still works for this page.
  }
  return fresh
}
