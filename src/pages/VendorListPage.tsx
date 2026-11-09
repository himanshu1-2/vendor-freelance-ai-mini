import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listVendors, type VendorSummary } from '../lib/menuApi'

export function VendorListPage() {
  const [vendors, setVendors] = useState<VendorSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVendors() {
      try {
        setVendors(await listVendors())
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load restaurants.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadVendors()
  }, [])

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">All vendors</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-stone-950">Choose a vendor</h1>

        {isLoading && <p className="mt-6 text-sm text-stone-600">Loading vendors from the backend...</p>}

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Could not load restaurants: {error}. Check that the FastAPI server and database are available, then refresh.
          </div>
        )}

        {!isLoading && !error && vendors.length === 0 && (
          <div className="mt-6 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600">
            No restaurants are registered yet.
            <Link className="ml-2 font-semibold text-amber-800 underline underline-offset-4" to="/auth/register">Register the first restaurant</Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Vendor ID</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-stone-950">{vendor.name}</h2>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={`/menu/${vendor.slug}`}
                  className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
                >
                  View customer menu
                </Link>
                <Link
                  to={`/vendor/${vendor.slug}`}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
                >
                  Edit menu
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
