import Link from 'next/link'
import type { Metadata } from 'next'
import BookingFlow from '@/components/BookingFlow'
import { fetchCatalogDiscounts, fetchCatalogItems, isWebsiteMembershipItem, type CatalogDiscount } from '@/lib/square'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Memberships | The Jiu-Jitsu Lab Waterloo',
  description: 'BJJ memberships in Waterloo, ON. Adult unlimited from $135/month. Student and Kids rates available. First week free — no commitment.',
  alternates: { canonical: 'https://labjiujitsu.com/memberships' },
  openGraph: { url: 'https://labjiujitsu.com/memberships' },
}

const PREPAID_MEMBERSHIP_DISCOUNT_RE = /^(\d+)\s+(day|week|month|year)s?\s+pre-paid membership$/i
const DAYS_PER_MONTH = 365.2425 / 12

function fmt(n: number) {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`
}

function fmtCents(cents: number) {
  return fmt(cents / 100)
}

function fmtMonthlyPrice(cents: number) {
  return cents > 0 ? fmtCents(cents) : 'Contact us'
}

type CatalogItems = Awaited<ReturnType<typeof fetchCatalogItems>>
type MembershipFlowCategory = 'memberships' | 'privates'
type DurationUnit = 'day' | 'week' | 'month' | 'year'

function durationMonths(quantity: number, unit: DurationUnit) {
  if (unit === 'day') return quantity / DAYS_PER_MONTH
  if (unit === 'week') return (quantity * 7) / DAYS_PER_MONTH
  if (unit === 'year') return quantity * 12
  return quantity
}

function durationLabel(quantity: number, unit: DurationUnit) {
  const label = unit[0].toUpperCase() + unit.slice(1)
  return `${quantity} ${label}${quantity === 1 ? '' : 's'}`
}

function planDurationLabel(quantity: number, unit: DurationUnit) {
  const label = unit[0].toUpperCase() + unit.slice(1)
  return `${quantity} ${label}`
}

function formatDiscountBadge(discount: CatalogDiscount) {
  if (discount.percentage && discount.percentage > 0) {
    return `${discount.percentage % 1 === 0 ? discount.percentage : discount.percentage.toFixed(2)}% off`
  }

  if (discount.amountCents && discount.amountCents > 0) {
    return `${fmtCents(discount.amountCents)} off`
  }

  return 'Pre-paid'
}

function applyDiscount(totalCents: number, discount: CatalogDiscount) {
  if (discount.percentage && discount.percentage > 0) {
    return Math.max(0, Math.round(totalCents * (1 - discount.percentage / 100)))
  }

  if (discount.amountCents && discount.amountCents > 0) {
    return Math.max(0, totalCents - discount.amountCents)
  }

  return totalCents
}

function getPrepaidMembershipDiscounts(discounts: CatalogDiscount[]) {
  return discounts
    .map((discount) => {
      const match = discount.name.match(PREPAID_MEMBERSHIP_DISCOUNT_RE)
      if (!match) return undefined

      const quantity = parseInt(match[1], 10)
      const unit = match[2].toLowerCase() as DurationUnit
      const months = durationMonths(quantity, unit)

      return {
        ...discount,
        quantity,
        unit,
        months,
        label: durationLabel(quantity, unit),
        planLabel: planDurationLabel(quantity, unit),
        badge: formatDiscountBadge(discount),
        popular: Math.abs(months - 6) < 0.01,
      }
    })
    .filter((discount): discount is NonNullable<typeof discount> => Boolean(discount))
    .sort((a, b) => a.months - b.months)
}

function getMembershipDurationMonths(serviceDuration: string | undefined) {
  if (!serviceDuration) return 1

  const durationMs = parseInt(serviceDuration, 10)
  if (!Number.isFinite(durationMs)) return 1

  const dayMs = 24 * 60 * 60 * 1000
  return durationMs >= dayMs ? durationMs / (DAYS_PER_MONTH * dayMs) : 1
}

function getMemberships(items: CatalogItems) {
  return items.filter(isWebsiteMembershipItem).map((item) => {
    const attrs = item.itemData.websiteCustomAttributes
    const variation = item.itemData.variations[0]
    const amount = variation?.itemVariationData?.priceMoney?.amount
    const currency = variation?.itemVariationData?.priceMoney?.currency ?? 'CAD'
    const priceCents = amount ? parseInt(amount, 10) : 0

    return {
      id: item.id,
      variationId: variation?.id,
      variationName: variation?.itemVariationData?.name,
      amount,
      currency,
      name: attrs.name!,
      priceCents,
      durationMonths: getMembershipDurationMonths(variation?.itemVariationData?.serviceDuration),
      highlight: attrs.emphasis ?? false,
      who: attrs.description!.descriptionText,
      includes: attrs.description!.includes,
    }
  })
}

function getMembershipHref(membership: ReturnType<typeof getMemberships>[number]) {
  const params = new URLSearchParams({
    category: 'memberships',
    itemId: membership.id,
    membership: membership.name,
  })

  if (membership.variationId) params.set('variationId', membership.variationId)
  if (membership.variationName) params.set('variation', membership.variationName)
  if (membership.amount) params.set('amount', membership.amount)

  return `/memberships?${params.toString()}`
}

function getPrepaidMembershipHref(membership: ReturnType<typeof getMemberships>[number], discount: ReturnType<typeof getPrepaidMembershipDiscounts>[number]) {
  const params = new URLSearchParams({
    category: 'memberships',
    itemId: membership.id,
    membership: membership.name,
    prepaidDiscountId: discount.id,
  })

  if (membership.variationId) params.set('variationId', membership.variationId)
  if (membership.variationName) params.set('variation', membership.variationName)
  if (membership.amount) params.set('amount', membership.amount)

  return `/memberships?${params.toString()}`
}

function getFlowCategory(
  category: string | undefined,
  params: Awaited<MembershipsPageProps['searchParams']>
): MembershipFlowCategory | undefined {
  if (category === 'privates') return category
  if (category === 'memberships' && (params?.itemId || params?.membership)) return category
  if (params?.itemId || params?.membership) return 'memberships'
  return undefined
}

interface MembershipsPageProps {
  searchParams?: Promise<{
    category?: string
    itemId?: string
    membership?: string
    variationId?: string
    variation?: string
    amount?: string
    prepaidDiscountId?: string
  }>
}

async function getCatalogItems() {
  try {
    return await fetchCatalogItems()
  } catch (err) {
    console.error('Square memberships catalog error:', err)
    return undefined
  }
}

async function getCatalogDiscounts() {
  try {
    return await fetchCatalogDiscounts()
  } catch (err) {
    console.error('Square discounts catalog error:', err)
    return []
  }
}

const extras = [
  {
    title: 'Drop-In',
    price: '$20/class',
    desc: 'No membership required. Pay per class and show up whenever it works for you.',
    cta: 'Book a Class',
    href: '/book',
  },
  {
    title: 'Private Lessons',
    price: 'By quote',
    desc: 'One-on-one with any of our world-level coaches. Fastest way to improve — perfect for beginners wanting a head start or competitors fixing specific weaknesses.',
    cta: 'Find a Coach',
    href: '/memberships?category=privates',
  },
]

export default async function MembershipsPage({ searchParams }: MembershipsPageProps) {
  const params = await searchParams
  const [catalogItems, catalogDiscounts] = await Promise.all([getCatalogItems(), getCatalogDiscounts()])
  const flowCategory = getFlowCategory(params?.category, params)
  const memberships = catalogItems ? getMemberships(catalogItems) : []
  const prepaidDiscounts = getPrepaidMembershipDiscounts(catalogDiscounts)
  const membershipBases = memberships
    .filter((membership) => membership.priceCents > 0)
    .map((membership) => ({
      name: membership.name,
      monthlyCents: membership.priceCents / membership.durationMonths,
      currency: membership.currency,
      membership,
    }))
  const selectedPrepaidDiscount = prepaidDiscounts.find((discount) => discount.id === params?.prepaidDiscountId)
  const selectedPrepaidMembership = selectedPrepaidDiscount
    ? memberships.find((membership) =>
      membership.id === params?.itemId ||
      membership.variationId === params?.variationId ||
      membership.name === params?.membership
    )
    : undefined
  const prepaidRegularAmountCents =
    selectedPrepaidDiscount && selectedPrepaidMembership
      ? Math.round((selectedPrepaidMembership.priceCents / selectedPrepaidMembership.durationMonths) * selectedPrepaidDiscount.months)
      : undefined
  const prepaidTotalAmountCents =
    prepaidRegularAmountCents !== undefined && selectedPrepaidDiscount
      ? applyDiscount(prepaidRegularAmountCents, selectedPrepaidDiscount)
      : undefined
  const initialPrepaidPurchase =
    selectedPrepaidDiscount && selectedPrepaidMembership?.variationId && prepaidRegularAmountCents !== undefined && prepaidTotalAmountCents !== undefined
      ? {
          variationId: selectedPrepaidMembership.variationId,
          discountId: selectedPrepaidDiscount.id,
          label: selectedPrepaidDiscount.planLabel,
          recurrenceLabel: `every ${selectedPrepaidDiscount.label.toLowerCase()}`,
          regularAmountCents: prepaidRegularAmountCents,
          totalAmountCents: prepaidTotalAmountCents,
          currency: selectedPrepaidMembership.currency,
        }
      : undefined

  if (flowCategory) {
    return (
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-8">
            <BookingFlow
              initialCatalogItems={catalogItems}
              allowedCategories={[flowCategory]}
              initialCategory={flowCategory}
              initialItemId={params?.itemId}
              initialItemName={params?.membership}
              initialVariationId={params?.variationId}
              initialVariationName={params?.variation}
              initialAmount={params?.amount}
              initialPrepaidPurchase={initialPrepaidPurchase}
              returnHref="/memberships"
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Join The Lab</p>
          <h1 className="text-5xl font-black mb-4">Memberships & <span className="text-teal-400">Programs</span></h1>
          <p className="text-gray-400 max-w-2xl mb-10 leading-relaxed">
            No hidden fees. No long-term contracts required. Every membership gives you access to world-class instruction every day of the week.
          </p>

          {/* Free Trial */}
          <div className="mb-16 bg-zinc-900 border border-teal-500/30 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold mb-1">🎁 First Week Free</p>
              <p className="text-gray-400 text-sm">No credit card required. Just show up and roll.</p>
            </div>
            <Link href="/book" className="shrink-0 bg-teal-500 hover:bg-teal-400 text-black font-bold px-6 py-3 rounded transition-colors whitespace-nowrap">
              Book Your Free Trial →
            </Link>
          </div>

          {/* Membership cards */}
          <div id="memberships" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
            {memberships.length === 0 && (
              <div className="lg:col-span-3 bg-zinc-900 border border-white/10 rounded-xl p-6 text-gray-400">
                Memberships are unavailable right now. Please contact us directly to get started.
              </div>
            )}
            {memberships.map(m => (
              <div
                key={m.name}
                className={`rounded-xl border flex flex-col overflow-hidden ${m.highlight ? 'border-teal-500' : 'border-white/10'}`}
              >
                {/* Header */}
                <div className={`px-6 py-5 ${m.highlight ? 'bg-teal-500' : 'bg-zinc-800'}`}>
                  <p className={`text-sm font-semibold mb-1 ${m.highlight ? 'text-black/70' : 'text-teal-400'}`}>{m.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${m.highlight ? 'text-black' : 'text-white'}`}>{fmtMonthlyPrice(m.priceCents)}</span>
                    {m.priceCents > 0 && (
                      <span className={`text-sm ${m.highlight ? 'text-black/60' : 'text-gray-500'}`}>/month</span>
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${m.highlight ? 'text-black/70' : 'text-gray-400'}`}>{m.who}</p>
                </div>

                {/* Includes */}
                <div className="bg-zinc-900 px-6 py-5 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">What&apos;s included</p>
                  <ul className="flex flex-col gap-2">
                    {m.includes.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-teal-400 mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-zinc-900 px-6 pb-6 pt-4 border-t border-white/5">
                  <Link
                    href={getMembershipHref(m)}
                    className={`block text-center font-black text-sm px-4 py-3 rounded transition-colors ${
                      m.highlight
                        ? 'bg-teal-500 hover:bg-teal-400 text-black'
                        : 'bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white'
                    }`}
                  >
                    Get Started →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Commitment Plans */}
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Save More</p>
          <h2 className="text-4xl font-black mb-3">Commitment <span className="text-teal-400">Plans</span></h2>
          <p className="text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Pay upfront and save. Applies to Adult, Student, and Kids memberships.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {prepaidDiscounts.length === 0 && (
              <div className="md:col-span-3 bg-zinc-900 border border-white/10 rounded-xl p-6 text-gray-400">
                Pre-paid membership plans are unavailable right now. Please contact us directly to get started.
              </div>
            )}
            {prepaidDiscounts.map((discount) => (
              <div
                key={discount.id}
                className={`rounded-xl border flex flex-col overflow-hidden ${discount.popular ? 'border-teal-500' : 'border-white/10'}`}
              >
                <div className={`px-6 py-4 flex items-center justify-between ${discount.popular ? 'bg-teal-500' : 'bg-zinc-800'}`}>
                  <span className={`font-black text-lg ${discount.popular ? 'text-black' : 'text-white'}`}>{discount.label}</span>
                  <span className={`text-xs font-black px-2 py-1 rounded ${discount.popular ? 'bg-black/20 text-black' : 'bg-teal-500/20 text-teal-400'}`}>
                    {discount.badge}
                  </span>
                </div>
                <div className="bg-zinc-900 flex flex-col divide-y divide-white/5 flex-1">
                  {membershipBases.map((mp) => {
                    const totalCents = applyDiscount(mp.monthlyCents * discount.months, discount)
                    const perMonthCents = totalCents / discount.months
                    return (
                      <Link
                        key={mp.name}
                        href={getPrepaidMembershipHref(mp.membership, discount)}
                        className="block px-6 py-4 text-left transition-colors hover:bg-zinc-800/70 focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                      >
                        <p className="text-sm text-gray-400 mb-1">{mp.name}</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-white">{fmtCents(totalCents)}</span>
                          <span className="text-sm text-gray-500">{fmtCents(perMonthCents)}/mo</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Drop-in & Private */}
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Other Options</p>
          <h2 className="text-4xl font-black mb-10">Drop-In & <span className="text-teal-400">Privates</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {extras.map(e => (
              <div key={e.title} className="bg-zinc-900 border border-white/10 rounded-xl p-6 hover:border-teal-500/40 transition-colors flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{e.title}</h3>
                  <span className="text-teal-400 font-black text-lg">{e.price}</span>
                </div>
                <p className="text-gray-400 leading-relaxed flex-1 mb-5">{e.desc}</p>
                <Link
                  href={e.href}
                  className="inline-block text-center bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-bold text-sm px-4 py-3 rounded transition-colors"
                >
                  {e.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-500 py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-black">Not sure where to start?</h2>
            <p className="text-black/70 mt-1">Book a free trial and we&apos;ll match you to the right class.</p>
          </div>
          <Link href="/book" className="bg-black hover:bg-zinc-800 text-white font-black px-8 py-4 rounded text-lg transition-colors whitespace-nowrap">
            BOOK FREE TRIAL →
          </Link>
        </div>
      </section>
    </>
  )
}
