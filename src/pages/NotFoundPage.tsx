import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl flex-col items-start justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">404</p>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Page not found</h1>
      <Link className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-600/20" to="/">
        Return home
      </Link>
    </section>
  )
}
