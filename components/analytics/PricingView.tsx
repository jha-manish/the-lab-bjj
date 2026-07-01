'use client'

import { useEffect } from 'react'
import { trackPricingView, type AnalyticsItem } from '@/lib/analytics'

/**
 * Fires the "pricing page viewed" event (GA4 view_item_list) once when the
 * memberships listing renders. Kept as a tiny client island so the page itself
 * can stay a server component. Deduped per page load inside the analytics layer.
 */
export default function PricingView({ items, listName }: { items?: AnalyticsItem[]; listName?: string }) {
  useEffect(() => {
    trackPricingView({ items, listName })
    // Intentionally fire once per mount; trackPricingView is deduped per load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
