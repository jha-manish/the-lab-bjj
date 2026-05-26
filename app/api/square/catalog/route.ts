export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { fetchCatalogItems } from '@/lib/square'

export async function GET() {
  try {
    const items = await fetchCatalogItems()
    return NextResponse.json({ items })
  } catch (err) {
    console.error('Square catalog error:', err)
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 })
  }
}
