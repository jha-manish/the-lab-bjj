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

  const startAt = new Date(startDate)
  startAt.setHours(0, 0, 0, 0)
  const endAt = new Date(startDate)
  endAt.setHours(23, 59, 59, 999)

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
