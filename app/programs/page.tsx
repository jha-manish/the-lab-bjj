import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Programs | The Jiu-Jitsu Lab Waterloo',
  description: 'BJJ programs for all levels in Waterloo, ON — Gi, No-Gi, Kids, Women\'s, Competition, and Private Training. Coached by an IBJJF World Champion.',
}

const programs = [
  {
    title: 'Gi BJJ',
    tag: 'All Levels',
    desc: 'Traditional Brazilian Jiu-Jitsu with the gi. Learn takedowns, guard passing, sweeps, and submissions in a structured class environment. Fundamentals classes available for beginners.',
    times: 'Mon, Wed, Thu, Sat',
  },
  {
    title: 'No-Gi Grappling',
    tag: 'All Levels',
    desc: 'Modern submission grappling without the gi. Faster-paced and great for MMA, wrestling, and general fitness. Morning and evening sessions available.',
    times: 'Tue, Fri, Sun',
  },
  {
    title: 'Kids BJJ',
    tag: 'Ages 5–15',
    desc: 'Led by Black Belt Roger Morais, our kids program builds confidence, discipline, focus, and self-defence in a fun, structured environment. Safe, age-appropriate curriculum.',
    times: 'Saturday 9:00 AM',
  },
  {
    title: "Women's BJJ",
    tag: 'Women Only',
    desc: 'A dedicated women-only class in a welcoming, supportive environment. No experience needed. Learn practical self-defence and grappling alongside other women at all levels.',
    times: 'Wednesday 6:15 PM',
  },
  {
    title: 'Competition Training',
    tag: 'Intermediate+',
    desc: 'Led by Dave Knowles — 2013 IBJJF World Champion. Focused training for competitors looking to sharpen their game and compete at local and national tournaments.',
    times: 'Thursday 7:30 PM',
  },
  {
    title: 'Private Lessons',
    tag: 'All Levels',
    desc: 'One-on-one instruction with any of our world-level coaches. Fastest way to improve. Ideal for beginners wanting a head start or competitors fixing specific weaknesses.',
    times: 'By appointment',
  },
  {
    title: 'Open Mat',
    tag: 'Members',
    desc: 'Free drilling and sparring sessions for members. Drop-ins welcome for $15. No instruction — just rolling. Great way to get extra rounds in.',
    times: 'Fri 7:30 PM, Sat 12 PM, Sun 10 AM',
  },
  {
    title: 'Self-Defence',
    tag: 'All Levels',
    desc: 'Practical self-defence rooted in BJJ and grappling principles. Available as private lessons or incorporated into our Fundamentals curriculum.',
    times: 'By request',
  },
]

export default function ProgramsPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">What We Offer</p>
          <h1 className="text-5xl font-black mb-4">Our <span className="text-teal-400">Programs</span></h1>
          <p className="text-gray-400 max-w-2xl mb-16 leading-relaxed">
            Every program at The Jiu-Jitsu Lab is taught by world-level competitors. Whether you&apos;re a complete beginner or a seasoned competitor, there&apos;s a class built for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map(p => (
              <div key={p.title} className="bg-zinc-900 border border-white/10 rounded-xl p-6 hover:border-teal-500/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold">{p.title}</h2>
                  <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded font-semibold whitespace-nowrap ml-2">{p.tag}</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">{p.desc}</p>
                <p className="text-sm text-gray-500">🕐 {p.times}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-500 py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-black">Not sure where to start?</h2>
            <p className="text-black/70 mt-1">Book a free trial and we&apos;ll match you to the right class.</p>
          </div>
          <Link href="/book" className="bg-black hover:bg-zinc-800 text-white font-black px-8 py-4 rounded text-lg transition-colors whitespace-nowrap">
            BOOK FREE TRIAL →
          </Link>
        </div>
      </section>
    </>
  )
}
