export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { fetchAvailability, type AvailabilitySlot } from '@/lib/square'
import { TRIAL_CLASSES } from '@/lib/trial-classes'

const MAX_DATES = 31
const CONCURRENCY = 8

type AvailabilityByKey = Record<string, AvailabilitySlot[]>

function availabilityKey(serviceVariationId: string, startDate: string) {
  return `${serviceVariationId}:${startDate}`
}

async function runInBatches<T>(tasks: (() => Promise<T>)[]) {
  const results: T[] = []

  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batchResults = await Promise.all(tasks.slice(i, i + CONCURRENCY).map(task => task()))
    results.push(...batchResults)
  }

  return results
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dates = searchParams
    .getAll('startDate')
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .slice(0, MAX_DATES)

  if (dates.length === 0) {
    return NextResponse.json({ error: 'Missing startDate params' }, { status: 400 })
  }

  try {
    const tasks = TRIAL_CLASSES.flatMap((cls) => dates.map((date) => async () => {
      const key = availabilityKey(cls.variationId, date)

      try {
        return { key, slots: await fetchAvailability(cls.variationId, date) }
      } catch (err) {
        console.error('Square availability preload error:', err)
        return { key, slots: undefined }
      }
    }))

    const results = await runInBatches(tasks)
    const availability = results.reduce<AvailabilityByKey>((byKey, result) => {
      if (result.slots) byKey[result.key] = result.slots
      return byKey
    }, {})

    return NextResponse.json({ availability })
  } catch (err) {
    console.error('Square availability preload error:', err)
    return NextResponse.json({ error: 'Failed to preload availability' }, { status: 500 })
  }
}
