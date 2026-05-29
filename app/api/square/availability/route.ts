export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { squareFetch, LOCATION_ID, transformAvailability } from '@/lib/square'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const serviceVariationId = searchParams.get('serviceVariationId')
  const serviceVariationVersion = searchParams.get('serviceVariationVersion')
  const startDate = searchParams.get('startDate')

  if (!serviceVariationId || !serviceVariationVersion || !startDate) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
  }

  // Compute the UTC range for [startDate] in Eastern Time (America/Toronto).
  // e.g. "2026-06-02" EDT → 2026-06-02T04:00:00Z … 2026-06-03T03:59:59.999Z
  const etOffset = (() => {
    const sample = new Date(`${startDate}T12:00:00Z`)
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      timeZoneName: 'shortOffset',
      hour: 'numeric',
    }).formatToParts(sample)
    const str = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT-4'
    return parseInt(str.replace('GMT', '') || '-4', 10) // e.g. -4 for EDT
  })()
  const absOffset = Math.abs(etOffset)
  const startAt = new Date(`${startDate}T${String(absOffset).padStart(2, '0')}:00:00.000Z`)
  const endAt   = new Date(startAt.valueOf() + 24 * 3600_000 - 1)

  try {
    const res = await squareFetch('/bookings/availability/search', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          filter: {
            start_at_range: {
              start_at: startAt.toISOString(),
              end_at: endAt.toISOString(),
            },
            location_id: LOCATION_ID,
            segment_filters: [{ service_variation_id: serviceVariationId }],
          },
        },
      }),
    })

    if (!res.ok) throw new Error(`Square availability ${res.status}: ${await res.text()}`)

    const data = (await res.json()) as { availabilities?: Record<string, unknown>[] }
    const availabilities = (data.availabilities ?? []).map(transformAvailability)

    return NextResponse.json({ availabilities })
  } catch (err) {
    console.error('Square availability error:', err)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
