import { NextRequest, NextResponse } from 'next/server'
import { square, LOCATION_ID, bigintReplacer } from '@/lib/square'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const serviceVariationId = searchParams.get('serviceVariationId')
  const serviceVariationVersion = searchParams.get('serviceVariationVersion')
  const startDate = searchParams.get('startDate') // YYYY-MM-DD

  if (!serviceVariationId || !serviceVariationVersion || !startDate) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
  }

  const startAt = new Date(startDate)
  startAt.setHours(0, 0, 0, 0)
  const endAt = new Date(startDate)
  endAt.setHours(23, 59, 59, 999)

  try {
    const response = await square.bookings.searchAvailability({
      query: {
        filter: {
          startAtRange: {
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          },
          locationId: LOCATION_ID,
          segmentFilters: [
            {
              serviceVariationId,
            },
          ],
        },
      },
    })

    return new NextResponse(
      JSON.stringify({ availabilities: response.availabilities ?? [] }, bigintReplacer),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Square availability error:', err)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
