'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
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

  return (
    <>
      <section className="bg-zinc-950 py-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Get in Touch</p>
          <h1 className="text-5xl font-black mb-4">Contact <span className="text-teal-400">Us</span></h1>
          <p className="text-gray-400 max-w-2xl mb-16 leading-relaxed">
            Have a question about classes, memberships, or anything else? Send us a message and we&apos;ll get back to you.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Form */}
            <div>
              {status === 'success' ? (
                <div className="bg-zinc-900 border border-teal-500/30 rounded-xl p-8 text-center">
                  <p className="text-4xl mb-4">✅</p>
                  <h2 className="text-2xl font-black mb-3">Message received!</h2>
                  <p className="text-gray-400 mb-6">We&apos;ll be in touch shortly.</p>
                  <button
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', message: '' }) }}
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@email.com"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+1 (519) 555-0100"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us what you're looking for..."
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-8 py-4 rounded transition-colors text-lg"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-8">
              <div className="bg-zinc-900 border border-teal-500/30 rounded-xl p-6">
                <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-4">Ready to Train?</p>
                <p className="text-gray-400 text-sm mb-4">Skip the form — book your free trial and we&apos;ll connect on the mat.</p>
                <Link
                  href="/book"
                  className="inline-block bg-teal-500 hover:bg-teal-400 text-black font-black px-6 py-3 rounded transition-colors text-sm"
                >
                  Book Free Trial →
                </Link>
              </div>

              <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest">Find Us</p>
                <a
                  href="https://maps.app.goo.gl/aJwg6Sc1smkmKRTz7"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors shrink-0"
                >
                  <span className="text-xl">📍</span>
                  <span>420 Weber St N, Waterloo, ON</span>
                </a>
              </div>

              <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-4">Email or Text Us</p>
                <div className="flex flex-col gap-2">
                  <a href="mailto:support@labjiujitsu.com" className="text-gray-300 hover:text-white transition-colors">
                    ✉️ support@labjiujitsu.com
                  </a>
                  <a href="sms:+12269893140" className="text-gray-300 hover:text-white transition-colors">
                    💬 Text: (226) 989-3140
                  </a>
                  <a href="https://ig.me/m/thelabwaterloo" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">
                    📸 DM on Instagram
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
