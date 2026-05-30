import type { Metadata } from 'next'
import BookingFlow from '@/components/BookingFlow'
import { fetchCatalogItems } from '@/lib/square'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shop | The Jiu-Jitsu Lab Waterloo',
  description: 'Shop academy merch from The Jiu-Jitsu Lab in Waterloo, ON.',
  alternates: { canonical: 'https://labjiujitsu.com/shop' },
  openGraph: { url: 'https://labjiujitsu.com/shop' },
}

interface ShopPageProps {
  searchParams?: Promise<{
    itemId?: string
    membership?: string
    variationId?: string
    variation?: string
    amount?: string
  }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const initialCatalogItems = await fetchCatalogItems().catch((err) => {
    console.error('Square catalog preload error:', err)
    return undefined
  })

  return (
    <section className="bg-zinc-950 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">The Jiu-Jitsu Lab</p>
        <h1 className="text-5xl font-black mb-4">Lab <span className="text-teal-400">Merch</span></h1>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed max-w-2xl">
          Rashguards, apparel, and academy gear from The Jiu-Jitsu Lab.
        </p>

        <div className="bg-zinc-900 border border-white/10 rounded-xl p-8">
          <BookingFlow
            initialCatalogItems={initialCatalogItems}
            allowedCategories={['merch']}
            initialCategory="merch"
            initialItemId={params?.itemId}
            initialItemName={params?.membership}
            initialVariationId={params?.variationId}
            initialVariationName={params?.variation}
            initialAmount={params?.amount}
          />
        </div>
      </div>
    </section>
  )
}
