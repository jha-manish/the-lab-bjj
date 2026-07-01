/**
 * Analytics configuration.
 *
 * Every marketing platform is enabled purely by the presence of its public
 * environment variable. This keeps the analytics layer extensible: adding a new
 * platform means adding a provider file (see ./providers) and an ID env var —
 * no application code has to change.
 *
 * All IDs are `NEXT_PUBLIC_*` because they are needed in the browser. They are
 * NOT secrets — pixel / measurement IDs are always visible client-side.
 *
 * To avoid double-counting, GA4 / Meta / Google Ads can each be fired EITHER
 * directly from this app OR via a tag configured inside Google Tag Manager.
 * If you manage a platform's tag inside GTM, disable the direct provider here
 * with the matching `*_VIA_GTM` flag so events are not sent twice.
 */

function readId(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

function readBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

// Preserve the original hard-coded GA4 property as the default so analytics
// keeps working even before the new env vars are configured in production.
const DEFAULT_GA4_MEASUREMENT_ID = 'G-PHS0NYH28S'

export const analyticsConfig = {
  /** Google Tag Manager container, e.g. "GTM-XXXXXXX". */
  gtmId: readId(process.env.NEXT_PUBLIC_GTM_ID),

  ga4: {
    /** GA4 measurement ID, e.g. "G-XXXXXXXXXX". */
    measurementId: readId(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) ?? DEFAULT_GA4_MEASUREMENT_ID,
    /** Set true when a GA4 config tag already lives inside GTM. */
    viaGtm: readBool(process.env.NEXT_PUBLIC_GA4_VIA_GTM),
  },

  meta: {
    /** Meta (Facebook) Pixel ID. */
    pixelId: readId(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    /** Set true when the Meta Pixel base code is managed inside GTM. */
    viaGtm: readBool(process.env.NEXT_PUBLIC_META_VIA_GTM),
  },

  googleAds: {
    /** Google Ads account ID, e.g. "AW-XXXXXXXXX". */
    conversionId: readId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
    /** Set true when Google Ads conversions are managed inside GTM. */
    viaGtm: readBool(process.env.NEXT_PUBLIC_GOOGLE_ADS_VIA_GTM),
    /**
     * Conversion labels from Google Ads (the part after the slash in
     * "AW-XXXXXXXXX/aBcDeFgHiJ"). The free-trial signup is the PRIMARY
     * conversion; purchase is SECONDARY.
     */
    trialConversionLabel: readId(process.env.NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL),
    purchaseConversionLabel: readId(process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL),
  },

  /** Logs every dispatched event to the console. Defaults on outside production. */
  debug: readBool(process.env.NEXT_PUBLIC_ANALYTICS_DEBUG) || process.env.NODE_ENV !== 'production',
} as const

export type AnalyticsConfig = typeof analyticsConfig
