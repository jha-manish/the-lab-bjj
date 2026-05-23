import type { Metadata } from 'next'
import BookingFlow from '@/components/BookingFlow'

export const metadata: Metadata = {
  title: 'Shop | The Jiu-Jitsu Lab Waterloo',
  description: 'Book private training, get a membership, or shop academy merch at The Jiu-Jitsu Lab in Waterloo, ON.',
}

export default function ShopPage() {
  return (
    <section className="bg-zinc-950 py-20">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">The Jiu-Jitsu Lab</p>
        <h1 className="text-5xl font-black mb-4">Shop & <span className="text-teal-400">Train</span></h1>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Private coaching, memberships, and academy gear — all in one place.
        </p>

        <div className="bg-zinc-900 border border-white/10 rounded-xl p-8">
          <BookingFlow allowedCategories={['privates', 'memberships', 'merch']} />
        </div>
      </div>
    </section>
  )
}
