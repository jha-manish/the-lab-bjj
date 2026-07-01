'use client'

import { useEffect } from 'react'
import { trackError } from '@/lib/analytics'

/**
 * Route-level error boundary. Captures React render/runtime errors that the
 * window.onerror listener cannot see and reports them as fatal exceptions.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    trackError({
      description: error.message || 'Render error',
      fatal: true,
      context: error.digest ? `error_boundary:${error.digest}` : 'error_boundary',
    })
  }, [error])

  return (
    <section className="bg-zinc-950 py-32 min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Something went wrong</p>
        <h1 className="text-4xl font-black mb-4">We hit a <span className="text-teal-400">snag</span></h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          Sorry about that. Try again, or head back home and book your free trial.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  )
}
