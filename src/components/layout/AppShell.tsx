import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <span className="font-display text-xl font-semibold tracking-tight">QR Menu</span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Frontend foundation</span>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
