export type MenuItem = {
  id: number
  name: string
  description: string | null
  price: number
  createdAt: string
  isActive: boolean
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

export async function listMenuItems(): Promise<MenuItem[]> {
  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}/menu/?skip=0&limit=50`)
  } catch {
    throw new Error('Unable to reach the menu server. Check that FastAPI is running.')
  }

  if (!response.ok) {
    let message = `Unable to load the menu (${response.status})`

    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
    }

    throw new Error(message)
  }

  return response.json() as Promise<MenuItem[]>
}
