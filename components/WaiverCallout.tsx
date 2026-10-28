import Link from 'next/link'

export default function WaiverCallout() {
  return (
    <div className="max-w-sm mx-auto mb-8 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-left">
      <p className="text-amber-400 font-black text-sm mb-1">One more step</p>
      <p className="text-gray-300 text-sm mb-3">Complete your waiver so you&apos;re all set.</p>
      <Link
        href="/waiver"
        className="inline-block bg-teal-500 hover:bg-teal-400 text-black font-black text-sm px-4 py-2 rounded transition-colors"
      >
        Sign your waiver →
      </Link>
    </div>
  )
}
