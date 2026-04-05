import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | The Jiu-Jitsu Lab Waterloo',
  description: 'Meet the coaching staff at The Jiu-Jitsu Lab in Waterloo, ON. Led by Head Coach Brandon Twaddle, IBJJF No-Gi World Silver Medalist, and a team of world-level competitors.',
}

const coaches = [
  {
    name: 'Brandon Twaddle',
    rank: 'Brown Belt',
    role: 'Head Coach',
    cred: 'IBJJF No-Gi World Silver Medalist',
    bio: 'Brandon leads The Jiu-Jitsu Lab\'s day-to-day operations and is the driving force behind our coaching culture. A silver medalist at the IBJJF No-Gi World Championships, he brings elite competition experience and a deep passion for developing students at every level.',
  },
  {
    name: 'Dave Knowles',
    rank: 'Black Belt',
    role: 'Competition Coach',
    cred: '2013 IBJJF World Champion',
    bio: 'Dave brings world-championship experience to The Jiu-Jitsu Lab\'s competition program. As a 2013 IBJJF World Champion, his knowledge of high-level competition is an invaluable resource for anyone looking to compete.',
  },
  {
    name: 'Roger Morais',
    rank: 'Black Belt',
    role: 'Kids Coach',
    cred: 'Training since 2011 — 15+ years experience',
    bio: 'Roger heads our Kids BJJ program and has spent over 15 years on the mats. His patient, structured approach makes him ideal for developing young athletes. He instills discipline, confidence, and a love for the art in every student.',
  },
  {
    name: 'Stephen DesChamp',
    rank: 'Brown Belt',
    role: 'Morning Classes Instructor',
    cred: 'IBJJF World Competitor',
    bio: 'Stephen runs our early morning classes and has competed at the IBJJF World Championships. His technical game and commitment to the fundamentals make him an outstanding instructor for students who want to build a strong foundation.',
  },
]

export default function AboutPage() {
  return (
    <>
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Who We Are</p>
          <h1 className="text-5xl font-black mb-6">The Jiu-Jitsu Lab <span className="text-teal-400">Story</span></h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed mb-4">
            The Jiu-Jitsu Lab was built on a single belief: that dedicated, focused instruction beats generalist training every time.
            We don&apos;t offer kickboxing, yoga, or fitness classes. We do one thing — Brazilian Jiu-Jitsu — and we do it at the highest level.
          </p>
          <p className="text-gray-400 max-w-2xl leading-relaxed mb-16">
            Located at 420 Weber St N in Waterloo, ON, we serve beginners, recreational grapplers, students, parents, and competitors.
            Whatever your goal on the mat, we have the coaching staff to get you there.
          </p>

          {/* Roots section */}
          <div className="bg-zinc-900 border-l-4 border-teal-500 rounded-r-xl p-8 mb-16 max-w-3xl">
            <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Our Roots</p>
            <h2 className="text-3xl font-black mb-6">Built on 20 Years of BJJ in Waterloo</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The Jiu-Jitsu Lab didn&apos;t appear out of nowhere. Our roots run deep.
            </p>
            <p className="text-gray-400 leading-relaxed mb-4">
              Dragan Konjevic spent over 20 years building the BJJ community in Kitchener-Waterloo through Dragan Alliance.
              Nearly every black belt in the KW region today traces their training back to him — including our own coaches
              Dave Knowles, Brandon Twaddle, and Roger Morais.
            </p>
            <p className="text-gray-400 leading-relaxed mb-4">
              That foundation is still alive at The Jiu-Jitsu Lab. Dragan walks through our doors multiple times a week,
              still on the mats, still part of the community he built.
            </p>
            <p className="text-white font-semibold italic">
              When you train here, you&apos;re not just joining a gym. You&apos;re joining a lineage.
            </p>
          </div>

          <h2 className="text-4xl font-black mb-12">Coaching <span className="text-teal-400">Staff</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coaches.map(c => (
              <div key={c.name} className="bg-zinc-900 border border-white/10 rounded-xl p-8 hover:border-teal-500/40 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <span className="text-teal-400 font-black text-2xl">{c.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-xl font-black">{c.name}</p>
                    <p className="text-teal-400 font-semibold text-sm">{c.rank} · {c.role}</p>
                    <p className="text-gray-500 text-sm mt-0.5">🏆 {c.cred}</p>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed">{c.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-900 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Come train with us.</h2>
          <p className="text-gray-400 mb-8">Your first week is free. No experience needed.</p>
          <Link href="/book" className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors">
            BOOK YOUR FREE TRIAL
          </Link>
        </div>
      </section>
    </>
  )
}
