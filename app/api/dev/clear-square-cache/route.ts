import { NextResponse } from 'next/server'
import { clearCatalogItemsCache } from '@/lib/square'

export const runtime = 'edge'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  clearCatalogItemsCache()

  return NextResponse.json({ ok: true })
}
