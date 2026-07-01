// Ambient typings for the marketing globals injected by the platform scripts.
export {}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] }
    _fbq?: unknown
  }
}
