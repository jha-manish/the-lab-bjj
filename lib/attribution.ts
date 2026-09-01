export interface Attribution {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  referrer?: string
  landingPage?: string
  capturedAt?: string
}

const STORAGE_KEY = 'thelab_attribution'
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/**
 * First-touch attribution: only overwrites what's stored when the URL actually
 * carries UTM params, so a later direct visit doesn't erase the ad click that
 * originally brought someone to the site.
 */
export function captureAttribution() {
  if (typeof window === 'undefined') return

  try {
    const params = new URLSearchParams(window.location.search)
    if (!UTM_PARAMS.some(key => params.has(key))) return

    const attribution: Attribution = {
      utmSource: params.get('utm_source') ?? undefined,
      utmMedium: params.get('utm_medium') ?? undefined,
      utmCampaign: params.get('utm_campaign') ?? undefined,
      utmContent: params.get('utm_content') ?? undefined,
      utmTerm: params.get('utm_term') ?? undefined,
      referrer: document.referrer || undefined,
      landingPage: window.location.pathname,
      capturedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    // localStorage unavailable (private browsing, etc.) — ignore
  }
}

export function getStoredAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch {
    return null
  }
}

/** Human-readable single line for Square's seller_note / customer note fields */
export function formatAttribution(a: Attribution | null): string {
  if (!a) return 'Direct visit — no campaign data'

  const parts: string[] = []
  if (a.utmSource) parts.push(`Source: ${a.utmSource}`)
  if (a.utmMedium) parts.push(`Medium: ${a.utmMedium}`)
  if (a.utmCampaign) parts.push(`Campaign: ${a.utmCampaign}`)
  if (a.utmContent) parts.push(`Content: ${a.utmContent}`)
  if (a.utmTerm) parts.push(`Term: ${a.utmTerm}`)
  if (a.landingPage) parts.push(`Landing page: ${a.landingPage}`)
  if (a.referrer) parts.push(`Referrer: ${a.referrer}`)

  return parts.length > 0 ? parts.join(' | ') : 'Direct visit — no campaign data'
}
