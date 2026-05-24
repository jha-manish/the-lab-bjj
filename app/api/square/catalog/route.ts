import { NextResponse } from 'next/server'
import { squareFetch, transformItem } from '@/lib/square'

export async function GET() {
  try {
    const items: ReturnType<typeof transformItem>[] = []
    let cursor: string | undefined

    do {
      const path = cursor
        ? `/catalog/list?types=ITEM&cursor=${encodeURIComponent(cursor)}`
        : '/catalog/list?types=ITEM'

      const res = await squareFetch(path)
      if (!res.ok) throw new Error(`Square catalog ${res.status}: ${await res.text()}`)

      const data = (await res.json()) as {
        objects?: Record<string, unknown>[]
        cursor?: string
      }

      for (const obj of data.objects ?? []) {
        if (obj.type === 'ITEM' && obj.item_data) {
          items.push(transformItem(obj))
        }
      }

      cursor = data.cursor
    } while (cursor)

    return NextResponse.json({ items })
  } catch (err) {
    console.error('Square catalog error:', err)
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 })
  }
}
