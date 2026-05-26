'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SquarePayments>
    }
  }
}

interface SquarePayments {
  card: () => Promise<SquareCard>
}

interface SquareCard {
  attach: (selector: string) => Promise<void>
  tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>
  destroy: () => void
}

interface CatalogVariation {
  id: string
  type: string
  version: string
  itemVariationData?: {
    name?: string
    priceMoney?: { amount: string; currency: string }
    serviceDuration?: string
    teamMemberIds?: string[]
  }
}

interface CatalogItem {
  id: string
  type: string
  version: string
  itemData?: {
    name?: string
    description?: string
    productType?: string
    variations?: CatalogVariation[]
  }
}

interface TimeSlot {
  startAt: string
  appointmentSegments?: { teamMemberId?: string; serviceVariationId?: string; serviceVariationVersion?: string }[]
}

type Category = 'privates' | 'dropins' | 'memberships' | 'merch'

const CATEGORY_META: Record<Category, { label: string; description: string; bookable: boolean }> = {
  privates: { label: 'Private Training', description: 'One-on-one coaching with an expert instructor', bookable: true },
  dropins: { label: 'Drop-In Classes', description: 'Single class access — no commitment required', bookable: true },
  memberships: { label: 'Memberships', description: 'Monthly or annual plans for unlimited training', bookable: false },
  merch: { label: 'Merch', description: 'Gear, rashguards, and academy apparel', bookable: false },
}

function formatPrice(amount: string | undefined, currency: string | undefined) {
  if (!amount) return 'Contact us'
  const dollars = parseInt(amount) / 100
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: currency ?? 'CAD' }).format(dollars)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function getNext7Days() {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

interface BookingFlowProps {
  /** Pre-select a category and skip the picker step */
  initialCategory?: Category
  /** Restrict which categories are shown in the picker */
  allowedCategories?: Category[]
  /** Hide prices and skip payment — just create the booking */
  freeTrial?: boolean
}

export default function BookingFlow({ initialCategory, allowedCategories, freeTrial }: BookingFlowProps) {
  const [step, setStep] = useState<'category' | 'service' | 'datetime' | 'details' | 'payment' | 'confirm'>(
    initialCategory ? 'service' : 'category'
  )
  const [category, setCategory] = useState<Category | null>(initialCategory ?? null)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<CatalogVariation | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cardReady, setCardReady] = useState(false)
  const [cardInstance, setCardInstance] = useState<SquareCard | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [confirmData, setConfirmData] = useState<{ id: string; startAt?: string } | null>(null)

  const bookable = category ? CATEGORY_META[category].bookable : false

  // Load catalog when category chosen
  useEffect(() => {
    if (!category) return
    setLoadingItems(true)
    fetch('/api/square/catalog')
      .then((r) => r.json())
      .then((data) => {
        const all: CatalogItem[] = data.items ?? []
        // Filter by product type based on category
        const filtered = all.filter((item) => {
          const pt = item.itemData?.productType ?? ''
          if (category === 'privates') return pt === 'APPOINTMENTS_SERVICE'
          if (category === 'dropins') return pt === 'APPOINTMENTS_SERVICE'
          if (category === 'memberships') return pt === 'REGULAR' || pt === ''
          if (category === 'merch') return pt === 'REGULAR' || pt === ''
          return true
        })
        setItems(filtered)
      })
      .catch(() => setError('Failed to load services'))
      .finally(() => setLoadingItems(false))
  }, [category])

  // Load slots when date selected
  useEffect(() => {
    if (!selectedVariation || !selectedDate || !bookable) return
    setLoadingSlots(true)
    setSlots([])
    const params = new URLSearchParams({
      serviceVariationId: selectedVariation.id,
      serviceVariationVersion: selectedVariation.version,
      startDate: selectedDate,
    })
    fetch(`/api/square/availability?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const now = new Date()
        const future = (data.availabilities ?? []).filter(
          (s: TimeSlot) => new Date(s.startAt) > now
        )
        setSlots(future)
      })
      .catch(() => setError('Failed to load times'))
      .finally(() => setLoadingSlots(false))
  }, [selectedVariation, selectedDate, bookable])

  // Mount Square Web Payments SDK card form
  useEffect(() => {
    if (step !== 'payment') return
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID!
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!

    const init = async () => {
      if (!window.Square) return
      try {
        const payments = await window.Square.payments(appId, locationId)
        const card = await payments.card()
        await card.attach('#square-card-container')
        setCardInstance(card)
        setCardReady(true)
      } catch (e) {
        console.error('Square card init error', e)
        setError('Failed to load payment form')
      }
    }

    if (window.Square) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = 'https://web.squarecdn.com/v1/square.js'
      script.onload = init
      document.head.appendChild(script)
    }

    return () => {
      cardInstance?.destroy()
      setCardInstance(null)
      setCardReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  async function handlePay() {
    if (!cardInstance) return
    setError('')
    setProcessing(true)
    try {
      const result = await cardInstance.tokenize()
      if (result.status !== 'OK' || !result.token) {
        setError(result.errors?.map((e) => e.message).join(', ') ?? 'Card error')
        setProcessing(false)
        return
      }

      const price = selectedVariation?.itemVariationData?.priceMoney
      const amountMoney = { amount: parseInt(price?.amount ?? '0'), currency: price?.currency ?? 'CAD' }

      if (bookable && selectedSlot) {
        const seg = selectedSlot.appointmentSegments?.[0]
        const res = await fetch('/api/square/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceVariationId: selectedVariation!.id,
            serviceVariationVersion: selectedVariation!.version,
            teamMemberId: seg?.teamMemberId ?? '',
            startAt: selectedSlot.startAt,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            sourceId: result.token,
            amountMoney,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setConfirmData({ id: data.booking.id, startAt: data.booking.startAt })
      } else {
        const res = await fetch('/api/square/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: result.token,
            amountMoney,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            note: `${CATEGORY_META[category!].label}: ${selectedItem?.itemData?.name} - ${selectedVariation?.itemVariationData?.name}`,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setConfirmData({ id: data.payment.id })
      }

      setStep('confirm')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  async function handleBook() {
    setError('')
    setProcessing(true)
    try {
      const seg = selectedSlot?.appointmentSegments?.[0]
      const res = await fetch('/api/square/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceVariationId: selectedVariation!.id,
          serviceVariationVersion: selectedVariation!.version,
          teamMemberId: seg?.teamMemberId ?? '',
          startAt: selectedSlot!.startAt,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConfirmData({ id: data.booking.id, startAt: data.booking.startAt })
      setStep('confirm')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Booking failed')
    } finally {
      setProcessing(false)
    }
  }

  // ── Step: Category ──────────────────────────────────────────────────────────
  if (step === 'category') {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-black">What are you looking for?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(CATEGORY_META) as Category[]).filter(cat => !allowedCategories || allowedCategories.includes(cat)).map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setStep('service') }}
              className="bg-zinc-900 border border-white/10 hover:border-teal-500 rounded-xl p-6 text-left transition-colors group"
            >
              <div className="font-black text-lg mb-1 group-hover:text-teal-400 transition-colors">
                {CATEGORY_META[cat].label}
              </div>
              <div className="text-gray-400 text-sm">{CATEGORY_META[cat].description}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step: Service ───────────────────────────────────────────────────────────
  if (step === 'service') {
    return (
      <div className="flex flex-col gap-6">
        {(!initialCategory || !freeTrial) && (
          <div className="flex items-center gap-3">
            {!initialCategory && (
              <button onClick={() => { setStep('category'); setCategory(null); setItems([]) }} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">← Back</button>
            )}
            <h2 className="text-2xl font-black">{category ? CATEGORY_META[category].label : ''}</h2>
          </div>
        )}

        {loadingItems && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loadingItems && items.length === 0 && !error && (
          <p className="text-gray-400">No services found. Please contact us directly.</p>
        )}

        {freeTrial ? (
          <div className="grid grid-cols-2 gap-3">
            {items.flatMap((item) =>
              (item.itemData?.variations ?? []).map((variation) => (
                <button
                  key={variation.id}
                  onClick={() => {
                    setSelectedItem(item)
                    setSelectedVariation(variation)
                    setStep('datetime')
                  }}
                  className="bg-zinc-900 border border-white/10 hover:border-teal-500 rounded-xl p-4 flex flex-col gap-3 text-left transition-colors group"
                >
                  <span className="font-black text-sm group-hover:text-teal-400 transition-colors leading-snug">
                    {item.itemData?.name}
                  </span>
                  {item.itemData?.description && (
                    <span className="text-gray-400 text-xs leading-relaxed line-clamp-3">{item.itemData.description}</span>
                  )}
                  <span className="mt-auto bg-teal-500 group-hover:bg-teal-400 text-black font-black text-sm px-3 py-2 rounded transition-colors text-center w-full">
                    Book
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                <div className="font-black text-lg mb-1">{item.itemData?.name}</div>
                {item.itemData?.description && (
                  <p className="text-gray-400 text-sm mb-4">{item.itemData.description}</p>
                )}
                <div className="flex flex-col gap-2">
                  {item.itemData?.variations?.map((variation) => (
                    <button
                      key={variation.id}
                      onClick={() => {
                        setSelectedItem(item)
                        setSelectedVariation(variation)
                        setStep(bookable ? 'datetime' : 'details')
                      }}
                      className="flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-teal-500 rounded-lg px-4 py-3 transition-colors text-left"
                    >
                      <span className="font-semibold">
                        {variation.itemVariationData?.name ?? 'Standard'}
                      </span>
                      <span className="text-teal-400 font-black">
                        {formatPrice(
                          variation.itemVariationData?.priceMoney?.amount,
                          variation.itemVariationData?.priceMoney?.currency
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Step: Date & Time ───────────────────────────────────────────────────────
  if (step === 'datetime') {
    const days = getNext7Days()
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('service')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">← Back</button>
          <h2 className="text-2xl font-black">Pick a Date & Time</h2>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3 text-gray-300">Select a date</p>
          <div className="flex gap-2 flex-wrap">
            {days.map((d) => {
              const iso = d.toISOString().split('T')[0]
              const isSelected = selectedDate === iso
              return (
                <button
                  key={iso}
                  onClick={() => { setSelectedDate(iso); setSelectedSlot(null) }}
                  className={`px-4 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'bg-teal-500 border-teal-500 text-black'
                      : 'bg-zinc-800 border-white/10 hover:border-teal-500'
                  }`}
                >
                  <div>{d.toLocaleDateString('en-CA', { weekday: 'short' })}</div>
                  <div>{d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div>
            <p className="text-sm font-semibold mb-3 text-gray-300">Available times</p>
            {loadingSlots && <p className="text-gray-400 text-sm">Loading times…</p>}
            {!loadingSlots && slots.length === 0 && (
              <p className="text-gray-400 text-sm">No availability on this day. Try another date.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {slots.map((slot, i) => {
                const isSelected = selectedSlot?.startAt === slot.startAt
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-teal-500 border-teal-500 text-black'
                        : 'bg-zinc-800 border-white/10 hover:border-teal-500'
                    }`}
                  >
                    {formatTime(slot.startAt)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          disabled={!selectedSlot}
          onClick={() => setStep('details')}
          className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black px-8 py-4 rounded text-lg transition-colors mt-2"
        >
          Continue →
        </button>
      </div>
    )
  }

  // ── Step: Customer Details ──────────────────────────────────────────────────
  if (step === 'details') {
    const prev = bookable ? 'datetime' : 'service'
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(prev)} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">← Back</button>
          <h2 className="text-2xl font-black">Your Details</h2>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-gray-300">
          <span className="text-white font-semibold">{selectedItem?.itemData?.name}</span>
          {selectedVariation?.itemVariationData?.name && (
            <span className="text-gray-400"> · {selectedVariation.itemVariationData.name}</span>
          )}
          {selectedSlot && (
            <span className="text-teal-400 ml-2">
              · {new Date(selectedSlot.startAt).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime(selectedSlot.startAt)}
            </span>
          )}
          {!freeTrial && (
            <span className="ml-2 font-black text-teal-400">
              {formatPrice(
                selectedVariation?.itemVariationData?.priceMoney?.amount,
                selectedVariation?.itemVariationData?.priceMoney?.currency
              )}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone *</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="(519) 000-0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="you@email.com"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          disabled={!name || !email || !phone || processing}
          onClick={freeTrial ? handleBook : () => setStep('payment')}
          className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black px-8 py-4 rounded text-lg transition-colors"
        >
          {freeTrial
            ? (processing ? 'Booking…' : 'Book My Free Trial →')
            : 'Continue to Payment →'}
        </button>
      </div>
    )
  }

  // ── Step: Payment ───────────────────────────────────────────────────────────
  if (step === 'payment') {
    const price = selectedVariation?.itemVariationData?.priceMoney
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('details')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">← Back</button>
          <h2 className="text-2xl font-black">Payment</h2>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-gray-300 flex items-center justify-between">
          <div>
            <span className="text-white font-semibold">{selectedItem?.itemData?.name}</span>
            {selectedVariation?.itemVariationData?.name && (
              <span className="text-gray-400"> · {selectedVariation.itemVariationData.name}</span>
            )}
          </div>
          <span className="font-black text-teal-400 text-base">
            {formatPrice(price?.amount, price?.currency)}
          </span>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-semibold mb-2">Card Details</label>
          <div
            id="square-card-container"
            className="bg-zinc-800 border border-white/10 rounded px-4 py-3 min-h-[56px]"
          />
          {!cardReady && <p className="text-gray-500 text-xs mt-2">Loading secure card form…</p>}
        </div>

        <button
          disabled={!cardReady || processing}
          onClick={handlePay}
          className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black px-8 py-4 rounded text-lg transition-colors"
        >
          {processing ? 'Processing…' : `Pay ${formatPrice(price?.amount, price?.currency)} →`}
        </button>

        <p className="text-gray-500 text-xs text-center flex items-center justify-center gap-1">
          <span>🔒</span> Secured by Square. Your card details never touch our server.
        </p>
      </div>
    )
  }

  // ── Step: Confirm ───────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center text-3xl">✓</div>
        <h2 className="text-3xl font-black">
          {bookable ? 'Booking Confirmed!' : 'Order Confirmed!'}
        </h2>
        <p className="text-gray-400 max-w-sm">
          {bookable
            ? `You're booked for ${selectedItem?.itemData?.name}${selectedSlot ? ` on ${new Date(selectedSlot.startAt).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })} at ${formatTime(selectedSlot.startAt)}` : ''}. We'll email a confirmation to ${email}.`
            : `Your order is confirmed. We'll email a receipt to ${email}.`}
        </p>
        {confirmData?.id && (
          <p className="text-gray-500 text-xs">Reference: {confirmData.id}</p>
        )}
        <a
          href="/"
          className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors mt-2"
        >
          Back to Home
        </a>
      </div>
    )
  }

  return null
}
