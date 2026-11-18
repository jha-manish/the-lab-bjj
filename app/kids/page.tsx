import Link from 'next/link'
import Image from 'next/image'
import ClassBookingWidget from '@/components/ClassBookingWidget'
import { TRIAL_CLASSES } from '@/lib/trial-classes'
import { BASE_URL, pageMetadata } from '@/lib/seo'
import ReviewCards from '@/components/ReviewCards'
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL, parentReviews } from '@/lib/reviews'

export const metadata = pageMetadata({
  title: 'Kids Jiu-Jitsu Classes',
  description:
    'Kids Brazilian Jiu-Jitsu in Waterloo, ON for ages 5–14. Classes Monday to Thursday, 5–6 PM, led by Black Belt Roger Morais. Builds confidence, focus and real self-defence. First week free.',
  path: '/kids',
})

const KIDS_CLASS = TRIAL_CLASSES.filter((cls) => cls.level === 'Ages 5–14')

const benefits = [
  {
    title: 'Confidence',
    desc: 'Solving problems on the mat, against a real partner, gives kids a kind of confidence that carries into school and the playground.',
  },
  {
    title: 'Self-defence without striking',
    desc: 'Jiu-jitsu is a grappling art — no punches or kicks. Kids learn to control a situation and stay safe instead of hitting back.',
  },
  {
    title: 'Focus & discipline',
    desc: 'Every class has structure: warm-up, technique, drilling, and supervised practice. Listening and patience get rewarded.',
  },
  {
    title: 'Fitness that feels like play',
    desc: 'Rolling, games and partner drills build strength, balance and coordination without it ever feeling like a workout.',
  },
]

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday']

const faqs = [
  {
    q: 'What ages is the kids program for?',
    a: 'Our kids classes are for ages 5 to 14.',
  },
  {
    q: 'Do younger and older kids train together?',
    a: 'No. Younger and older kids are split into separate groups, so every child learns and practises with kids closer to their own age and size.',
  },
  {
    q: 'Does my child need any experience?',
    a: 'No. Most kids start with zero martial arts background. Classes are structured so beginners learn the fundamentals from day one.',
  },
  {
    q: 'When are kids classes?',
    a: 'Monday to Thursday, 5:00–6:00 PM, at 420 Weber St N in Waterloo.',
  },
  {
    q: 'Can my child try it before we sign up?',
    a: 'Yes — the first week is free, with no credit card and no commitment. Book a first class below.',
  },
  {
    q: 'What should my child wear to the first class?',
    a: 'Comfortable athletic clothes such as shorts and a t-shirt, plus a water bottle and sandals for off the mat. No gi is needed to start. Please arrive 10–15 minutes early so we can show you around.',
  },
  {
    q: 'Can parents train too?',
    a: 'Yes. Adult classes start at 6:00 PM on the same weeknights, right after the kids class finishes.',
  },
  {
    q: 'How much does the kids membership cost?',
    a: 'See the Youth membership on our Memberships page for current monthly pricing and the discounts for 3, 6 and 12-month pre-paid plans.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Kids Brazilian Jiu-Jitsu',
  serviceType: 'Kids martial arts classes',
  audience: { '@type': 'PeopleAudience', suggestedMinAge: 5, suggestedMaxAge: 14 },
  areaServed: ['Waterloo, ON', 'Kitchener, ON'],
  url: `${BASE_URL}/kids`,
  provider: {
    '@type': 'SportsActivityLocation',
    name: 'The Jiu-Jitsu Lab',
    url: BASE_URL,
  },
}

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export default function KidsPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={courseJsonLd} />

      {/* Hero */}
      <section className="bg-zinc-950 py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/images/hero/hero-circle.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/60" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">Ages 5–14 · Waterloo, ON</p>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Kids <span className="text-teal-400">Jiu-Jitsu</span>
            </h1>
            <p className="text-xl text-gray-200 mb-4 leading-relaxed">
              Confidence, focus and real self-defence — taught through fun, structured classes your kid will actually look forward to.
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Monday to Thursday, 5:00–6:00 PM, led by Black Belt Roger Morais, with younger and older kids in separate groups.
              The first week is free.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#book" className="bg-teal-500 hover:bg-teal-400 text-black font-black px-8 py-4 rounded text-lg transition-colors">
                BOOK A FREE KIDS CLASS
              </a>
              <Link
                href="/memberships"
                className="border border-white/30 bg-black/20 hover:bg-white/10 hover:border-white text-white font-semibold px-8 py-4 rounded text-lg transition-colors"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-xs uppercase mb-3">For Parents</p>
          <h2 className="text-4xl font-black mb-12">
            What Your Kid <span className="text-teal-400">Gets Out of It</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-zinc-950 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                <p className="text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach + schedule */}
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-teal-400 font-semibold tracking-widest text-xs uppercase mb-3">Your Kid&apos;s Coach</p>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-teal-500/20 shrink-0">
                <Image
                  src="/images/coaches/roger_morais.jpg"
                  alt="Roger Morais, kids jiu-jitsu coach"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black">Roger Morais</h2>
                <p className="text-teal-400 font-semibold text-sm">Black Belt · Head of Kids Program</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Roger has been training since 2011 and leads every kids class at The Lab. His patient, structured approach is built for young
              athletes — he focuses on discipline, confidence and a genuine love for the art, so kids keep coming back.
            </p>
          </div>

          <div>
            <p className="text-teal-400 font-semibold tracking-widest text-xs uppercase mb-3">Class Times</p>
            <h2 className="text-2xl font-black mb-5">Every weeknight, Monday to Thursday</h2>
            <div className="bg-zinc-900 border border-white/10 rounded-xl divide-y divide-white/5">
              {weekdays.map((day) => (
                <div key={day} className="flex items-center justify-between px-5 py-3">
                  <span className="font-semibold">{day}</span>
                  <span className="text-teal-400 font-mono text-sm">5:00–6:00 PM</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Younger and older kids train in separate groups. Parents train too? Adult classes start at 6:00 PM on the same nights.{' '}
              <Link href="/schedule" className="text-teal-400 hover:text-teal-300 font-semibold">
                Full schedule →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Parent reviews */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-xs uppercase mb-3">From Our Parents</p>
          <h2 className="text-4xl font-black mb-3">
            What Parents <span className="text-teal-400">Say</span>
          </h2>
          <p className="text-gray-400 mb-10">
            Rated {GOOGLE_RATING} on Google.{' '}
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 font-semibold">
              Read all reviews →
            </a>
          </p>
          <ReviewCards reviews={parentReviews} />
        </div>
      </section>

      {/* First class */}
      <section className="bg-zinc-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-10">
            Your Kid&apos;s <span className="text-teal-400">First Class</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-400">
            <div>
              <h3 className="font-bold text-lg text-white mb-3">What to wear</h3>
              <p className="leading-relaxed">Comfortable athletic clothes — shorts and a t-shirt are perfect. No gi needed to start, and no shoes on the mat.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-3">What to bring</h3>
              <p className="leading-relaxed">A water bottle and flip-flops or sandals for walking off the mat.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-3">When you arrive</h3>
              <p className="leading-relaxed">Come 10–15 minutes early so we can show you around. Change rooms on site and free parking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="bg-zinc-900 py-20 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">First week free · No credit card</p>
          <h2 className="text-4xl font-black mb-4">
            Book a <span className="text-teal-400">Free Kids Class</span>
          </h2>
          <p className="text-gray-300 mb-10 leading-relaxed">Pick a day that works and we&apos;ll see you on the mat.</p>
          <ClassBookingWidget classes={KIDS_CLASS} />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-950 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-10">
            Parent <span className="text-teal-400">FAQ</span>
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="group bg-zinc-900 border border-white/10 rounded-xl px-6 py-4 open:border-teal-500/40">
                <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-teal-400 text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-gray-400 leading-relaxed mt-3">
                  {f.a}
                  {f.q.startsWith('How much') && (
                    <>
                      {' '}
                      <Link href="/memberships" className="text-teal-400 hover:text-teal-300 font-semibold">
                        View memberships →
                      </Link>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
