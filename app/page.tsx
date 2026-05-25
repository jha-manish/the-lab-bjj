import Link from 'next/link'
import type { Metadata } from 'next'
import InstagramFeed from '@/components/InstagramFeed'

export const metadata: Metadata = {
  title: 'The Jiu-Jitsu Lab | Brazilian Jiu-Jitsu in Waterloo, ON',
  description: "Waterloo's dedicated BJJ academy. Est. 1998. Led by IBJJF No-Gi World Silver Medalist Brandon Twaddle and a world-class coaching staff. Gi, No-Gi, Kids, Women's & Competition. First week free.",
}

const programs = [
  { title: 'Gi & No-Gi BJJ', desc: 'For adults of all levels. Traditional and modern grappling taught by world-level competitors. Morning and evening classes available.' },
  { title: 'Kids BJJ', desc: 'Ages 5–15. Confidence, discipline, and self-defence through fun, structured classes led by Black Belt Roger Morais.' },
  { title: "Women's BJJ", desc: 'A dedicated women-only program in a supportive, welcoming environment. No experience needed.' },
  { title: 'Competition Training', desc: 'Led by Dave Knowles — IBJJF World Champion. For competitors looking to take their game to the next level.' },
]

const coaches = [
  { name: 'Dragan Konjevic', rank: 'Black Belt', cred: 'Founder · Alliance BB promoted by Romero "Jacaré" Cavalcanti', founder: true },
  { name: 'Brandon Twaddle', rank: 'Brown Belt', cred: 'Head Coach · IBJJF No-Gi World Silver Medalist', founder: false },
  { name: 'Dave Knowles', rank: 'Black Belt', cred: 'IBJJF World Champion', founder: false },
  { name: 'Roger Morais', rank: 'Black Belt', cred: '15+ years experience · Kids Coach', founder: false },
  { name: 'Stephen DesChamp', rank: 'Brown Belt', cred: 'IBJJF World Competitor · Morning Classes', founder: false },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[92vh] flex items-center bg-zinc-950 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[length:160%] md:bg-cover bg-center lg:bg-[center_right] opacity-30 md:opacity-90"
          style={{ backgroundImage: "url('/images/hero/hero-sparring.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-zinc-950/80 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-black/50" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.48),transparent_68%)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-teal-400 font-semibold tracking-widest text-sm uppercase">Waterloo, Ontario</span>
              <span className="text-white/20">·</span>
              <span className="text-white/60 font-semibold text-sm uppercase tracking-widest">Est. 1998</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              WELCOME TO<br />
              <span className="text-teal-400">THE JIU-JITSU LAB</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 italic mb-5">Train smart. Roll hard.</p>
            <p className="text-white font-bold max-w-2xl mb-4 leading-relaxed">
              A dedicated Brazilian Jiu-Jitsu academy with roots stretching back to 1998 — led by{' '}
              <span>Head Coach Brandon Twaddle, IBJJF No-Gi World Silver Medalist</span>,{' '}
              and a staff of world-level competitors including IBJJF World Champion Dave Knowles.
            </p>
            <p className="text-white font-bold max-w-2xl mb-8 leading-relaxed">
              Gi, No-Gi, Kids, Women&apos;s, Competition, and Private training in Waterloo. Whether you&apos;re brand new or chasing gold,
              there&apos;s a place for you on the mat.
            </p>
            <p className="text-sm text-white font-bold mb-8">
              📍{' '}
              <a
                href="https://maps.app.goo.gl/aJwg6Sc1smkmKRTz7"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal-300 transition-colors"
              >
                420 Weber St N, Waterloo, ON
              </a>
              {' '}|{' '}
              <a href="mailto:support@labjiujitsu.com" className="hover:text-teal-300 transition-colors">
                support@labjiujitsu.com
              </a>
              {' '}|{' '}
              <a href="sms:+12269893140" className="hover:text-teal-300 transition-colors">
                💬 (226) 989-3140
              </a>
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book" className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors">
                BOOK YOUR FREE TRIAL
              </Link>
              <Link href="/programs" className="border border-white/30 bg-black/20 hover:bg-white/10 hover:border-white text-white font-semibold px-8 py-4 rounded text-lg transition-colors">
                View Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Train + Lineage */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Why Train */}
            <div>
              <p className="text-teal-400 font-semibold tracking-widest text-xs uppercase mb-3">Why Us</p>
              <h2 className="text-2xl font-black mb-4">Why Train at <span className="text-teal-400">The Jiu-Jitsu Lab?</span></h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Most gyms offer BJJ as one class among many. The Jiu-Jitsu Lab is built entirely around Brazilian Jiu-Jitsu —
                every coach, every class, every program. That focus means faster progress, deeper instruction, and a tighter community.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'IBJJF World Silver Medalist as Head Coach',
                  'Four world-level instructors',
                  'Rooted in 25+ years of BJJ history in KW',
                  'Dedicated Fundamentals classes for beginners',
                  'Kids, Women\'s, and Competition programs',
                  'Free trial week — no commitment',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-teal-400 mt-0.5 shrink-0">✓</span>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lineage */}
            <div className="border-t border-white/10 pt-8 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-12">
              <p className="text-teal-400 font-semibold tracking-widest text-xs uppercase mb-3">Lineage</p>
              <h3 className="text-2xl font-black mb-4">Jacaré → Dragan → The Lab</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                In 1998, <span className="text-white font-semibold">Dragan Konjevic</span> — an Alliance black belt promoted by the legendary{' '}
                <span className="text-white font-semibold">Romero &quot;Jacaré&quot; Cavalcanti</span> — opened the first BJJ gym in the Kitchener-Waterloo region
                under the banner of Dragan Alliance. He was the first black belt in the region, and the first to bring jiu-jitsu here.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                His students have gone on to win major titles and open multiple gyms across KW.
                Nearly every black belt in the region today traces their roots back to him — including our own coaches.
                Dragan still comes in to teach, and his presence is a reminder of where all of this started.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                Read the full story →
              </Link>
            </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {coaches.map(c => (
              <div key={c.name} className={`bg-zinc-950 border rounded-xl p-6 ${c.founder ? 'border-teal-500/40' : 'border-white/10'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${c.founder ? 'bg-teal-500/30' : 'bg-teal-500/20'}`}>
                  <span className="text-teal-400 font-black text-lg">{c.name[0]}</span>
                </div>
                <p className="font-bold text-white">{c.name}</p>
                <p className="text-teal-400 text-sm font-semibold">{c.rank}</p>
                <p className="text-gray-400 text-sm mt-1">{c.cred}</p>
                {c.founder && (
                  <span className="inline-block mt-3 text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                    Founder
                  </span>
                )}
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

      {/* Instagram Feed */}
      <InstagramFeed />
    </>
  )
}
