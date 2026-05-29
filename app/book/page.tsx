import type { Metadata } from 'next'
import ClassBookingWidget from '@/components/ClassBookingWidget'

export const metadata: Metadata = {
  title: 'Book a Free Trial | The Jiu-Jitsu Lab Waterloo',
  description: 'Book a free drop-in class at The Jiu-Jitsu Lab in Waterloo, ON. All levels welcome. No commitment required.',
  alternates: { canonical: 'https://labjiujitsu.com/book' },
  openGraph: { url: 'https://labjiujitsu.com/book' },
}

export default function BookPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">No commitment required</p>
          <h1 className="text-5xl font-black mb-4">Book Your <span className="text-teal-400">Free Trial</span></h1>
          <p className="text-gray-300 text-lg mb-4 leading-relaxed">
            Your first week is completely free — no credit card, no commitment, no pressure.
            Pick a class below to get started.
          </p>

          <div className="flex flex-wrap gap-4 mb-10 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> World-class coaching staff
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> All levels welcome
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> Free parking
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> Change rooms & showers on site
            </div>
          </div>

          <ClassBookingWidget />
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-4xl mx-auto px-4">
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
                <li>
                  📍{' '}
                  <a
                    href="https://maps.app.goo.gl/aJwg6Sc1smkmKRTz7"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    420 Weber St N, Waterloo, ON
                  </a>
                </li>
                <li>
                  ✉️{' '}
                  <a href="mailto:support@labjiujitsu.com" className="hover:text-white transition-colors">
                    support@labjiujitsu.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
