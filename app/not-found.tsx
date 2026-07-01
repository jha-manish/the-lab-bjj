'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { track404 } from '@/lib/analytics'

export default function NotFound() {
  useEffect(() => {
    track404({ path: window.location.pathname + window.location.search })
  }, [])

  return (
    <section className="bg-zinc-950 py-32 min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">404</p>
        <h1 className="text-5xl font-black mb-4">Page not <span className="text-teal-400">found</span></h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          We couldn&apos;t find that page. It may have moved — but the mats are still here.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/book"
            data-cta="book_free_trial"
            data-cta-location="404"
            className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors"
          >
            Book Your Free Trial
          </Link>
          <Link
            href="/"
            className="border border-white/30 bg-black/20 hover:bg-white/10 hover:border-white text-white font-semibold px-8 py-4 rounded text-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
