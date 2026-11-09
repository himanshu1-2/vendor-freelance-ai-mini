export type VendorSummary = {
  id: string
  slug: string
  name: string
}

export type AuthUser = {
  id: number
  email: string
  role: 'admin' | 'vendor'
  vendor_id: string | null
  vendor_name: string | null
}

export type MenuItem = {
  id: string
  vendorId: string
  name: string
  description: string
  category: string
  isActive: boolean
}

export type DailyMenuItem = {
  id: string
  vendorId: string
  menuItemId: string
  date: string
  price: number
  stockCount: number
  available: boolean
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    let message = errorText || `Request failed (${response.status})`
    try {
      const body = JSON.parse(errorText) as { detail?: unknown }
      if (typeof body.detail === 'string') {
        message = body.detail
      }
    } catch {
      // Keep the response text when the server does not return JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function listVendors(): Promise<VendorSummary[]> {
  const vendors = await apiFetch<Array<{ slug: string; name: string }>>('/menu/vendors')
  return vendors.map((vendor) => ({
    id: vendor.slug,
    slug: vendor.slug,
    name: vendor.name,
  }))
}

export async function registerVendor(payload: {
  email: string
  password: string
  restaurant_name: string
}): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: { email: string; password: string }): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me')
}

export async function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}

export async function listMenuItems(vendorSlug: string): Promise<Array<MenuItem & { price: number }>> {
  const items = await apiFetch<Array<{
    id: number
    vendor_id: string
    name: string
    description: string | null
    category: string
    price: number
    available: boolean
  }>>(`/menu/${vendorSlug}/today`)

  return items.map((item) => ({
    id: String(item.id),
    vendorId: item.vendor_id,
    name: item.name,
    description: item.description ?? '',
    category: item.category,
    isActive: true,
    price: item.price,
  }))
}

export async function listVendorItemCatalog(vendorSlug: string): Promise<MenuItem[]> {
  const items = await apiFetch<Array<{
    id: number
    vendor_id: string
    name: string
    description: string | null
    category: string
    is_active: boolean
    created_at: string
  }>>(`/menu/items/${vendorSlug}`)

  return items.map((item) => ({
    id: String(item.id),
    vendorId: item.vendor_id,
    name: item.name,
    description: item.description ?? '',
    category: item.category,
    isActive: item.is_active,
  }))
}

export async function listPreviouslyUsedMenuItems(vendorSlug: string): Promise<MenuItem[]> {
  const items = await apiFetch<Array<{
    id: number
    vendor_id: string
    name: string
    description: string | null
    category: string
    is_active: boolean
    created_at: string
  }>>(`/menu/items/${vendorSlug}/previously-used`)

  return items.map((item) => ({
    id: String(item.id),
    vendorId: item.vendor_id,
    name: item.name,
    description: item.description ?? '',
    category: item.category,
    isActive: item.is_active,
  }))
}

export async function listVendorDailyMenu(vendorSlug: string, date: string): Promise<DailyMenuItem[]> {
  const items = await apiFetch<Array<{
    id: number
    vendor_id: string
    date: string
    menu_item_id: number
    price: number
    stock_count: number
    available: boolean
    created_at: string
    updated_at: string
  }>>(`/menu/daily/${vendorSlug}/${date}`)

  return items.map((item) => ({
    id: String(item.id),
    vendorId: item.vendor_id,
    menuItemId: String(item.menu_item_id),
    date: item.date,
    price: item.price,
    stockCount: item.stock_count,
    available: item.available,
  }))
}

export async function saveVendorDailySelections(vendorSlug: string, date: string, selections: Array<{
  menuItemId: string
  price: number
  stockCount: number
  available: boolean
}>): Promise<DailyMenuItem[]> {
  const payload = selections.map((selection) => ({
    vendor_id: vendorSlug,
    date,
    menu_item_id: Number(selection.menuItemId),
    price: selection.price,
    stock_count: selection.stockCount,
    available: selection.available,
  }))

  const saved = await apiFetch<Array<{
    id: number
    vendor_id: string
    date: string
    menu_item_id: number
    price: number
    stock_count: number
    available: boolean
    created_at: string
    updated_at: string
  }>>(`/menu/daily/${vendorSlug}/${date}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return saved.map((item) => ({
    id: String(item.id),
    vendorId: item.vendor_id,
    menuItemId: String(item.menu_item_id),
    date: item.date,
    price: item.price,
    stockCount: item.stock_count,
    available: item.available,
  }))
}

export async function createVendorMenuItem(vendorSlug: string, payload: { name: string; description: string; category: string }): Promise<MenuItem> {
  const created = await apiFetch<{
    id: number
    vendor_id: string
    name: string
    description: string | null
    category: string
    is_active: boolean
    created_at: string
  }>(`/menu/items`, {
    method: 'POST',
    body: JSON.stringify({
      vendor_id: vendorSlug,
      name: payload.name,
      description: payload.description,
      category: payload.category,
      is_active: true,
    }),
  })

  return {
    id: String(created.id),
    vendorId: created.vendor_id,
    name: created.name,
    description: created.description ?? '',
    category: created.category,
    isActive: created.is_active,
  }
}
