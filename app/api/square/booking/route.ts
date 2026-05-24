export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { squareFetch, LOCATION_ID, findOrCreateCustomer, transformBooking } from '@/lib/square'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      serviceVariationId: string
      serviceVariationVersion: string
      teamMemberId: string
      startAt: string
      customerName: string
      customerEmail: string
      customerPhone: string
      sourceId?: string
      amountMoney?: { amount: number; currency: string }
    }

    const {
      serviceVariationId,
      serviceVariationVersion,
      teamMemberId,
      startAt,
      customerName,
      customerEmail,
      customerPhone,
      sourceId,
      amountMoney,
    } = body

    const customerId = await findOrCreateCustomer(customerEmail, customerName, customerPhone)

    // Create booking
    const bookingRes = await squareFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        booking: {
          location_id: LOCATION_ID,
          start_at: startAt,
          customer_id: customerId,
          customer_note: 'Booked via The Jiu-Jitsu Lab website',
          appointment_segments: [
            {
              service_variation_id: serviceVariationId,
              service_variation_version: parseInt(serviceVariationVersion, 10),
              team_member_id: teamMemberId,
              duration_minutes: 60,
            },
          ],
        },
      }),
    })

    if (!bookingRes.ok) throw new Error(`Booking failed: ${await bookingRes.text()}`)

    const bookingData = (await bookingRes.json()) as { booking?: Record<string, unknown> }
    if (!bookingData.booking) throw new Error('No booking returned')

    // Take payment if provided
    if (sourceId && amountMoney && amountMoney.amount > 0) {
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
          note: `Booking: ${serviceVariationId}`,
        }),
      })
      if (!payRes.ok) throw new Error(`Payment failed: ${await payRes.text()}`)
    }

    return NextResponse.json({ booking: transformBooking(bookingData.booking) })
  } catch (err) {
    console.error('Square booking error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Booking failed' },
      { status: 500 }
    )
  }
}
