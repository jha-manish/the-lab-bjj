export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import {
  findOrCreateCustomer,
  getPublicSquareErrorMessage,
  getPublicSquareErrorStatus,
  LOCATION_ID,
  squareFetch,
  throwSquareApiError,
  validateMembershipCheckout,
} from '@/lib/square'

function getTodayInToronto() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) throw new Error('Unable to determine invoice date')

  return `${year}-${month}-${day}`
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sourceId: string
      customerName: string
      customerEmail: string
      customerPhone: string
      itemVariationId: string
      discountId?: string
    }

    const { sourceId, customerName, customerEmail, customerPhone, itemVariationId, discountId } = body
    if (!sourceId || !customerName || !customerEmail || !customerPhone || !itemVariationId) {
      return NextResponse.json({ error: 'Missing required invoice fields' }, { status: 400 })
    }

    let checkout: Awaited<ReturnType<typeof validateMembershipCheckout>>
    try {
      checkout = await validateMembershipCheckout(itemVariationId, discountId)
    } catch (err) {
      console.error('Square invoice membership validation error:', err)
      return NextResponse.json(
        { error: 'We could not verify that membership selection. Please refresh the page and try again.' },
        { status: 400 }
      )
    }

    const customerId = await findOrCreateCustomer(customerEmail, customerName, customerPhone)
    if (!customerId) throw new Error('Unable to create customer')

    const cardRes = await squareFetch('/cards', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        source_id: sourceId,
        card: {
          customer_id: customerId,
        },
      }),
    })

    if (!cardRes.ok) {
      await throwSquareApiError(
        cardRes,
        'Card on file failed',
        'We could not verify that card. Please check the card details and try again, or use a different card.'
      )
    }

    const cardData = (await cardRes.json()) as { card?: { id?: string } }
    const cardId = cardData.card?.id
    if (!cardId) throw new Error('No card returned')

    const orderRes = await squareFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        order: {
          location_id: LOCATION_ID,
          customer_id: customerId,
          state: 'OPEN',
          line_items: [
            {
              catalog_object_id: itemVariationId,
              quantity: checkout.quantityString,
            },
          ],
          ...(checkout.discount ? {
            discounts: [
              {
                catalog_object_id: checkout.discount.id,
                scope: 'ORDER',
              },
            ],
          } : {}),
        },
      }),
    })

    if (!orderRes.ok) {
      await throwSquareApiError(
        orderRes,
        'Invoice order failed',
        'We could not create the membership invoice. Please try again in a moment or contact us for help.'
      )
    }

    const orderData = (await orderRes.json()) as { order?: { id?: string } }
    const orderId = orderData.order?.id
    if (!orderId) throw new Error('No order returned')

    const invoiceDate = getTodayInToronto()
    const invoiceRes = await squareFetch('/invoices', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        invoice: {
          location_id: LOCATION_ID,
          order_id: orderId,
          primary_recipient: {
            customer_id: customerId,
          },
          delivery_method: 'EMAIL',
          title: `${checkout.membershipName} Membership`,
          description: `${checkout.discount ? 'Pre-paid' : 'Monthly'} membership created from The Jiu-Jitsu Lab website.`,
          sale_or_service_date: invoiceDate,
          payment_requests: [
            {
              request_type: 'BALANCE',
              due_date: invoiceDate,
              automatic_payment_source: 'CARD_ON_FILE',
              card_id: cardId,
            },
          ],
          accepted_payment_methods: {
            card: true,
          },
        },
      }),
    })

    if (!invoiceRes.ok) {
      await throwSquareApiError(
        invoiceRes,
        'Invoice failed',
        'We could not create the membership invoice. Please try again in a moment or contact us for help.'
      )
    }

    const invoiceData = (await invoiceRes.json()) as { invoice?: { id?: string; version?: number } }
    const invoiceId = invoiceData.invoice?.id
    const invoiceVersion = invoiceData.invoice?.version
    if (!invoiceId || invoiceVersion === undefined) throw new Error('No invoice returned')

    const publishRes = await squareFetch(`/invoices/${invoiceId}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        version: invoiceVersion,
      }),
    })

    if (!publishRes.ok) {
      await throwSquareApiError(
        publishRes,
        'Invoice publish failed',
        'We could not send the membership invoice. Please try again in a moment or contact us for help.'
      )
    }

    const publishedInvoiceData = (await publishRes.json()) as { invoice?: { id?: string } }
    return NextResponse.json({
      invoice: publishedInvoiceData.invoice,
      orderId,
    })
  } catch (err) {
    console.error('Square invoice error:', err)
    return NextResponse.json(
      { error: getPublicSquareErrorMessage(err, 'We could not set up the membership invoice. Please try again in a moment or contact us for help.') },
      { status: getPublicSquareErrorStatus(err) }
    )
  }
}
