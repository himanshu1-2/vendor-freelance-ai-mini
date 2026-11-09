import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { QrCode } from '../components/common/QrCode'
import { getCurrentUser, listVendors, type AuthUser, type VendorSummary } from '../lib/menuApi'

export function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [vendors, setVendors] = useState<VendorSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser.role !== 'admin') {
          setError('Administrator access is required.')
          return
        }
        setUser(currentUser)
        setVendors(await listVendors())
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load admin dashboard.')
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  if (isLoading) {
    return <p className="mx-auto max-w-5xl px-5 py-12 text-stone-600">Loading administrator dashboard...</p>
  }

  if (error === 'Login required' || error === 'Session is invalid' || error === 'Session has expired') {
    return <Navigate to="/auth/login" replace />
  }

  if (user?.role === 'vendor') {
    return <Navigate to={`/vendor/${user.vendor_id ?? ''}`} replace />
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Administrator</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-stone-950">All restaurants</h1>
        <p className="mt-2 text-sm text-stone-600">Signed in as {user?.email}. You can view and manage every registered vendor.</p>

        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

        {!error && vendors.length === 0 && (
          <div className="mt-6 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600">
            No vendors have registered yet.
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {vendors.map((vendor) => {
            const menuUrl = `${window.location.origin}/menu/${vendor.slug}`
            return (
              <article key={vendor.id} className="flex flex-col gap-5 rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-2xl font-semibold text-stone-950">{vendor.name}</h2>
                  <p className="mt-1 break-all text-sm text-stone-600">{menuUrl}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to={`/vendor/${vendor.slug}`} className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
                      Manage menu
                    </Link>
                    <Link to={`/menu/${vendor.slug}`} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100">
                      Customer view
                    </Link>
                  </div>
                </div>
                <div className="w-32 shrink-0 self-center">
                  <QrCode value={menuUrl} label={`${vendor.name} permanent menu QR code`} />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
