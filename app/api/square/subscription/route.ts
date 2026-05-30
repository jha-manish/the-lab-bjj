export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchCatalogSubscriptionPlanVariations,
  findOrCreateCustomer,
  LOCATION_ID,
  squareFetch,
  validateMembershipCheckout,
} from '@/lib/square'

type DurationUnit = 'day' | 'week' | 'month' | 'year'

function getCadence(quantity: number, unit: DurationUnit) {
  if (unit === 'day') {
    if (quantity === 1) return 'DAILY'
    if (quantity === 30) return 'THIRTY_DAYS'
    if (quantity === 60) return 'SIXTY_DAYS'
    if (quantity === 90) return 'NINETY_DAYS'
    return undefined
  }

  if (unit === 'week') {
    if (quantity === 1) return 'WEEKLY'
    if (quantity === 2) return 'EVERY_TWO_WEEKS'
    return undefined
  }

  if (unit === 'month') {
    if (quantity === 1) return 'MONTHLY'
    if (quantity === 2) return 'EVERY_TWO_MONTHS'
    if (quantity === 3) return 'QUARTERLY'
    if (quantity === 4) return 'EVERY_FOUR_MONTHS'
    if (quantity === 6) return 'EVERY_SIX_MONTHS'
    return undefined
  }

  if (quantity === 1) return 'ANNUAL'
  if (quantity === 2) return 'EVERY_TWO_YEARS'
  return undefined
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
      return NextResponse.json({ error: 'Missing required subscription fields' }, { status: 400 })
    }

    let checkout: Awaited<ReturnType<typeof validateMembershipCheckout>>
    try {
      checkout = await validateMembershipCheckout(itemVariationId, discountId)
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid membership checkout' },
        { status: 400 }
      )
    }

    const planVariations = await fetchCatalogSubscriptionPlanVariations()

    const cadence = getCadence(checkout.duration.quantity, checkout.duration.unit)
    if (!cadence) return NextResponse.json({ error: 'Unsupported membership recurrence period' }, { status: 400 })

    const planVariation = planVariations.find((catalogPlanVariation) =>
      catalogPlanVariation.phases.some((phase) => phase.cadence === cadence && phase.pricingType === 'RELATIVE')
    )
    const planPhase = planVariation?.phases.find((phase) => phase.cadence === cadence && phase.pricingType === 'RELATIVE')
    if (!planVariation) {
      return NextResponse.json(
        { error: `No Square subscription plan variation found for ${cadence} billing` },
        { status: 500 }
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

    if (!cardRes.ok) throw new Error(`Card on file failed: ${await cardRes.text()}`)

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
          state: 'DRAFT',
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

    if (!orderRes.ok) throw new Error(`Order template failed: ${await orderRes.text()}`)

    const orderData = (await orderRes.json()) as { order?: { id?: string } }
    const orderTemplateId = orderData.order?.id
    if (!orderTemplateId) throw new Error('No order template returned')

    const subscriptionRes = await squareFetch('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        location_id: LOCATION_ID,
        plan_variation_id: planVariation.id,
        customer_id: customerId,
        card_id: cardId,
        timezone: 'America/Toronto',
        source: {
          name: 'The Jiu-Jitsu Lab website',
        },
        phases: [
          {
            ordinal: planPhase?.ordinal ?? 0,
            order_template_id: orderTemplateId,
          },
        ],
      }),
    })

    if (!subscriptionRes.ok) throw new Error(`Subscription failed: ${await subscriptionRes.text()}`)

    const subscriptionData = (await subscriptionRes.json()) as { subscription?: { id?: string } }
    return NextResponse.json({
      subscription: subscriptionData.subscription,
      orderTemplateId,
    })
  } catch (err) {
    console.error('Square subscription error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Subscription failed' },
      { status: 500 }
    )
  }
}
