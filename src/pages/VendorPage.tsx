import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QrCode } from '../components/common/QrCode'
import {
    createVendorMenuItem,
    getCurrentUser,
    listVendorDailyMenu,
    listVendorItemCatalog,
    listPreviouslyUsedMenuItems,
    logout,
    saveVendorDailySelections,
    type AuthUser,
    type MenuItem,
} from '../lib/menuApi'

const today = new Date().toISOString().slice(0, 10)

export function VendorPage() {
    const { vendorSlug } = useParams<{ vendorSlug: string }>()
    const vendor = vendorSlug ? { id: vendorSlug, slug: vendorSlug, name: vendorSlug } : undefined
    const navigate = useNavigate()

    const [catalog, setCatalog] = useState<MenuItem[]>([])
  const [previouslyUsedItems, setPreviouslyUsedItems] = useState<MenuItem[]>([])
  const [catalogView, setCatalogView] = useState<'all' | 'previously-used'>('all')
  const [dailyMenu, setDailyMenu] = useState<Array<{ menuItemId: string; price: number; stockCount: number; available: boolean }>>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('Main Course')
  const [selectedDate, setSelectedDate] = useState(today)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const canManage = Boolean(
    authUser &&
    (authUser.role === 'admin' || (authUser.role === 'vendor' && authUser.vendor_id === vendorSlug)),
  )

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        setAuthUser(await getCurrentUser())
      } catch (caughtError) {
        setAuthUser(null)
        if (!(caughtError instanceof Error) || !caughtError.message.includes('Login required')) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to verify your session.')
        }
      } finally {
        setIsAuthLoading(false)
      }
    }

    void loadCurrentUser()
  }, [])

  async function loadVendorData() {
    if (!vendor) {
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const [items, previouslyUsed, records] = await Promise.all([
        listVendorItemCatalog(vendor.slug),
        listPreviouslyUsedMenuItems(vendor.slug),
        listVendorDailyMenu(vendor.slug, selectedDate),
      ])

      setCatalog(items)
      setPreviouslyUsedItems(previouslyUsed)
      setDailyMenu(
        records.map((record) => ({
            menuItemId: record.menuItemId,
            price: record?.price ?? 0,
            stockCount: record?.stockCount ?? 0,
            available: record?.available ?? true,
          })),
      )
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load vendor menu.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!vendor || !canManage) {
      return
    }

    void loadVendorData()
  }, [vendorSlug, selectedDate, canManage])

  const handleLogout = async () => {
    try {
      await logout()
      setAuthUser(null)
      navigate('/auth/login', { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log out.')
    }
  }

  const handleCreateMenuItem = async () => {
    if (!vendor || !newItemName.trim()) {
      setError('Name is required to create a menu item.')
      return
    }

    try {
      setError(null)
      const created = await createVendorMenuItem(vendor.slug, {
        name: newItemName.trim(),
        description: newItemDescription.trim(),
        category: newItemCategory,
      })

      setCatalog((current) => [...current, created])
      setCatalogView('all')
      setNewItemName('')
      setNewItemDescription('')
      setMessage(`Created ${created.name}.`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create menu item.')
    }
  }

  const updateDailyItem = (
    menuItemId: string,
    update: Partial<{ price: number; stockCount: number; available: boolean }>,
  ) => {
    setDailyMenu((current) => {
      if (!current.some((entry) => entry.menuItemId === menuItemId)) {
        return current
      }
      return current.map((entry) =>
        entry.menuItemId === menuItemId ? { ...entry, ...update } : entry,
      )
    })
  }

  const toggleDailyItem = (menuItemId: string, selected: boolean) => {
    setDailyMenu((current) => {
      if (selected) {
        if (current.some((entry) => entry.menuItemId === menuItemId)) {
          return current
        }
        return [...current, { menuItemId, price: 0, stockCount: 0, available: true }]
      }
      return current.filter((entry) => entry.menuItemId !== menuItemId)
    })
  }

  const handleSaveDailyMenu = async () => {
    if (!vendor) {
      return
    }

    try {
      setError(null)
      const saved = await saveVendorDailySelections(vendor.slug, selectedDate, dailyMenu)
      setDailyMenu(saved.map((entry) => ({
        menuItemId: entry.menuItemId,
        price: entry.price,
        stockCount: entry.stockCount,
        available: entry.available,
      })))
      setMessage('Daily menu saved successfully.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save menu.')
    }
  }

  if (!vendor) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-lg font-semibold text-stone-800">Vendor not found.</p>
        <Link className="mt-4 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white" to="/">
          Back to home
        </Link>
      </section>
    )
  }

  if (isAuthLoading) {
    return <p className="mx-auto max-w-lg px-5 py-12 text-stone-600">Checking account...</p>
  }

  if (!authUser) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-lg items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Vendor access</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-stone-950">Log in to manage</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Sign in with the vendor account registered for this restaurant.</p>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <div className="mt-6 flex flex-col gap-3">
            <Link className="inline-flex w-full justify-center rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800" to="/auth/login">
              Log in
            </Link>
            <Link className="inline-flex w-full justify-center rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-100" to="/auth/register">
              Register a restaurant
            </Link>
            <Link className="inline-flex w-full justify-center rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-100" to="/">
              Back to menu
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (!canManage) {
    return (
      <section className="mx-auto max-w-lg px-5 py-12">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          This account cannot manage this restaurant.
        </div>
        <Link className="mt-4 inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800" to={authUser.role === 'admin' ? '/admin' : `/vendor/${authUser.vendor_id ?? ''}`}>
          Go to your dashboard
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              {authUser.role === 'admin' ? 'Administrator menu access' : 'Vendor dashboard'}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-stone-950">{vendor.name}</h1>
          </div>
          <div className="flex gap-2">
            {authUser.role === 'admin' && (
              <Link className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100" to="/admin">
                All vendors
              </Link>
            )}
            <Link className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100" to="/">
              Back to QR demo
            </Link>
            <button type="button" onClick={() => void handleLogout()} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100">
              Log out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex items-center gap-5 rounded-2xl border border-stone-200 bg-stone-50 p-5 lg:col-span-2">
            <div className="w-28 shrink-0">
              <QrCode
                value={`${window.location.origin}/menu/${vendor.slug}`}
                label={`Permanent menu QR code for ${vendor.name}`}
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-semibold text-stone-900">Your permanent menu QR</h2>
              <p className="mt-2 break-all text-sm text-stone-600">{`${window.location.origin}/menu/${vendor.slug}`}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="font-display text-2xl font-semibold text-stone-900">Create Menu Item</h2>
            <div className="mt-4 space-y-3">
              <input value={newItemName} onChange={(event) => setNewItemName(event.target.value)} placeholder="Item name" className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-stone-500" />
              <input value={newItemDescription} onChange={(event) => setNewItemDescription(event.target.value)} placeholder="Description" className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-stone-500" />
              <select value={newItemCategory} onChange={(event) => setNewItemCategory(event.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500">
                <option>Main Course</option>
                <option>Starters</option>
                <option>Sides</option>
                <option>Beverages</option>
              </select>
              <button type="button" onClick={() => void handleCreateMenuItem()} className="w-full rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
                Add menu item
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl font-semibold text-stone-900">Daily menu</h2>
              <div className="flex items-center gap-2">
                <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500" />
              </div>
            </div>

            <div className="mt-4 flex gap-2" role="group" aria-label="Menu item list">
              <button
                type="button"
                aria-pressed={catalogView === 'all'}
                onClick={() => setCatalogView('all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${catalogView === 'all' ? 'bg-stone-950 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100'}`}
              >
                All items ({catalog.length})
              </button>
              <button
                type="button"
                aria-pressed={catalogView === 'previously-used'}
                onClick={() => setCatalogView('previously-used')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${catalogView === 'previously-used' ? 'bg-stone-950 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100'}`}
              >
                Previously used ({previouslyUsedItems.length})
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {catalogView === 'all' && catalog.length === 0 && <p className="text-sm text-stone-600">No menu items yet. Create one to begin.</p>}
              {catalogView === 'previously-used' && previouslyUsedItems.length === 0 && <p className="text-sm text-stone-600">No previously used menu items yet. Add items to a daily menu and they will appear here for future dates.</p>}

              {(catalogView === 'all' ? catalog : previouslyUsedItems).map((item) => {
                const itemEntry = dailyMenu.find((entry) => entry.menuItemId === item.id)

                return (
                  <div key={item.id} className="rounded-xl border border-stone-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.category}</p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                        <input
                          type="checkbox"
                          checked={Boolean(itemEntry)}
                          onChange={(event) => toggleDailyItem(item.id, event.target.checked)}
                        />
                        Include on daily menu
                      </label>
                    </div>

                    {itemEntry && <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <label className="text-xs font-medium text-stone-700">
                        Price
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={itemEntry?.price ?? 0}
                          onChange={(event) => updateDailyItem(item.id, { price: Number(event.target.value) })}
                          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm"
                        />
                      </label>

                      <label className="text-xs font-medium text-stone-700">
                        Stock
                        <input
                          type="number"
                          min="0"
                          value={itemEntry?.stockCount ?? 0}
                          onChange={(event) => updateDailyItem(item.id, { stockCount: Number(event.target.value) })}
                          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm"
                        />
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                        <input
                          type="checkbox"
                          checked={itemEntry.available}
                          onChange={(event) => updateDailyItem(item.id, { available: event.target.checked })}
                        />
                        Available to customers
                      </label>
                    </div>}
                    {!itemEntry && item.description && <p className="mt-2 text-xs text-stone-500">{item.description}</p>}
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={() => void handleSaveDailyMenu()} className="rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
                Save daily menu ({dailyMenu.length} selected)
              </button>
              <button type="button" onClick={() => void loadVendorData()} className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100">
                Refresh
              </button>
            </div>

            {message && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
            {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          </div>
        </div>
      </div>

      {isLoading && <p className="mt-4 text-sm text-stone-600">Loading vendor menu...</p>}
    </section>
  )
}
