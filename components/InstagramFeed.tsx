'use client'

import { useEffect } from 'react'

export default function InstagramFeed() {
  useEffect(() => {
    if (document.querySelector('script[src="https://w.behold.so/widget.js"]')) return
    const s = document.createElement('script')
    s.type = 'module'
    s.src = 'https://w.behold.so/widget.js'
    document.head.appendChild(s)
  }, [])

  return (
    <section className="bg-zinc-950 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-2">Follow Along</p>
            <h2 className="text-4xl font-black">
              We&apos;re on <span className="text-teal-400">Instagram</span>
            </h2>
          </div>
          <a
            href="https://instagram.com/thelabwaterloo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            @thelabwaterloo →
          </a>
        </div>
        <div data-behold-id="MaNvaPDzst4fEFt9h6zO" />
      </div>
    </section>
  )
}
