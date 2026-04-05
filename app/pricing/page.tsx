import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | The Jiu-Jitsu Lab Waterloo',
  description: 'BJJ membership pricing in Waterloo, ON. Adult unlimited from $159/month. Student rates, Kids, Women\'s, Drop-In, and Private Training available. First week free.',
}

const plans = [
  { name: 'Adult Unlimited', price: '$159', period: '/month', desc: 'Unlimited access to all adult classes — Gi, No-Gi, Open Mat, and more.', highlight: true },
  { name: 'Adult Annual', price: '$1,399', period: '/year', desc: 'Best value. Save ~$500 vs monthly. Unlimited access for the full year (~$117/mo).', highlight: false },
  { name: 'Student Rate', price: '$119', period: '/month', desc: 'Valid UW or Laurier student ID required. Unlimited classes.', highlight: false },
  { name: 'Kids BJJ', price: '$155', period: '/month', desc: 'Unlimited Kids BJJ classes for ages 5–15.', highlight: false },
  { name: "Women's Only", price: '$75', period: '/month', desc: 'Access to the dedicated Women\'s Only BJJ classes.', highlight: false },
  { name: 'Family Plan', price: '$265', period: '/month', desc: '1 adult + 1 child. Unlimited classes for both.', highlight: false },
  { name: 'Corporate Rate', price: '$139', period: '/person/month', desc: 'Minimum 4 employees. Contact us to set up your team.', highlight: false },
  { name: 'Drop-In', price: '$30', period: '/class', desc: 'Single class drop-in. No membership required.', highlight: false },
  { name: 'Private Training', price: '$100', period: '/hour', desc: 'One-on-one with any of our world-level coaches. Book by appointment.', highlight: false },
]

export default function PricingPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Transparent Pricing</p>
          <h1 className="text-5xl font-black mb-4">Membership <span className="text-teal-400">Plans</span></h1>
          <p className="text-gray-400 max-w-2xl mb-16 leading-relaxed">
            No hidden fees. No long-term contracts required. Your first week is always free.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.name} className={`rounded-xl p-6 border transition-colors ${p.highlight ? 'bg-teal-500 border-teal-400' : 'bg-zinc-900 border-white/10 hover:border-teal-500/40'}`}>
                <p className={`text-sm font-semibold mb-2 ${p.highlight ? 'text-black/70' : 'text-teal-400'}`}>{p.name}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-4xl font-black ${p.highlight ? 'text-black' : 'text-white'}`}>{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-black/60' : 'text-gray-500'}`}>{p.period}</span>
                </div>
                <p className={`text-sm leading-relaxed ${p.highlight ? 'text-black/70' : 'text-gray-400'}`}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-zinc-900 border border-teal-500/30 rounded-xl p-6 max-w-xl">
            <p className="text-xl font-bold mb-2">🎁 Free Trial Week</p>
            <p className="text-gray-400">Every new member gets their first week completely free. No credit card required. Just show up.</p>
            <Link href="/book" className="inline-block mt-4 bg-teal-500 hover:bg-teal-400 text-black font-bold px-6 py-3 rounded transition-colors">
              Book Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
