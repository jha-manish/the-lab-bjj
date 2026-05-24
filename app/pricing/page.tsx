import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | The Jiu-Jitsu Lab Waterloo',
  description: 'BJJ membership pricing in Waterloo, ON. Adult unlimited from $135/month. Student and Kids rates available. First week free.',
}

const plans = [
  {
    name: 'Adult Unlimited',
    price: '$135',
    period: '/month',
    desc: 'Unlimited access to all adult classes — Gi, No-Gi, Open Mat, and more.',
    highlight: true,
    cta: 'Get Started',
    href: '/shop',
  },
  {
    name: 'Student Rate',
    price: '$119',
    period: '/month',
    desc: 'Valid UW or Laurier student ID required. Unlimited classes.',
    highlight: false,
    cta: 'Get Started',
    href: '/shop',
  },
  {
    name: 'Kids BJJ',
    price: '$120',
    period: '/month',
    desc: 'Unlimited Kids BJJ classes for ages 5–15.',
    highlight: false,
    cta: 'Get Started',
    href: '/shop',
  },
  {
    name: 'Drop-In',
    price: '$20',
    period: '/class',
    desc: 'Single class drop-in. No membership required.',
    highlight: false,
    cta: 'Book a Class',
    href: '/book',
  },
]

// Commitment tiers: [months, discount]
const commitmentTiers = [
  { months: 3,  discount: 0.10, label: '3 Months', badge: '10% off' },
  { months: 6,  discount: 0.15, label: '6 Months', badge: '15% off' },
  { months: 12, discount: 0.20, label: '1 Year',   badge: '20% off' },
]

// Monthly base rates for membership plans
const membershipPlans = [
  { name: 'Adult Unlimited', monthly: 135 },
  { name: 'Student Rate',    monthly: 119 },
  { name: 'Kids BJJ',        monthly: 120 },
]

function fmt(n: number) {
  // Show .50 if half-dollar, otherwise whole number
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`
}

export default function PricingPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Transparent Pricing</p>
          <h1 className="text-5xl font-black mb-4">Membership <span className="text-teal-400">Plans</span></h1>
          <p className="text-gray-400 max-w-2xl mb-10 leading-relaxed">
            No hidden fees. No long-term contracts required. Your first week is always free.
          </p>

          {/* Free Trial */}
          <div className="mb-12 bg-zinc-900 border border-teal-500/30 rounded-xl p-6 max-w-xl">
            <p className="text-xl font-bold mb-2">🎁 Free Trial Week</p>
            <p className="text-gray-400">Every new member gets their first week completely free. No credit card required. Just show up.</p>
            <Link href="/book" className="inline-block mt-4 bg-teal-500 hover:bg-teal-400 text-black font-bold px-6 py-3 rounded transition-colors">
              Book Your Free Trial
            </Link>
          </div>

          {/* Monthly plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {plans.map(p => (
              <div key={p.name} className={`rounded-xl p-6 border flex flex-col transition-colors ${p.highlight ? 'bg-teal-500 border-teal-400' : 'bg-zinc-900 border-white/10 hover:border-teal-500/40'}`}>
                <p className={`text-sm font-semibold mb-2 ${p.highlight ? 'text-black/70' : 'text-teal-400'}`}>{p.name}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-4xl font-black ${p.highlight ? 'text-black' : 'text-white'}`}>{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-black/60' : 'text-gray-500'}`}>{p.period}</span>
                </div>
                <p className={`text-sm leading-relaxed mb-6 flex-1 ${p.highlight ? 'text-black/70' : 'text-gray-400'}`}>{p.desc}</p>
                <Link
                  href={p.href}
                  className={`block text-center font-black text-sm px-4 py-3 rounded transition-colors ${
                    p.highlight
                      ? 'bg-black/20 hover:bg-black/30 text-black'
                      : 'bg-teal-500 hover:bg-teal-400 text-black'
                  }`}
                >
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>

          {/* Commitment plans */}
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Save More</p>
          <h2 className="text-4xl font-black mb-3">Commitment <span className="text-teal-400">Plans</span></h2>
          <p className="text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Pay upfront for 3, 6, or 12 months and save. Applies to Adult, Student, and Kids memberships.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commitmentTiers.map((tier) => {
              const isPopular = tier.months === 6
              return (
                <div
                  key={tier.months}
                  className={`rounded-xl border flex flex-col overflow-hidden ${isPopular ? 'border-teal-500' : 'border-white/10'}`}
                >
                  {/* Header */}
                  <div className={`px-6 py-4 flex items-center justify-between ${isPopular ? 'bg-teal-500' : 'bg-zinc-800'}`}>
                    <span className={`font-black text-lg ${isPopular ? 'text-black' : 'text-white'}`}>{tier.label}</span>
                    <span className={`text-xs font-black px-2 py-1 rounded ${isPopular ? 'bg-black/20 text-black' : 'bg-teal-500/20 text-teal-400'}`}>
                      {tier.badge}
                    </span>
                  </div>

                  {/* Plan rows */}
                  <div className="bg-zinc-900 flex flex-col divide-y divide-white/5 flex-1">
                    {membershipPlans.map((mp) => {
                      const total = mp.monthly * tier.months * (1 - tier.discount)
                      const perMonth = total / tier.months
                      return (
                        <div key={mp.name} className="px-6 py-4">
                          <p className="text-sm text-gray-400 mb-1">{mp.name}</p>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-white">{fmt(total)}</span>
                            <span className="text-sm text-gray-500">{fmt(perMonth)}/mo</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* CTA */}
                  <div className="bg-zinc-900 px-6 pb-6 pt-2">
                    <Link
                      href="/shop"
                      className={`block text-center font-black text-sm px-4 py-3 rounded transition-colors ${
                        isPopular
                          ? 'bg-teal-500 hover:bg-teal-400 text-black'
                          : 'bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white'
                      }`}
                    >
                      Get Started →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
