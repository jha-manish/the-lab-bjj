import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Class Schedule | The Jiu-Jitsu Lab Waterloo',
  description: 'BJJ class schedule in Waterloo, ON. Morning, noon, evening, and weekend classes. Gi, No-Gi, Kids, Women\'s, Competition, and Open Mat.',
  alternates: { canonical: 'https://labjiujitsu.com/schedule' },
  openGraph: { url: 'https://labjiujitsu.com/schedule' },
}

const eveningClasses = [
  { time: '5:00–6:00 PM', name: 'Kids BJJ', level: 'Ages 5–15' },
  { time: '6:00–7:00 PM', name: 'Beginners Class', level: 'Beginners' },
  { time: '7:00–8:30 PM', name: 'Regular Class', level: 'All Levels' },
]

const morningClass = { time: '6:30–8:00 AM', name: 'Morning Class', level: 'All Levels' }

const schedule = [
  { day: 'Monday', classes: eveningClasses },
  { day: 'Tuesday', classes: [morningClass, ...eveningClasses] },
  { day: 'Wednesday', classes: eveningClasses },
  { day: 'Thursday', classes: [morningClass, ...eveningClasses] },
  {
    day: 'Friday',
    classes: [
      { time: '5:00–6:00 PM', name: "Women's Only Class", level: 'Women Only' },
      { time: '6:00–7:00 PM', name: 'Q&A / Drilling', level: 'All Levels' },
      { time: '7:30 PM', name: 'Open Mat', level: 'Free — All Welcome' },
    ],
  },
  {
    day: 'Saturday',
    classes: [
      { time: '10:00 AM–12:00 PM', name: 'No-Gi with Dave Knowles', level: 'All Levels' },
    ],
  },
  {
    day: 'Sunday',
    classes: [
      { time: '10:30 AM–12:00 PM', name: 'Competition Class with Dave Knowles', level: 'Free — All Welcome' },
    ],
  },
]

const levelColors: Record<string, string> = {
  'Beginners': 'bg-green-500/20 text-green-400',
  'All Levels': 'bg-blue-500/20 text-blue-400',
  'Ages 5–15': 'bg-purple-500/20 text-purple-400',
  'Women Only': 'bg-pink-500/20 text-pink-400',
  'Free — All Welcome': 'bg-teal-500/20 text-teal-400',
}

export default function SchedulePage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Class Times</p>
          <h1 className="text-5xl font-black mb-4">Weekly <span className="text-teal-400">Schedule</span></h1>
          <p className="text-gray-400 max-w-2xl mb-16 leading-relaxed">
            Classes run 7 days a week. Morning classes on Tuesdays and Thursdays, evening classes every weeknight, and weekend sessions with IBJJF World Champion Dave Knowles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedule.map(day => (
              <div key={day.day} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-zinc-800 px-6 py-3 border-b border-white/10">
                  <h2 className="font-bold text-lg">{day.day}</h2>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {day.classes.map(c => (
                    <div key={c.time + c.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-teal-400 font-mono text-sm w-32 shrink-0">{c.time}</span>
                        <span className="text-white font-medium">{c.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap ${levelColors[c.level] || 'bg-gray-500/20 text-gray-400'}`}>
                        {c.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-500 py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-black">Ready to get on the mat?</h2>
            <p className="text-black/70 mt-1">Your first week is completely free.</p>
          </div>
          <Link href="/book" className="bg-black hover:bg-zinc-800 text-white font-black px-8 py-4 rounded text-lg transition-colors whitespace-nowrap">
            BOOK FREE TRIAL →
          </Link>
        </div>
      </section>
    </>
  )
}
