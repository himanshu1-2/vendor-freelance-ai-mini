export type Vendor = {
  id: string
  slug: string
  name: string
  description: string
  city: string
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

export const vendors: Vendor[] = [
  {
    id: 'vendor-1',
    slug: 'spice-garden',
    name: 'Spice Garden',
    description: 'A warm Indian kitchen serving regional favourites and family recipes.',
    city: 'Pune',
  },
  {
    id: 'vendor-2',
    slug: 'saffron-table',
    name: 'Saffron Table',
    description: 'Comfort food and festive specials with a modern home-style twist.',
    city: 'Bengaluru',
  },
]

export const menuCatalog: MenuItem[] = [
  { id: 'm-1', vendorId: 'vendor-1', name: 'Paneer Tikka Wrap', description: 'Char-grilled paneer, mint chutney and onion relish.', category: 'Starters', isActive: true },
  { id: 'm-2', vendorId: 'vendor-1', name: 'Veg Biryani', description: 'Fragrant rice with seasonal vegetables and saffron.', category: 'Main Course', isActive: true },
  { id: 'm-3', vendorId: 'vendor-1', name: 'Masala Chai', description: 'Fresh-brewed milk tea with cardamom and ginger.', category: 'Beverages', isActive: true },
  { id: 'm-4', vendorId: 'vendor-1', name: 'Butter Naan', description: 'Soft tandoor-roasted naan finished with butter.', category: 'Sides', isActive: true },
  { id: 'm-5', vendorId: 'vendor-2', name: 'Pesto Pasta', description: 'Creamy basil pesto pasta with roasted vegetables.', category: 'Main Course', isActive: true },
  { id: 'm-6', vendorId: 'vendor-2', name: 'Citrus Spritz', description: 'Refreshing orange and lemon cooler.', category: 'Beverages', isActive: true },
  { id: 'm-7', vendorId: 'vendor-2', name: 'Crispy Corn Bites', description: 'Golden fried corn bites with chilli-lime seasoning.', category: 'Starters', isActive: true },
]

export const dailyMenuRecords: DailyMenuItem[] = [
  { id: 'd-1', vendorId: 'vendor-1', menuItemId: 'm-1', date: getTodayIsoDate(), price: 179, stockCount: 18, available: true },
  { id: 'd-2', vendorId: 'vendor-1', menuItemId: 'm-2', date: getTodayIsoDate(), price: 249, stockCount: 12, available: true },
  { id: 'd-3', vendorId: 'vendor-1', menuItemId: 'm-3', date: getTodayIsoDate(), price: 69, stockCount: 20, available: true },
  { id: 'd-4', vendorId: 'vendor-2', menuItemId: 'm-5', date: getTodayIsoDate(), price: 299, stockCount: 10, available: true },
  { id: 'd-5', vendorId: 'vendor-2', menuItemId: 'm-6', date: getTodayIsoDate(), price: 129, stockCount: 15, available: true },
  { id: 'd-6', vendorId: 'vendor-2', menuItemId: 'm-7', date: getTodayIsoDate(), price: 189, stockCount: 8, available: false },
]

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  return vendors.find((vendor) => vendor.slug === slug)
}

export function getMenuItemsForVendor(vendorId: string): MenuItem[] {
  return menuCatalog.filter((item) => item.vendorId === vendorId && item.isActive)
}

export function getDailyMenuForVendorDate(vendorId: string, date: string): DailyMenuItem[] {
  return dailyMenuRecords.filter((record) => record.vendorId === vendorId && record.date === date)
}

export function getTodayAvailableMenuForVendor(vendorId: string): Array<MenuItem & { price: number }> {
  const records = getDailyMenuForVendorDate(vendorId, getTodayIsoDate())
  return records
    .filter((record) => record.available)
    .map((record) => {
      const menuItem = menuCatalog.find((item) => item.id === record.menuItemId)
      if (!menuItem) {
        return null
      }

      return {
        ...menuItem,
        price: record.price,
      }
    })
    .filter((item): item is MenuItem & { price: number } => item !== null)
}

export function upsertDailyMenuItem(input: {
  vendorId: string
  menuItemId: string
  date: string
  price: number
  stockCount: number
  available: boolean
}): DailyMenuItem {
  const existingIndex = dailyMenuRecords.findIndex(
    (record) => record.vendorId === input.vendorId && record.menuItemId === input.menuItemId && record.date === input.date,
  )

  if (existingIndex >= 0) {
    const existing = dailyMenuRecords[existingIndex]
    const updated = { ...existing, ...input }
    dailyMenuRecords[existingIndex] = updated
    return updated
  }

  const created: DailyMenuItem = {
    id: `d-${Date.now()}-${input.menuItemId}`,
    vendorId: input.vendorId,
    menuItemId: input.menuItemId,
    date: input.date,
    price: input.price,
    stockCount: input.stockCount,
    available: input.available,
  }

  dailyMenuRecords.push(created)
  return created
}

export function createMenuItem(input: { vendorId: string; name: string; description: string; category: string }): MenuItem {
  const item: MenuItem = {
    id: `m-${Date.now()}`,
    vendorId: input.vendorId,
    name: input.name,
    description: input.description,
    category: input.category,
    isActive: true,
  }

  menuCatalog.push(item)
  return item
}

export const demoRestaurant = vendors[0]
export const localMenuUrl = `/vendor/${demoRestaurant.slug}/menu/${getTodayIsoDate()}`
