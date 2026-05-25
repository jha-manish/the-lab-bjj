import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memberships | The Jiu-Jitsu Lab Waterloo',
  description: 'BJJ memberships in Waterloo, ON. Adult unlimited from $135/month. Student and Kids rates available. First week free — no commitment.',
}

const memberships = [
  {
    name: 'Adult Unlimited',
    price: 135,
    highlight: true,
    who: 'Adults of all levels — beginners to competitors',
    includes: [
      'All weeknight classes (Mon–Thu)',
      'Beginners class every evening',
      'Regular all-levels class every evening',
      "Women's Only class (Fridays)",
      'Q&A / Drilling (Fridays)',
      'Open Mat (Fridays — free)',
      'No-Gi with Dave Knowles (Saturdays)',
      'Competition class with Dave Knowles (Sundays)',
    ],
    href: '/shop',
  },
  {
    name: 'Student Rate',
    price: 119,
    highlight: false,
    who: 'Full-time students with valid UW or Laurier ID',
    includes: [
      'Everything in Adult Unlimited',
      'Valid student ID required at sign-up',
    ],
    href: '/shop',
  },
  {
    name: 'Kids BJJ',
    price: 120,
    highlight: false,
    who: 'Ages 5–15',
    includes: [
      'Kids BJJ class every weeknight (5–6 PM)',
      'Led by Black Belt Roger Morais',
      'Age-appropriate curriculum',
      'Builds confidence, discipline & self-defence',
    ],
    href: '/shop',
  },
]

const commitmentTiers = [
  { months: 3,  discount: 0.10, label: '3 Months', badge: '10% off' },
  { months: 6,  discount: 0.15, label: '6 Months', badge: '15% off', popular: true },
  { months: 12, discount: 0.20, label: '1 Year',   badge: '20% off' },
]

const membershipBases = [
  { name: 'Adult Unlimited', monthly: 135 },
  { name: 'Student Rate',    monthly: 119 },
  { name: 'Kids BJJ',        monthly: 120 },
]

function fmt(n: number) {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`
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
    cta: 'Contact Us',
    href: 'mailto:support@labjiujitsu.com',
  },
]

export default function MembershipsPage() {
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
            {memberships.map(m => (
              <div
                key={m.name}
                className={`rounded-xl border flex flex-col overflow-hidden ${m.highlight ? 'border-teal-500' : 'border-white/10'}`}
              >
                {/* Header */}
                <div className={`px-6 py-5 ${m.highlight ? 'bg-teal-500' : 'bg-zinc-800'}`}>
                  <p className={`text-sm font-semibold mb-1 ${m.highlight ? 'text-black/70' : 'text-teal-400'}`}>{m.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${m.highlight ? 'text-black' : 'text-white'}`}>${m.price}</span>
                    <span className={`text-sm ${m.highlight ? 'text-black/60' : 'text-gray-500'}`}>/month</span>
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
                    href={m.href}
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
            Pay upfront for 3, 6, or 12 months and save. Applies to Adult, Student, and Kids memberships.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {commitmentTiers.map((tier) => (
              <div
                key={tier.months}
                className={`rounded-xl border flex flex-col overflow-hidden ${tier.popular ? 'border-teal-500' : 'border-white/10'}`}
              >
                <div className={`px-6 py-4 flex items-center justify-between ${tier.popular ? 'bg-teal-500' : 'bg-zinc-800'}`}>
                  <span className={`font-black text-lg ${tier.popular ? 'text-black' : 'text-white'}`}>{tier.label}</span>
                  <span className={`text-xs font-black px-2 py-1 rounded ${tier.popular ? 'bg-black/20 text-black' : 'bg-teal-500/20 text-teal-400'}`}>
                    {tier.badge}
                  </span>
                </div>
                <div className="bg-zinc-900 flex flex-col divide-y divide-white/5 flex-1">
                  {membershipBases.map((mp) => {
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
                <div className="bg-zinc-900 px-6 pb-6 pt-2">
                  <Link
                    href="/shop"
                    className={`block text-center font-black text-sm px-4 py-3 rounded transition-colors ${
                      tier.popular
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
