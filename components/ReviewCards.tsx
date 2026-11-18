import { GOOGLE_RATING, GOOGLE_REVIEWS_URL, type Review } from '@/lib/reviews'

export function GoogleRatingLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 hover:text-teal-300 transition-colors ${className}`}
    >
      <span className="text-teal-400 tracking-widest" aria-hidden="true">★★★★★</span>
      <span>
        <span className="font-bold">{GOOGLE_RATING}</span> on Google reviews
      </span>
    </a>
  )
}

export default function ReviewCards({
  reviews,
  cardClassName = 'bg-zinc-950',
}: {
  reviews: Review[]
  cardClassName?: string
}) {
  const cols = reviews.length % 2 === 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'
  return (
    <div className={`grid grid-cols-1 ${cols} gap-6`}>
      {reviews.map((r) => (
        <figure key={r.name + r.quote.slice(0, 20)} className={`${cardClassName} border border-white/10 rounded-xl p-6 flex flex-col`}>
          <p className="text-teal-400 tracking-widest mb-3" aria-label="5 out of 5 stars">★★★★★</p>
          <blockquote className="text-gray-300 leading-relaxed flex-1">&ldquo;{r.quote}&rdquo;</blockquote>
          <figcaption className="mt-4 text-sm text-gray-500">
            <span className="text-white font-semibold">{r.name}</span> · {r.role} · Google review
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
