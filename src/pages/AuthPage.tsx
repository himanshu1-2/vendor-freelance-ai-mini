import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { login, registerVendor } from '../lib/menuApi'

export function AuthPage() {
  const { mode } = useParams<{ mode: 'login' | 'register' }>()
  const isRegister = mode === 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const user = isRegister
        ? await registerVendor({
            email,
            password,
            restaurant_name: restaurantName,
          })
        : await login({ email, password })

      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.vendor_id) {
        navigate(`/vendor/${user.vendor_id}`, { replace: true })
      } else {
        setError('This vendor account is not linked to a restaurant.')
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to authenticate.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-lg items-center justify-center px-5 py-12 sm:px-8">
      <div className="w-full rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
          {isRegister ? 'Vendor registration' : 'Account access'}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-stone-950">
          {isRegister ? 'Register your restaurant' : 'Log in'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {isRegister
            ? 'Create a vendor account to manage your restaurant menu.'
            : 'Vendors and the administrator can manage menus after signing in.'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {isRegister && (
            <label className="block text-sm font-medium text-stone-700">
              Restaurant name
              <input
                autoComplete="organization"
                required
                minLength={2}
                maxLength={200}
                value={restaurantName}
                onChange={(event) => setRestaurantName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-stone-500 focus:ring-4 focus:ring-amber-600/10"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-stone-700">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-stone-500 focus:ring-4 focus:ring-amber-600/10"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Password
            <input
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 12 : 1}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-stone-500 focus:ring-4 focus:ring-amber-600/10"
            />
            {isRegister && <span className="mt-1 block text-xs text-stone-500">Use at least 12 characters.</span>}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait…' : isRegister ? 'Create vendor account' : 'Log in'}
          </button>
        </form>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <p className="mt-5 text-sm text-stone-600">
          {isRegister ? 'Already registered?' : 'New restaurant?'}{' '}
          <Link className="font-semibold text-amber-800 underline underline-offset-4" to={isRegister ? '/auth/login' : '/auth/register'}>
            {isRegister ? 'Log in' : 'Register as a vendor'}
          </Link>
        </p>
        <Link className="mt-4 inline-flex text-sm font-semibold text-stone-700 underline underline-offset-4" to="/">
          Back to menu
        </Link>
      </div>
    </section>
  )
}
