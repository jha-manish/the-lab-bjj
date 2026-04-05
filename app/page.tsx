import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Jiu-Jitsu Lab | Brazilian Jiu-Jitsu in Waterloo, ON',
  description: "Waterloo's dedicated BJJ academy led by IBJJF No-Gi World Silver Medalist Brandon Twaddle and a world-class coaching staff. Gi, No-Gi, Kids, Women's & Competition. First week free.",
}

const programs = [
  { title: 'Gi & No-Gi BJJ', desc: 'For adults of all levels. Traditional and modern grappling taught by world-level competitors. Morning and evening classes available.' },
  { title: 'Kids BJJ', desc: 'Ages 5–15. Confidence, discipline, and self-defence through fun, structured classes led by Black Belt Roger Morais.' },
  { title: "Women's BJJ", desc: 'A dedicated women-only program in a supportive, welcoming environment. No experience needed.' },
  { title: 'Competition Training', desc: 'Led by Dave Knowles — 2013 IBJJF World Champion. For competitors looking to take their game to the next level.' },
]

const coaches = [
  { name: 'Brandon Twaddle', rank: 'Brown Belt', cred: 'Head Coach · IBJJF No-Gi World Silver Medalist' },
  { name: 'Dave Knowles', rank: 'Black Belt', cred: '2013 IBJJF World Champion' },
  { name: 'Roger Morais', rank: 'Black Belt', cred: '15+ years experience, Kids Coach' },
  { name: 'Stephen DesChamp', rank: 'Brown Belt', cred: 'IBJJF World Competitor, Morning Classes' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[90vh] flex items-center bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-24">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Waterloo, Ontario</p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            WELCOME TO<br />
            <span className="text-teal-400">THE JIU-JITSU LAB</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 italic mb-4">Train smart. Roll hard.</p>
          <p className="text-gray-400 max-w-2xl mb-4 leading-relaxed">
            Build confidence and community through Brazilian Jiu-Jitsu — led by{' '}
            <span className="text-white font-semibold">Head Coach Brandon Twaddle, IBJJF No-Gi World Silver Medalist</span>,{' '}
            and a staff of world-level competitors including 2013 IBJJF World Champion Dave Knowles.
          </p>
          <p className="text-gray-400 max-w-2xl mb-8 leading-relaxed">
            Located in Waterloo, ON, The Jiu-Jitsu Lab offers expert instruction in Gi, No-Gi, Kids, Women&apos;s, Competition, and Private training.
            Whether you&apos;re stepping on the mat for the first time or chasing gold at your next tournament, there&apos;s a place for you here.
          </p>
          <p className="text-sm text-gray-500 mb-8">📍 420 Weber St N, Waterloo, ON &nbsp;|&nbsp; support@labjiujitsu.com</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/book" className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors">
              BOOK YOUR FREE TRIAL
            </Link>
            <Link href="/programs" className="border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded text-lg transition-colors">
              View Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Why Train */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black mb-4">Why Train at <span className="text-teal-400">The Jiu-Jitsu Lab?</span></h2>
          <p className="text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Most gyms offer BJJ as one class among many. The Jiu-Jitsu Lab is built entirely around Brazilian Jiu-Jitsu —
            every coach, every class, every program. That focus means faster progress, deeper instruction, and a tighter community.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-12">
            {[
              'IBJJF World Silver Medalist as Head Coach',
              'Four world-level instructors',
              'Dedicated Fundamentals classes for beginners',
              'Kids, Women\'s, and Competition programs',
              'Free trial week — no commitment',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-teal-400 mt-0.5">✓</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          {/* Lineage callout */}
          <div className="border-l-4 border-teal-500 pl-6 max-w-2xl">
            <p className="text-white font-semibold mb-1">20+ years of BJJ lineage in Waterloo</p>
            <p className="text-gray-400 leading-relaxed">
              Our coaches — Dave Knowles, Brandon Twaddle, and Roger Morais — were all trained and developed by Dragan Konjevic,
              who spent over two decades building the BJJ community in Kitchener-Waterloo through Dragan Alliance.
              Nearly every black belt in the region traces their roots back to him.{' '}
              <Link href="/about" className="text-teal-400 hover:text-teal-300 transition-colors">Read our story →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black mb-12">Programs for <span className="text-teal-400">Every Level</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map(p => (
              <div key={p.title} className="bg-zinc-900 border border-white/10 rounded-xl p-6 hover:border-teal-500/50 transition-colors">
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/programs" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
              View all programs →
            </Link>
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black mb-4">World-Class <span className="text-teal-400">Coaching Staff</span></h2>
          <p className="text-gray-400 mb-12 max-w-xl">No gym in Waterloo has credentials like ours. Every instructor competes or has competed at the highest level.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coaches.map(c => (
              <div key={c.name} className="bg-zinc-950 border border-white/10 rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                  <span className="text-teal-400 font-black text-lg">{c.name[0]}</span>
                </div>
                <p className="font-bold text-white">{c.name}</p>
                <p className="text-teal-400 text-sm font-semibold">{c.rank}</p>
                <p className="text-gray-400 text-sm mt-1">{c.cred}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-teal-500 py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-black">Your first week is free.</h2>
            <p className="text-black/70 mt-1">No commitment. No signup fees. Just come roll.</p>
          </div>
          <Link href="/book" className="bg-black hover:bg-zinc-800 text-white font-black px-8 py-4 rounded text-lg transition-colors whitespace-nowrap">
            BOOK FREE TRIAL →
          </Link>
        </div>
      </section>
    </>
  )
}
