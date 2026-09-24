'use client'

import { useEffect, useRef, useState } from 'react'
import type { SubscriptionPlanVariation } from '@/lib/square'

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
  tokenize: (verificationDetails?: unknown) => Promise<{ status: string; token?: string; errors?: { message: string }[] }>
  destroy: () => void
}

const CARD_VERIFICATION_ERROR_MESSAGE = 'We could not verify your card. Please check the details and try again.'

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: currency || 'CAD' }).format(cents / 100)
}

const CADENCE_LABELS: Record<string, string> = {
  WEEKLY: 'week',
  EVERY_TWO_WEEKS: '2 weeks',
  MONTHLY: 'month',
  EVERY_TWO_MONTHS: '2 months',
  QUARTERLY: 'quarter',
  EVERY_FOUR_MONTHS: '4 months',
  EVERY_SIX_MONTHS: '6 months',
  ANNUAL: 'year',
}

function formatCadence(cadence: string) {
  return CADENCE_LABELS[cadence] ?? cadence.toLowerCase().replace(/_/g, ' ')
}

type Step = 'plan' | 'details' | 'confirm'

export default function SubscriptionSignup({ plans }: { plans: SubscriptionPlanVariation[] }) {
  const [step, setStep] = useState<Step>('plan')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanVariation | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [cardInstance, setCardInstance] = useState<SquareCard | null>(null)
  const [cardReady, setCardReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmedSubscriptionId, setConfirmedSubscriptionId] = useState<string | null>(null)

  const stepRef = useRef<HTMLDivElement>(null)

  // Mount Square Web Payments SDK card form once we're on the details step
  useEffect(() => {
    if (step !== 'details') return
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID!
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!

    let cancelled = false
    let localCard: SquareCard | null = null

    const init = async () => {
      if (!window.Square) return
      try {
        const payments = await window.Square.payments(appId, locationId)
        const card = await payments.card()
        await card.attach('#subscription-card-container')
        if (cancelled) {
          card.destroy()
          return
        }
        localCard = card
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
      cancelled = true
      localCard?.destroy()
      setCardInstance(null)
      setCardReady(false)
    }
  }, [step])

  function scrollToStep() {
    requestAnimationFrame(() => stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function selectPlan(plan: SubscriptionPlanVariation) {
    setSelectedPlan(plan)
    setError('')
    setStep('details')
    scrollToStep()
  }

  async function handleSubmit() {
    if (!cardInstance || !selectedPlan) return
    if (!form.name || !form.email || !form.phone || submitting) return
    setSubmitting(true)
    setError('')

    try {
      const [givenName, ...rest] = form.name.trim().split(' ')
      const mainPhase = selectedPlan.phases[selectedPlan.phases.length - 1]

      let result: Awaited<ReturnType<SquareCard['tokenize']>>
      try {
        result = await cardInstance.tokenize({
          intent: 'STORE',
          amount: (mainPhase.priceCents / 100).toFixed(2),
          currencyCode: mainPhase.currency || 'CAD',
          customerInitiated: true,
          sellerKeyedIn: false,
          billingContact: {
            givenName,
            familyName: rest.join(' '),
            email: form.email,
            phone: form.phone,
          },
        })
      } catch (tokenizeError) {
        console.error('Square card tokenization error', tokenizeError)
        setError(CARD_VERIFICATION_ERROR_MESSAGE)
        setSubmitting(false)
        return
      }

      if (result.status !== 'OK' || !result.token) {
        setError(CARD_VERIFICATION_ERROR_MESSAGE)
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/square/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          planVariationId: selectedPlan.id,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
        }),
      })
      const data = (await res.json()) as { subscription?: { id: string }; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Something went wrong')

      setConfirmedSubscriptionId(data.subscription!.id)
      setStep('confirm')
      scrollToStep()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('plan')
    setSelectedPlan(null)
    setForm({ name: '', email: '', phone: '' })
    setConfirmedSubscriptionId(null)
  }

  if (plans.length === 0) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 text-gray-400">
        Subscriptions aren&apos;t set up yet — check back soon, or contact us to get started.
      </div>
    )
  }

  return (
    <div>
      {step === 'plan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const trialPhase = plan.phases.length > 1 ? plan.phases[0] : undefined
            const mainPhase = plan.phases[plan.phases.length - 1]
            return (
              <button
                key={plan.id}
                onClick={() => selectPlan(plan)}
                className="text-left bg-zinc-900 border border-white/10 hover:border-teal-500/50 rounded-xl p-6 flex flex-col gap-3 transition-all"
              >
                <h3 className="font-black text-lg text-white">{plan.planName ?? plan.name}</h3>
                {trialPhase && (
                  <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 font-semibold">
                    {trialPhase.priceCents === 0 ? 'Free' : formatCents(trialPhase.priceCents, trialPhase.currency)} for{' '}
                    {trialPhase.periods} {formatCadence(trialPhase.cadence)}
                    {(trialPhase.periods ?? 0) > 1 ? 's' : ''}, then:
                  </p>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{formatCents(mainPhase.priceCents, mainPhase.currency)}</span>
                  <span className="text-sm text-gray-500">/{formatCadence(mainPhase.cadence)}</span>
                </div>
                <div className="mt-2 text-center bg-teal-500/10 text-teal-400 border border-teal-500/30 font-black text-sm px-4 py-2.5 rounded">
                  Subscribe →
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div ref={stepRef} className="scroll-mt-24">
        {step === 'details' && selectedPlan && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep('plan')}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Subscribing to</p>
                <p className="font-black text-white">{selectedPlan.planName ?? selectedPlan.name}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(226) 555-0100"
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Card</label>
                <div id="subscription-card-container" className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 min-h-[44px]" />
              </div>

              {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting || !cardReady || !form.name || !form.email || !form.phone}
                className="mt-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-6 py-3 rounded-lg text-base transition-colors"
              >
                {submitting ? 'Setting up…' : 'Start Subscription →'}
              </button>
              <p className="text-gray-600 text-xs text-center">Your card is saved securely with Square — billed automatically each cycle.</p>
            </div>
          </div>
        )}

        {step === 'confirm' && selectedPlan && (
          <div className="bg-zinc-900 border border-teal-500/30 rounded-xl p-8 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-teal-400 text-3xl">✓</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">You&apos;re subscribed!</h3>
            <p className="text-gray-400 mb-2 leading-relaxed">
              Your card is saved and your <span className="text-white font-semibold">{selectedPlan.planName ?? selectedPlan.name}</span>{' '}
              subscription is active. You&apos;ll be billed automatically each cycle.
            </p>
            <p className="text-gray-600 text-xs mb-6">Reference: {confirmedSubscriptionId}</p>
            <button onClick={reset} className="text-teal-400 hover:text-teal-300 font-semibold text-sm transition-colors">
              Set up another subscription
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
