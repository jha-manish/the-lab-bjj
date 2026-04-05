import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Class Schedule | The Jiu-Jitsu Lab Waterloo',
  description: 'BJJ class schedule in Waterloo, ON. Morning, noon, evening, and weekend classes. Gi, No-Gi, Kids, Women\'s, Competition, and Open Mat.',
}

const schedule = [
  {
    day: 'Monday',
    classes: [
      { time: '6:00 AM', name: 'Morning No-Gi', level: 'All Levels' },
      { time: '6:15 PM', name: 'Fundamentals Gi', level: 'Beginners' },
      { time: '7:30 PM', name: 'Gi Advanced', level: 'Intermediate+' },
    ],
  },
  {
    day: 'Tuesday',
    classes: [
      { time: '12:00 PM', name: 'Noon No-Gi', level: 'All Levels' },
      { time: '6:15 PM', name: 'Fundamentals No-Gi', level: 'Beginners' },
      { time: '7:30 PM', name: 'No-Gi Advanced', level: 'Intermediate+' },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      { time: '6:00 AM', name: 'Morning Gi', level: 'All Levels' },
      { time: '6:15 PM', name: "Women's Only BJJ", level: 'All Levels' },
      { time: '7:30 PM', name: 'Gi/No-Gi Open', level: 'All Levels' },
    ],
  },
  {
    day: 'Thursday',
    classes: [
      { time: '12:00 PM', name: 'Noon Gi', level: 'All Levels' },
      { time: '6:15 PM', name: 'Fundamentals (Gi/No-Gi)', level: 'Beginners' },
      { time: '7:30 PM', name: 'Competition Training', level: 'Intermediate+' },
    ],
  },
  {
    day: 'Friday',
    classes: [
      { time: '6:15 PM', name: 'No-Gi Sparring/Drilling', level: 'All Levels' },
      { time: '7:30 PM', name: 'Open Mat', level: 'Members / $15 Drop-In' },
    ],
  },
  {
    day: 'Saturday',
    classes: [
      { time: '9:00 AM', name: 'Kids BJJ', level: 'Ages 5–15' },
      { time: '10:30 AM', name: 'Adult All-Levels Gi', level: 'All Levels' },
      { time: '12:00 PM', name: 'Open Mat', level: 'Members / $15 Drop-In' },
    ],
  },
  {
    day: 'Sunday',
    classes: [
      { time: '10:00 AM', name: 'Community Open Mat', level: 'Free for Members' },
    ],
  },
]

const levelColors: Record<string, string> = {
  'Beginners': 'bg-green-500/20 text-green-400',
  'All Levels': 'bg-blue-500/20 text-blue-400',
  'Intermediate+': 'bg-orange-500/20 text-orange-400',
  'Ages 5–15': 'bg-purple-500/20 text-purple-400',
  'Women Only': 'bg-pink-500/20 text-pink-400',
  'Members / $15 Drop-In': 'bg-gray-500/20 text-gray-400',
  'Free for Members': 'bg-teal-500/20 text-teal-400',
}

export default function SchedulePage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Class Times</p>
          <h1 className="text-5xl font-black mb-4">Weekly <span className="text-teal-400">Schedule</span></h1>
          <p className="text-gray-400 max-w-2xl mb-16 leading-relaxed">
            Morning, noon, evening, and weekend classes available. Something fits your schedule.
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
                        <span className="text-teal-400 font-mono text-sm w-20 shrink-0">{c.time}</span>
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

          <div className="mt-12 flex flex-wrap gap-4 text-sm">
            {Object.entries(levelColors).map(([label, cls]) => (
              <span key={label} className={`px-3 py-1 rounded font-semibold ${cls}`}>{label}</span>
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
