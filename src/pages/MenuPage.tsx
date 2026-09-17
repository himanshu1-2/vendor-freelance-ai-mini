import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { demoRestaurant } from '../data/restaurant'
import { listMenuItems, type MenuItem } from '../lib/menuApi'
import { NotFoundPage } from './NotFoundPage'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  currency: 'INR',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function MenuPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>()
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadMenu() {
    setIsLoading(true)
    setError(null)

    try {
      const menuItems = await listMenuItems()
      setItems(menuItems.filter((item) => item.isActive))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load the menu.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (restaurantSlug === demoRestaurant.slug) void loadMenu()
  }, [restaurantSlug])

  if (restaurantSlug !== demoRestaurant.slug) {
    return <NotFoundPage />
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="w-full rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Customer menu route</p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-tight tracking-tight text-stone-950">{demoRestaurant.name}</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-stone-600">{demoRestaurant.description}</p>
        <dl className="mt-8 grid gap-4 rounded-2xl bg-stone-50 p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold uppercase tracking-[0.16em] text-stone-400">Restaurant slug</dt>
            <dd className="mt-1 font-medium text-stone-800">{demoRestaurant.slug}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.16em] text-stone-400">Route</dt>
            <dd className="mt-1 break-all font-medium text-stone-800">/menu/{restaurantSlug}</dd>
          </div>
        </dl>

        <div className="mt-10 border-t border-stone-200 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Today&apos;s selection</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-stone-950">From our kitchen</h2>
            </div>
            {!isLoading && !error && <span className="text-sm text-stone-500">{items.length} item{items.length === 1 ? '' : 's'}</span>}
          </div>

          {isLoading && <p className="mt-6 rounded-2xl bg-stone-50 px-5 py-6 text-stone-600">Loading today&apos;s menu...</p>}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-red-900">
              <p>{error}</p>
              <button type="button" onClick={() => void loadMenu()} className="mt-4 font-semibold underline underline-offset-4">Try again</button>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <p className="mt-6 rounded-2xl bg-stone-50 px-5 py-6 text-stone-600">There are no available menu items right now. Please check back soon.</p>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-200">
              {items.map((item) => (
                <article key={item.id} className="flex items-start justify-between gap-5 p-5 first:rounded-t-2xl last:rounded-b-2xl hover:bg-stone-50">
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-semibold text-stone-950">{item.name}</h3>
                    {item.description && <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>}
                  </div>
                  <span className="shrink-0 pt-1 text-sm font-bold text-stone-900">{currencyFormatter.format(item.price)}</span>
                </article>
              ))}
            </div>
          )}
        </div>

        <Link className="mt-7 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-600/20" to="/">
          Back to QR demo
        </Link>
      </div>
    </section>
  )
}
