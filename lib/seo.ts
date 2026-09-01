import type { Metadata } from 'next'

export const BASE_URL = 'https://labjiujitsu.com'
export const DEFAULT_OG_IMAGE = {
  url: '/images/hero/hero-group.jpg',
  width: 1200,
  height: 630,
  alt: 'The Jiu-Jitsu Lab — BJJ in Waterloo, ON',
}
const SITE_NAME_SUFFIX = 'The Jiu-Jitsu Lab Waterloo'

/**
 * Builds per-page metadata with a self-referencing canonical and a full
 * openGraph/twitter block. Next.js does not merge nested metadata objects
 * across segments — a page-level `openGraph: { url }` silently drops the
 * layout's image/siteName, so every page needs its own complete block.
 *
 * `title` should be the bare page label (e.g. "About") — the root layout's
 * title template appends " | The Jiu-Jitsu Lab Waterloo" for every nested
 * route automatically, so passing an already-suffixed title here would
 * double it up. The homepage doesn't go through that template (it's the
 * same segment as the root layout), so it passes its full title directly
 * as `title` and its own `socialTitle` to skip the auto-suffix.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle = `${title} | ${SITE_NAME_SUFFIX}`,
}: {
  title: string
  description: string
  path: string
  socialTitle?: string
}): Metadata {
  const url = `${BASE_URL}${path}`
  const fullTitle = socialTitle

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_CA',
      url,
      siteName: 'The Jiu-Jitsu Lab',
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
