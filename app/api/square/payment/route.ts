export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import {
  squareFetch,
  LOCATION_ID,
  findOrCreateCustomer,
  getPublicSquareErrorMessage,
  getPublicSquareErrorStatus,
  throwSquareApiError,
  validateMembershipCheckout,
} from '@/lib/square'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sourceId: string
      amountMoney?: { amount: number; currency: string }
      customerName: string
      customerEmail: string
      customerPhone: string
      note?: string
      itemVariationId?: string
      discountId?: string
    }

    const { sourceId, amountMoney, customerName, customerEmail, customerPhone, note, itemVariationId, discountId } = body

    if (!sourceId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 })
    }

    const customerId = await findOrCreateCustomer(customerEmail, customerName, customerPhone)
    let validatedAmountMoney: { amount: number; currency: string }
    let validatedNote = note ?? 'The Jiu-Jitsu Lab purchase'

    if (itemVariationId || discountId) {
      if (!itemVariationId) {
        return NextResponse.json({ error: 'Missing membership variation' }, { status: 400 })
      }

      let checkout: Awaited<ReturnType<typeof validateMembershipCheckout>>
      try {
        checkout = await validateMembershipCheckout(itemVariationId, discountId)
      } catch (err) {
        console.error('Square payment membership validation error:', err)
        return NextResponse.json(
          { error: 'We could not verify that membership selection. Please refresh the page and try again.' },
          { status: 400 }
        )
      }

      validatedAmountMoney = {
        amount: checkout.totalAmountCents,
        currency: checkout.currency,
      }
      validatedNote = `${checkout.discount ? 'Pre-paid' : 'Monthly'} membership: ${checkout.membershipName}`
    } else if (!amountMoney || !Number.isFinite(amountMoney.amount) || amountMoney.amount <= 0) {
      return NextResponse.json({ error: 'Missing payment amount' }, { status: 400 })
    } else {
      validatedAmountMoney = amountMoney
    }

    const payRes = await squareFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        source_id: sourceId,
        amount_money: {
          amount: validatedAmountMoney.amount,
          currency: validatedAmountMoney.currency ?? 'CAD',
        },
        location_id: LOCATION_ID,
        customer_id: customerId,
        note: validatedNote,
      }),
    })

    if (!payRes.ok) {
      await throwSquareApiError(
        payRes,
        'Payment failed',
        'We could not complete the payment. Please check your card details and try again, or use a different card.'
      )
    }

    const data = (await payRes.json()) as { payment?: { id: string } }
    return NextResponse.json({ payment: data.payment })
  } catch (err) {
    console.error('Square payment error:', err)
    return NextResponse.json(
      { error: getPublicSquareErrorMessage(err, 'We could not complete the payment. Please try again in a moment or contact us for help.') },
      { status: getPublicSquareErrorStatus(err) }
    )
  }
}
