export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { squareFetch, LOCATION_ID, findOrCreateCustomer } from '@/lib/square'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sourceId: string
      amountMoney: { amount: number; currency: string }
      customerName: string
      customerEmail: string
      customerPhone: string
      note?: string
    }

    const { sourceId, amountMoney, customerName, customerEmail, customerPhone, note } = body

    const customerId = await findOrCreateCustomer(customerEmail, customerName, customerPhone)

    const payRes = await squareFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        source_id: sourceId,
        amount_money: {
          amount: amountMoney.amount,
          currency: amountMoney.currency ?? 'CAD',
        },
        location_id: LOCATION_ID,
        customer_id: customerId,
        note: note ?? 'The Jiu-Jitsu Lab purchase',
      }),
    })

    if (!payRes.ok) throw new Error(`Payment failed: ${await payRes.text()}`)

    const data = (await payRes.json()) as { payment?: { id: string } }
    return NextResponse.json({ payment: data.payment })
  } catch (err) {
    console.error('Square payment error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment failed' },
      { status: 500 }
    )
  }
}
