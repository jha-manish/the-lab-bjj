import { NextResponse } from 'next/server'
import { square, bigintReplacer } from '@/lib/square'

export async function GET() {
  try {
    const response = await square.catalog.list({ types: 'ITEM' })

    const items: unknown[] = []
    for await (const item of response) {
      if (item.type === 'ITEM' && item.itemData) {
        items.push(item)
      }
    }

    return new NextResponse(JSON.stringify({ items }, bigintReplacer), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Square catalog error:', err)
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 })
  }
}
