import { NextRequest, NextResponse } from 'next/server'
import { square, LOCATION_ID, bigintReplacer } from '@/lib/square'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sourceId,
      amountMoney, // { amount: number (cents), currency: string }
      customerName,
      customerEmail,
      customerPhone,
      note,
    } = body

    // Find or create customer
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

    const paymentResponse = await square.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId,
      amountMoney: {
        amount: BigInt(amountMoney.amount),
        currency: amountMoney.currency ?? 'CAD',
      },
      locationId: LOCATION_ID,
      customerId,
      note: note ?? 'The Jiu-Jitsu Lab purchase',
    })

    return new NextResponse(
      JSON.stringify({ payment: paymentResponse.payment }, bigintReplacer),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Square payment error:', err)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
