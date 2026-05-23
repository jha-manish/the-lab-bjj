import { NextRequest, NextResponse } from 'next/server'
import { square, LOCATION_ID, bigintReplacer } from '@/lib/square'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceVariationId,
      serviceVariationVersion,
      teamMemberId,
      startAt,
      customerName,
      customerEmail,
      customerPhone,
      sourceId, // payment card token from Web Payments SDK
      amountMoney, // { amount: number (cents), currency: string }
    } = body

    // 1. Find or create the customer
    const customerSearch = await square.customers.search({
      query: {
        filter: {
          emailAddress: { exact: customerEmail },
        },
      },
    })

    let customerId: string | undefined
    if (customerSearch.customers && customerSearch.customers.length > 0) {
      customerId = customerSearch.customers[0].id
    } else {
      const [firstName, ...rest] = customerName.split(' ')
      const newCustomer = await square.customers.create({
        idempotencyKey: crypto.randomUUID(),
        givenName: firstName,
        familyName: rest.join(' ') || '',
        emailAddress: customerEmail,
        phoneNumber: customerPhone,
      })
      customerId = newCustomer.customer?.id
    }

    // 2. Create the booking
    const bookingResponse = await square.bookings.create({
      idempotencyKey: crypto.randomUUID(),
      booking: {
        locationId: LOCATION_ID,
        startAt,
        customerId,
        customerNote: `Booked via The Jiu-Jitsu Lab website`,
        appointmentSegments: [
          {
            serviceVariationId,
            serviceVariationVersion: BigInt(serviceVariationVersion),
            teamMemberId,
            durationMinutes: 60,
          },
        ],
      },
    })

    if (!bookingResponse.booking) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // 3. Take payment if amount provided
    if (sourceId && amountMoney?.amount > 0) {
      await square.payments.create({
        idempotencyKey: crypto.randomUUID(),
        sourceId,
        amountMoney: {
          amount: BigInt(amountMoney.amount),
          currency: amountMoney.currency ?? 'CAD',
        },
        locationId: LOCATION_ID,
        customerId,
        note: `Booking: ${serviceVariationId}`,
      })
    }

    return new NextResponse(
      JSON.stringify({ booking: bookingResponse.booking }, bigintReplacer),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Square booking error:', err)
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
  }
}
