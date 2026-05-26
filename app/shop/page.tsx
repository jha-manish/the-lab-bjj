import type { Metadata } from 'next'
import BookingFlow from '@/components/BookingFlow'
import { fetchCatalogItems } from '@/lib/square'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shop | The Jiu-Jitsu Lab Waterloo',
  description: 'Book private training, get a membership, or shop academy merch at The Jiu-Jitsu Lab in Waterloo, ON.',
}

type ShopCategory = 'privates' | 'memberships' | 'merch'

interface ShopPageProps {
  searchParams?: Promise<{
    category?: string
    itemId?: string
    membership?: string
    variationId?: string
    variation?: string
    amount?: string
  }>
}

function getInitialCategory(category: string | undefined): ShopCategory | undefined {
  if (category === 'privates' || category === 'memberships' || category === 'merch') {
    return category
  }

  return undefined
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const initialCategory = getInitialCategory(params?.category)
  const initialCatalogItems = await fetchCatalogItems().catch((err) => {
    console.error('Square catalog preload error:', err)
    return undefined
  })

  return (
    <section className="bg-zinc-950 py-20">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-teal-400 font-semibold tracking-widest text-sm uppercase mb-4">The Jiu-Jitsu Lab</p>
        <h1 className="text-5xl font-black mb-4">Shop & <span className="text-teal-400">Train</span></h1>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Private coaching, memberships, and academy gear — all in one place.
        </p>

        <div className="bg-zinc-900 border border-white/10 rounded-xl p-8">
          <BookingFlow
            initialCatalogItems={initialCatalogItems}
            allowedCategories={['privates', 'memberships', 'merch']}
            initialCategory={initialCategory}
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
