import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode } from '../components/common/QrCode'
import { listVendors, type VendorSummary } from '../lib/menuApi'

export function HomePage() {
  const [vendors, setVendors] = useState<VendorSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVendors() {
      try {
        const items = await listVendors()
        setVendors(items)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load restaurants.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadVendors()
  }, [])

  const vendor = vendors[0]
  const qrTarget = useMemo(() => {
    if (!vendor) {
      return '/vendors'
    }

    return `/menu/${vendor.slug}`
  }, [vendor])

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl items-center px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">QR daily menu entry</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-stone-950 sm:text-7xl">
            {vendor?.name ?? 'Vendor menu'}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            {vendor ? 'Scan the permanent restaurant QR link to see its current menu.' : 'Restaurants can register to publish a menu. Customers can scan a restaurant QR code to open its menu.'}
          </p>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Restaurant menu QR link</p>
          <a className="mt-3 block max-w-xl break-all text-sm text-amber-800 underline decoration-amber-300 underline-offset-4 focus:outline-none focus:ring-4 focus:ring-amber-600/20" href={qrTarget}>
            {qrTarget}
          </a>

          <div className="mt-8 flex flex-wrap gap-3">
            {isLoading && <span className="text-sm text-stone-500">Loading vendor...</span>}
            {error && <span role="alert" className="text-sm text-red-800">Could not load restaurants: {error}</span>}
            {!isLoading && vendor && (
              <Link
                to={`/vendor/${vendor.slug}`}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
              >
                Vendor access
              </Link>
            )}
            <Link
              to="/auth/register"
              className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Register restaurant
            </Link>
            <Link
              to="/auth/login"
              className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              Admin / vendor login
            </Link>
            <Link to="/vendors" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100">
              Browse restaurants
            </Link>
          </div>
        </div>

        <div className="justify-self-center rounded-[2rem] border border-stone-200 bg-white p-5 shadow-xl shadow-stone-900/5 sm:p-7">
          <QrCode value={qrTarget} label={`QR code linking to the ${vendor?.name ?? 'vendor'} daily menu`} />
          <p className="mt-4 text-center text-xs font-medium text-stone-500">Point your phone camera here</p>
        </div>
      </div>
    </section>
  )
}
