'use client'

import { useState } from 'react'

export default function FloatingContact() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/square/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  function reset() {
    setForm({ name: '', email: '', phone: '', message: '' })
    setStatus('idle')
    setError('')
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(true); reset() }}
        aria-label="Contact us"
        className="fixed bottom-6 right-5 z-40 flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-black font-black text-sm px-4 py-3 rounded-full shadow-lg shadow-teal-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
        </svg>
        Contact us
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-up panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 w-full sm:w-[420px] sm:bottom-6 sm:right-5 sm:rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-300 ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="font-black text-white">Get in touch</p>
            <p className="text-gray-500 text-xs mt-0.5">We&apos;ll get back to you shortly.</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {status === 'success' ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-black text-white text-lg mb-1">Message sent!</p>
              <p className="text-gray-400 text-sm mb-5">We&apos;ll be in touch soon.</p>
              <button
                onClick={reset}
                className="text-teal-400 hover:text-teal-300 text-sm font-semibold transition-colors"
              >
                Send another →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    placeholder="(226) 555-0100"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us what you're looking for..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-6 py-3 rounded-lg transition-colors text-sm"
              >
                {status === 'sending' ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
