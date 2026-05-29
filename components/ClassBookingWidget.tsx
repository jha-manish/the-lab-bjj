'use client'

import { useState, useEffect, useRef } from 'react'

const SQUARE_BASE = 'https://book.squareup.com/appointments/nh5lp9kyixo0m7/location/LGBKZ7SQXNB33/services'

const classes = [
  {
    name: "Beginner's Class",
    desc: "Perfect if you've never trained before. Learn the fundamentals in a welcoming, low-pressure environment.",
    time: 'Mon–Fri · 6:00–7:00 PM',
    level: 'Beginners',
    id: 'PTFGD2T4KSOY4ADA224H5X77',
  },
  {
    name: 'Regular Class',
    desc: 'All-levels class covering technique, drilling, and live rolling. Beginners are always welcome — our coaches make sure no one gets left behind.',
    time: 'Mon–Thu · 7:00–8:30 PM',
    level: 'All Levels',
    tip: "Can't make the 6 PM Beginner's Class? This is your next best option.",
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
  'Beginners': 'bg-green-500/20 text-green-400 border-green-500/30',
  'All Levels': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Women Only': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Ages 5–15': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default function ClassBookingWidget() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const iframeRef = useRef<HTMLDivElement>(null)

  const selectedClass = classes.find(c => c.id === selectedId)

  useEffect(() => {
    if (selectedId && iframeRef.current) {
      iframeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedId])

  return (
    <div>
      {/* Class cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {classes.map((c) => {
          const isSelected = selectedId === c.id
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`text-left bg-zinc-900 border rounded-xl p-6 flex flex-col gap-3 transition-all ${
                isSelected
                  ? 'border-teal-500 ring-1 ring-teal-500/50'
                  : 'border-white/10 hover:border-teal-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-black text-lg text-white">{c.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded border font-semibold whitespace-nowrap shrink-0 ${levelColors[c.level]}`}>
                  {c.level}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{c.desc}</p>
              {'tip' in c && c.tip && (
                <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 font-semibold">
                  💡 {c.tip}
                </p>
              )}
              <p className="text-teal-400 text-xs font-semibold">🕐 {c.time}</p>
              <div className={`mt-1 text-center font-black text-sm px-4 py-2.5 rounded transition-colors ${
                isSelected
                  ? 'bg-teal-500 text-black'
                  : 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
              }`}>
                {isSelected ? 'Selected ✓' : 'Select This Class'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Iframe — shown only after selection */}
      {selectedId && (
        <div ref={iframeRef} className="mt-4 scroll-mt-24">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div>
              <p className="text-teal-400 text-xs font-semibold uppercase tracking-widest mb-1">Booking</p>
              <h3 className="text-xl font-black text-white">{selectedClass?.name}</h3>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              ← Change class
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-teal-500/30">
            <iframe
              key={selectedId}
              src={`${SQUARE_BASE}/${selectedId}`}
              width="100%"
              height="850"
              frameBorder="0"
              title={`Book ${selectedClass?.name} at The Jiu-Jitsu Lab`}
              allow="payment"
            />
          </div>
          <p className="text-center mt-4 text-sm text-gray-500">
            Having trouble?{' '}
            <a
              href={`${SQUARE_BASE}/${selectedId}`}
              target="_blank"
              rel="noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Open in a new tab →
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
