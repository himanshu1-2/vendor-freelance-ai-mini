import { QrCode } from '../components/common/QrCode'
import { demoRestaurant, localMenuUrl } from '../data/restaurant'

export function HomePage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl items-center px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">QR demo entry point</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-stone-950 sm:text-7xl">
            {demoRestaurant.name}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">{demoRestaurant.description}</p>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Scan to View Menu</p>
          <a className="mt-3 block max-w-xl break-all text-sm text-amber-800 underline decoration-amber-300 underline-offset-4 focus:outline-none focus:ring-4 focus:ring-amber-600/20" href={localMenuUrl}>
            {localMenuUrl}
          </a>
        </div>
        <div className="justify-self-center rounded-[2rem] border border-stone-200 bg-white p-5 shadow-xl shadow-stone-900/5 sm:p-7">
          <QrCode value={localMenuUrl} label={`QR code linking to the ${demoRestaurant.name} menu`} />
          <p className="mt-4 text-center text-xs font-medium text-stone-500">Point your phone camera here</p>
        </div>
      </div>
    </section>
  )
}
