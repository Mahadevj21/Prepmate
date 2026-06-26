import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginUser(form)
      login(result.token, {
        email: result.email ?? form.email,
        name: result.name ?? '',
        userId: result.userId ?? result.id ?? '',
        role: result.role ?? 'USER',
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop antialiased text-on-surface relative">
      <main className="w-full max-w-[420px] bg-surface-container-lowest rounded-2xl shadow-ambient border border-outline-variant/30 flex flex-col overflow-hidden relative z-10">
        <div className="p-8 sm:p-10 flex flex-col gap-stack-lg">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-stack-sm mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Welcome back</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Sign in to continue to PrepMate.</p>
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-stack-md">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email address</label>
              <input
                className="w-full h-11 px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
              <input
                className="w-full h-11 px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
              />
            </div>
            <button
              className="mt-2 w-full h-11 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>

        <div className="bg-surface-container-low p-6 border-t border-outline-variant/30 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don't have an account?
            <Link to="/register" className="font-label-md text-label-md text-primary hover:opacity-80 transition-colors ml-1">Sign up free</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
