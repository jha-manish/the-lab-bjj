import Link from 'next/link'
import Image from 'next/image'
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
    cred: 'IBJJF World Champion',
    bio: 'Dave brings world-championship experience to The Jiu-Jitsu Lab\'s competition program. As a IBJJF World Champion, his knowledge of high-level competition is an invaluable resource for anyone looking to compete.',
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
      <section className="bg-zinc-950 py-20 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[520px] overflow-hidden">
          <div
            className="absolute inset-y-0 right-0 w-full lg:w-[58%] bg-cover bg-[center_70%] opacity-20 lg:opacity-50"
            style={{ backgroundImage: "url('/images/hero/hero-group.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/80 lg:to-zinc-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-transparent to-zinc-950" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-20 max-w-2xl">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Who We Are</p>
          <h1 className="text-5xl font-black mb-6">The Jiu-Jitsu Lab <span className="text-teal-400">Story</span></h1>
          <p className="text-gray-400 leading-relaxed mb-4">
            The Jiu-Jitsu Lab was built on a single belief: that dedicated, focused instruction beats generalist training every time.
            We don&apos;t offer kickboxing, yoga, or fitness classes. We do one thing — Brazilian Jiu-Jitsu — and we do it at the highest level.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Located at{' '}
            <a
              href="https://maps.app.goo.gl/aJwg6Sc1smkmKRTz7"
              target="_blank"
              rel="noreferrer"
              className="text-white font-semibold hover:text-teal-300 transition-colors"
            >
              420 Weber St N in Waterloo, ON
            </a>
            , we serve beginners, recreational grapplers, students, parents, and competitors.
            Whatever your goal on the mat, we have the coaching staff to get you there.
          </p>
          </div>

          {/* Roots section */}
          <div className="mb-16 max-w-3xl">
            <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Our Roots</p>
            <h2 className="text-4xl font-black mb-8">Where It All <span className="text-teal-400">Started</span></h2>

            {/* Timeline */}
            <div className="flex flex-col gap-0">

              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="w-0.5 bg-white/10 flex-1 mt-2" />
                </div>
                <div className="pb-10">
                  <p className="text-teal-400 font-black text-sm tracking-widest uppercase mb-1">1998</p>
                  <h3 className="text-xl font-black mb-2">Dragan Alliance — The Beginning</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Dragan Konjevic opened his doors in 1998, becoming the <span className="text-white font-semibold">first person to bring Brazilian Jiu-Jitsu to the Kitchener-Waterloo region</span> and earning his black belt — the first in the area.
                    Under the banner of Dragan Alliance, he spent decades building a BJJ community from scratch in KW,
                    at a time when almost no one in the region had heard of the sport.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="w-0.5 bg-white/10 flex-1 mt-2" />
                </div>
                <div className="pb-10">
                  <p className="text-teal-400 font-black text-sm tracking-widest uppercase mb-1">The Lineage</p>
                  <h3 className="text-xl font-black mb-2">Promoted by a Legend</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Dragan is an Alliance black belt promoted by{' '}
                    <span className="text-white font-semibold">Romero &quot;Jacaré&quot; Cavalcanti</span> — one of the most respected figures in the history of Brazilian Jiu-Jitsu and founder of Alliance, one of the sport&apos;s most decorated teams.
                    That lineage runs directly through everything we teach at The Jiu-Jitsu Lab.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="w-0.5 bg-white/10 flex-1 mt-2" />
                </div>
                <div className="pb-10">
                  <p className="text-teal-400 font-black text-sm tracking-widest uppercase mb-1">The Legacy</p>
                  <h3 className="text-xl font-black mb-2">A Region Built on His Foundation</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Over 25 years, Dragan&apos;s students have gone on to win major titles at the national and international level
                    and have opened multiple gyms across the KW region. Nearly every black belt in the area today traces
                    their roots back to him — including our own coaches Dave Knowles, Brandon Twaddle, and Roger Morais.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                </div>
                <div className="pb-2">
                  <p className="text-teal-400 font-black text-sm tracking-widest uppercase mb-1">Today</p>
                  <h3 className="text-xl font-black mb-2">The Lab Lives On</h3>
                  <p className="text-gray-400 leading-relaxed">
                    The idea of &quot;The Lab&quot; was Dragan&apos;s concept — a dedicated space where BJJ was the only focus.
                    That vision is what The Jiu-Jitsu Lab was built on. He still comes in to teach semi-regularly,
                    and his presence is a reminder of where all of this came from.
                  </p>
                </div>
              </div>

            </div>

            <div className="border-l-4 border-teal-500 pl-6 mt-4">
              <p className="text-white font-semibold italic text-lg">
                When you train here, you&apos;re not just joining a gym. You&apos;re joining 25+ years of lineage.
              </p>
            </div>
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

      {/* Photo Gallery */}
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">The Gym</p>
          <h2 className="text-4xl font-black mb-12">Life on the <span className="text-teal-400">Mat</span></h2>

          {/* Feature photo — group shot */}
          <div className="relative w-full rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/7' }}>
            <Image
              src="/images/hero/hero-group.jpg"
              alt="The Jiu-Jitsu Lab — class group photo"
              fill
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover object-center"
            />
          </div>

          {/* 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image
                src="/images/hero/hero-circle.jpg"
                alt="Class circle on the mat"
                fill
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
              />
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image
                src="/images/hero/hero-overhead.jpg"
                alt="Overhead view of a class in session"
                fill
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
              />
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image
                src="/images/hero/hero-sparring.jpg"
                alt="Live sparring session"
                fill
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover object-center"
              />
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image
                src="/images/hero/hero-drilling.jpg"
                alt="Drilling on the mat"
                fill
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
              />
            </div>
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
