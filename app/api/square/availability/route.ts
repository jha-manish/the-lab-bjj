export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { fetchAvailability } from '@/lib/square'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const serviceVariationId = searchParams.get('serviceVariationId')
  const serviceVariationVersion = searchParams.get('serviceVariationVersion')
  const startDate = searchParams.get('startDate')

  if (!serviceVariationId || !serviceVariationVersion || !startDate) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
  }

  try {
    const availabilities = await fetchAvailability(serviceVariationId, startDate)

    return NextResponse.json({ availabilities })
  } catch (err) {
    console.error('Square availability error:', err)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
