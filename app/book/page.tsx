import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Free Trial | The Jiu-Jitsu Lab Waterloo',
  description: 'Book a free trial BJJ class at The Jiu-Jitsu Lab in Waterloo, ON. Coached by 2013 IBJJF World Champion Dave Knowles. All levels welcome. No commitment required.',
}

export default function BookPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">No commitment required</p>
          <h1 className="text-5xl font-black mb-4">Book Your <span className="text-teal-400">Free Trial</span></h1>
          <p className="text-gray-300 text-lg mb-4 leading-relaxed">
            The best way to experience The Jiu-Jitsu Lab is to get on the mat. Your first week is completely free — no commitment, no pressure.
          </p>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Come see why Waterloo trains at The Jiu-Jitsu Lab.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> Coached by 2013 IBJJF World Champion Dave Knowles
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> All levels welcome
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> Free parking · Change rooms on site
            </div>
          </div>

          {/* Form */}
          <form
            className="bg-zinc-900 border border-white/10 rounded-xl p-8 flex flex-col gap-6"
            action="https://formspree.io/f/your-form-id"
            method="POST"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                <input
                  name="name"
                  required
                  className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                <input
                  name="phone"
                  required
                  type="tel"
                  className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="(519) 000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email Address *</label>
              <input
                name="email"
                required
                type="email"
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Class Time *</label>
              <select
                name="class_time"
                required
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="">Select a time</option>
                <option>Morning (6:00–7:00 AM)</option>
                <option>Lunch (12:00 PM)</option>
                <option>Evening (6:15–7:30 PM)</option>
                <option>Weekend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Program Interest *</label>
              <select
                name="program"
                required
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="">Select a program</option>
                <option>Adult Gi BJJ</option>
                <option>Adult No-Gi</option>
                <option>Kids BJJ (ages 5–15)</option>
                <option>{"Women's BJJ"}</option>
                <option>Competition Training</option>
                <option>Not sure yet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Any injuries or physical limitations? <span className="text-gray-500 font-normal">(optional)</span></label>
              <textarea
                name="injuries"
                rows={3}
                className="w-full bg-zinc-800 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                placeholder="Let us know anything we should be aware of..."
              />
            </div>

            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors"
            >
              BOOK MY FREE TRIAL →
            </button>
            <p className="text-gray-500 text-sm text-center">We&apos;ll confirm within 24 hours. No spam, ever.</p>
          </form>
        </div>
      </section>

      {/* What to expect */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-10">What to Expect on <span className="text-teal-400">Your First Day</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">What to wear</h3>
              <ul className="flex flex-col gap-2 text-gray-400">
                <li>• Comfortable athletic clothes (shorts, t-shirt, or rashguard)</li>
                <li>• If you have a gi, bring it — if not, no worries</li>
                <li>• No shoes on the mat</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">What to bring</h3>
              <ul className="flex flex-col gap-2 text-gray-400">
                <li>• Water bottle</li>
                <li>• Flip flops or sandals (for off the mat)</li>
                <li>• Mouthguard if you have one (not required for first class)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Good to know</h3>
              <ul className="flex flex-col gap-2 text-gray-400">
                <li>• Arrive 10–15 minutes early so we can show you around</li>
                <li>• All levels welcome — no experience needed</li>
                <li>• We have change rooms on site</li>
                <li>• Free parking available</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Find us</h3>
              <ul className="flex flex-col gap-2 text-gray-400">
                <li>📍 420 Weber St N, Waterloo, ON</li>
                <li>✉️ support@labjiujitsu.com</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
