import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listVendorDailyMenu, listVendorItemCatalog, type MenuItem } from '../lib/menuApi'
import { NotFoundPage } from './NotFoundPage'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  currency: 'INR',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function DailyMenuPage() {
  const { vendorSlug, date } = useParams<{ vendorSlug: string; date: string }>()
  const vendor = vendorSlug ? { id: vendorSlug, slug: vendorSlug, name: vendorSlug } : undefined

  const [catalog, setCatalog] = useState<MenuItem[]>([])
  const [items, setItems] = useState<Array<{ menuItemId: string; price: number; stockCount: number; available: boolean }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!vendor || !date) {
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const [catalogItems, dailyMenu] = await Promise.all([
          listVendorItemCatalog(vendor.slug),
          listVendorDailyMenu(vendor.slug, date),
        ])

        setCatalog(catalogItems)
        setItems(
          catalogItems.map((item) => {
            const record = dailyMenu.find((entry) => entry.menuItemId === item.id)
            return {
              menuItemId: item.id,
              price: record?.price ?? 0,
              stockCount: record?.stockCount ?? 0,
              available: record?.available ?? true,
            }
          }),
        )
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load the daily menu.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [vendor, date])

  if (!vendor) {
    return <NotFoundPage />
  }

  if (!date) {
    return <NotFoundPage />
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Daily menu</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-stone-950">{vendor.name}</h1>
          </div>
          <Link className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100" to={`/vendor/${vendor.slug}`}>
            Back to manager
          </Link>
        </div>

        <p className="mt-4 text-sm font-medium text-stone-600">Date: {date}</p>

        {isLoading && <p className="mt-6 rounded-2xl bg-stone-50 px-5 py-6 text-stone-600">Loading daily menu...</p>}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-red-900">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-200">
            {catalog.length === 0 && <p className="p-5 text-sm text-stone-600">No menu items yet.</p>}

            {catalog.map((item) => {
              const record = items.find((entry) => entry.menuItemId === item.id)

              return (
                <article key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">{item.category}</span>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-stone-950">{item.name}</h3>
                    {item.description && <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-stone-900">{currencyFormatter.format(record?.price ?? 0)}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record?.available ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                      {record?.available ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
