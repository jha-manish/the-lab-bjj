import { NextResponse } from 'next/server'
import { clearAvailabilityCache, clearCatalogItemsCache } from '@/lib/square'

export const runtime = 'edge'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  clearCatalogItemsCache()
  clearAvailabilityCache()

  return NextResponse.json({ ok: true })
}
