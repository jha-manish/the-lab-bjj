export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import {
  findOrCreateCustomer,
  saveCardOnFile,
  createSquareSubscription,
  getPublicSquareErrorMessage,
  getPublicSquareErrorStatus,
} from '@/lib/square'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sourceId: string
      planVariationId: string
      customerName: string
      customerEmail: string
      customerPhone: string
    }

    const { sourceId, planVariationId, customerName, customerEmail, customerPhone } = body

    if (!sourceId || !planVariationId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const customerId = await findOrCreateCustomer(customerEmail, customerName, customerPhone)
    if (!customerId) throw new Error('Could not create customer')

    const cardId = await saveCardOnFile(customerId, sourceId)
    const subscription = await createSquareSubscription({ customerId, planVariationId, cardId })

    return NextResponse.json({ subscription })
  } catch (err) {
    console.error('Square subscription signup error:', err)
    return NextResponse.json(
      {
        error: getPublicSquareErrorMessage(
          err,
          'We could not complete your subscription signup. Please try again or contact us for help.'
        ),
      },
      { status: getPublicSquareErrorStatus(err) }
    )
  }
}
