'use client'

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  initAnalytics,
  trackPageView,
  trackTimeOnPage,
  trackScrollDepth,
  trackEngagedSession,
  trackCTA,
  trackTrialCtaClick,
  trackNavClick,
  trackExternalLink,
  trackDownload,
  trackError,
} from '@/lib/analytics'

const SCROLL_MILESTONES = [25, 50, 75, 100] as const
const ENGAGEMENT_DELAY_MS = 10_000
const DOWNLOAD_EXT_RE = /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv|txt|mp4|mov|mp3|wav|dmg|pkg|apk|gz)(\?|#|$)/i

/**
 * Root analytics runtime. Mounted once in the layout. Responsibilities:
 *  - initialise every enabled provider,
 *  - emit page_view on initial load and SPA route changes,
 *  - auto-track scroll depth, time on page, engaged sessions,
 *  - auto-track CTA / nav / external-link / download clicks via delegation,
 *  - forward significant client-side errors to the analytics layer.
 *
 * All tracking goes through lib/analytics — there are no raw vendor calls here.
 */
export default function Analytics() {
  useEffect(() => {
    initAnalytics()
  }, [])

  return (
    <Suspense fallback={null}>
      <PageLifecycleTracker />
    </Suspense>
  )
}

function PageLifecycleTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  // Per-page mutable state for time-on-page and scroll milestones.
  const pageStartRef = useRef<number>(Date.now())
  const lastPathRef = useRef<string>('')
  const firedScrollRef = useRef<Set<number>>(new Set())
  const engagedRef = useRef(false)

  // ── Page view + time-on-page on every route change ─────────────────────
  useEffect(() => {
    const fullPath = search ? `${pathname}?${search}` : pathname

    // Flush time spent on the page we are leaving.
    if (lastPathRef.current && lastPathRef.current !== fullPath) {
      const seconds = Math.round((Date.now() - pageStartRef.current) / 1000)
      if (seconds > 0) trackTimeOnPage({ path: lastPathRef.current, seconds })
    }

    lastPathRef.current = fullPath
    pageStartRef.current = Date.now()
    firedScrollRef.current = new Set()
    engagedRef.current = false

    trackPageView({
      path: fullPath,
      location: window.location.href,
      title: document.title,
    })
  }, [pathname, search])

  // ── Scroll depth ───────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      if (scrollable <= 0) return
      const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100))

      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !firedScrollRef.current.has(milestone)) {
          firedScrollRef.current.add(milestone)
          trackScrollDepth({ depth: milestone, path: lastPathRef.current })
          markEngaged()
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Engaged session (dwell ≥ 10s or first meaningful interaction) ───────
  function markEngaged() {
    if (engagedRef.current) return
    engagedRef.current = true
    trackEngagedSession({ path: lastPathRef.current })
  }

  useEffect(() => {
    const timer = window.setTimeout(markEngaged, ENGAGEMENT_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [pathname])

  // ── Flush time-on-page when the tab is hidden / closed ──────────────────
  useEffect(() => {
    function flush() {
      if (document.visibilityState !== 'hidden') return
      const seconds = Math.round((Date.now() - pageStartRef.current) / 1000)
      if (seconds > 0) trackTimeOnPage({ path: lastPathRef.current, seconds })
      pageStartRef.current = Date.now() // avoid double counting if tab returns
    }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
  }, [])

  // ── Delegated click tracking: CTA / nav / external / download ───────────
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      markEngaged()

      const ctaEl = target.closest<HTMLElement>('[data-cta]')
      if (ctaEl) {
        const ctaId = ctaEl.dataset.cta || 'unknown'
        trackCTA({
          id: ctaId,
          location: ctaEl.dataset.ctaLocation,
          text: ctaEl.textContent?.trim().slice(0, 100) || undefined,
          destination: ctaEl instanceof HTMLAnchorElement ? ctaEl.href : undefined,
        })
        // Free-trial funnel stage 2: a trial CTA was clicked anywhere on the site.
        if (ctaId === 'book_free_trial') {
          trackTrialCtaClick({ location: ctaEl.dataset.ctaLocation })
        }
      }

      const anchor = target.closest('a')
      if (!anchor || !anchor.getAttribute('href')) return

      const href = anchor.getAttribute('href') as string
      const text = anchor.textContent?.trim().slice(0, 100) || undefined

      // Contact links (mailto / tel / sms) count as outbound intent.
      if (/^(mailto:|tel:|sms:)/i.test(href)) {
        trackExternalLink({ url: href, text })
        return
      }

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return

      const isDownload = anchor.hasAttribute('download') || DOWNLOAD_EXT_RE.test(url.pathname)
      if (isDownload) {
        const fileName = url.pathname.split('/').pop() || undefined
        trackDownload({ url: url.href, fileName, fileExtension: fileName?.split('.').pop() })
        return
      }

      if (url.host !== window.location.host) {
        trackExternalLink({ url: url.href, text })
        return
      }

      // Internal link inside the main navigation (skip if already a CTA).
      if (!ctaEl && target.closest('nav')) {
        trackNavClick({ label: text || url.pathname, destination: url.pathname, location: 'navbar' })
      }
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  // ── Significant client-side errors ──────────────────────────────────────
  useEffect(() => {
    const seen = new Set<string>()
    function report(description: string, fatal: boolean, context: string) {
      const key = `${context}:${description}`
      if (seen.has(key)) return // avoid flooding on repeated errors
      seen.add(key)
      trackError({ description: description.slice(0, 300), fatal, context })
    }
    function onError(event: ErrorEvent) {
      report(event.message || 'Unknown error', false, 'window.onerror')
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason
      const message = reason instanceof Error ? reason.message : String(reason)
      report(message || 'Unhandled promise rejection', false, 'unhandledrejection')
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
