export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { fetchSubscriptionPlans } from '@/lib/square'

export async function GET() {
  try {
    const plans = await fetchSubscriptionPlans()
    return NextResponse.json({ plans })
  } catch (err) {
    console.error('Square subscription plans error:', err)
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 })
  }
}
