import type { Metadata } from 'next'
import { WAIVER_MEMBERSHIP_FORM } from '@/lib/forms'

export const metadata: Metadata = {
  title: 'Waiver & Membership Form',
  description: 'Complete your liability waiver and membership form for The Jiu-Jitsu Lab in Waterloo, ON.',
  alternates: { canonical: 'https://labjiujitsu.com/waiver' },
  robots: { index: false, follow: true },
}

export default function JoinPage() {
  return (
    <section className="bg-zinc-950 py-20">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">The Jiu-Jitsu Lab</p>
        <h1 className="text-5xl font-black mb-4">
          Waiver & <span className="text-teal-400">Membership Form</span>
        </h1>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Complete the form below to sign your waiver and register as a member.
        </p>

        <div className="rounded-xl overflow-hidden border border-white/10 bg-white">
          <iframe
            src={WAIVER_MEMBERSHIP_FORM.embedUrl}
            title="Waiver and membership form"
            className="block w-full h-[85vh] min-h-[640px] border-0"
            loading="lazy"
          >
            Loading…
          </iframe>
        </div>

        <p className="text-center mt-4 text-sm text-gray-500">
          Having trouble?{' '}
          <a
            href={WAIVER_MEMBERSHIP_FORM.shareUrl}
            target="_blank"
            rel="noreferrer"
            className="text-teal-400 hover:text-teal-300 transition-colors"
          >
            Open the form in a new tab →
          </a>
        </p>
      </div>
    </section>
  )
}
