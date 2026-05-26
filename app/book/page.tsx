import type { Metadata } from 'next'

const SQUARE_BASE = 'https://book.squareup.com/appointments/nh5lp9kyixo0m7/location/LGBKZ7SQXNB33/services'
const SQUARE_SUFFIX = '/availability'

const classes = [
  {
    name: "Beginner's Class",
    desc: 'Perfect if you\'ve never trained before. Learn the fundamentals in a welcoming, low-pressure environment.',
    time: 'Mon–Fri · 6:00–7:00 PM',
    level: 'Beginners',
    id: 'PTFGD2T4KSOY4ADA224H5X77',
  },
  {
    name: 'Regular Class',
    desc: 'All-levels class covering technique, drilling, and live rolling. For those with some mat experience.',
    time: 'Mon–Thu · 7:00–8:30 PM',
    level: 'All Levels',
    id: 'AHYKA2XF5A2PBNCSMOCLQMLF',
  },
  {
    name: "Women's Only Class",
    desc: 'A dedicated women-only environment. Supportive, focused, and beginner-friendly.',
    time: 'Fridays · 5:00–6:00 PM',
    level: 'Women Only',
    id: 'GJD24AXAVPDC7OX7WXO2UESO',
  },
  {
    name: 'Kids Class',
    desc: 'Ages 5–15. Fun, structured classes building confidence, discipline, and self-defence. Led by Black Belt Roger Morais.',
    time: 'Mon–Fri · 5:00–6:00 PM',
    level: 'Ages 5–15',
    id: 'RDCFCELC275SBLQLGN2YXUXX',
  },
]

const levelColors: Record<string, string> = {
  'Beginners': 'bg-green-500/20 text-green-400',
  'All Levels': 'bg-blue-500/20 text-blue-400',
  'Women Only': 'bg-pink-500/20 text-pink-400',
  'Ages 5–15': 'bg-purple-500/20 text-purple-400',
}

export const metadata: Metadata = {
  title: 'Book a Free Trial | The Jiu-Jitsu Lab Waterloo',
  description: 'Book a free drop-in class at The Jiu-Jitsu Lab in Waterloo, ON. All levels welcome. No commitment required.',
}

export default function BookPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">No commitment required</p>
          <h1 className="text-5xl font-black mb-4">Book Your <span className="text-teal-400">Free Trial</span></h1>
          <p className="text-gray-300 text-lg mb-4 leading-relaxed">
            Your first week is completely free — no credit card, no commitment, no pressure. Pick a class below and you&apos;ll be taken to our secure booking page.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> World-class coaching staff
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> All levels welcome
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-teal-400">✓</span> Free parking · Change rooms on site
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map(c => (
              <a
                key={c.id}
                href={`${SQUARE_BASE}/${c.id}${SQUARE_SUFFIX}`}
                target="_blank"
                rel="noreferrer"
                className="bg-zinc-900 border border-white/10 hover:border-teal-500 rounded-xl p-6 flex flex-col gap-3 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-black text-lg group-hover:text-teal-400 transition-colors">{c.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap shrink-0 ${levelColors[c.level]}`}>
                    {c.level}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{c.desc}</p>
                <p className="text-teal-400 text-xs font-semibold">🕐 {c.time}</p>
                <span className="mt-1 block text-center bg-teal-500 group-hover:bg-teal-400 text-black font-black text-sm px-4 py-2.5 rounded transition-colors">
                  Book Free Trial →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

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
