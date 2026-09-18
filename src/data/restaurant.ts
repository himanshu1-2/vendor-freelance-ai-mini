export const demoRestaurant = {
  name: 'A1 FOODS',
  slug: 'spice-garden',
  description: 'A warm Indian kitchen serving regional favourites and family recipes.',
}

const reactUrl = (import.meta.env.REACT_APP_URL ?? 'https://vendor-freelance-ai-mini.vercel.app').replace(/\/$/, '')

export const localMenuUrl = `${reactUrl}/menu/spice-garden`
