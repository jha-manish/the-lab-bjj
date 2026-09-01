'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/attribution'

/** Invisible — captures UTM params from the URL into localStorage on first load of any page. */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution()
  }, [])

  return null
}
