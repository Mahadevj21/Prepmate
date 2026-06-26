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
      {/* Auth Container */}
      <main className="w-full max-w-[420px] bg-surface-container-lowest rounded-2xl shadow-ambient border border-outline-variant/30 flex flex-col overflow-hidden relative z-10">
        <div className="p-8 sm:p-10 flex flex-col gap-stack-lg">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-stack-sm mb-2">
            <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Sign in to PrepMate</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Precision Career Engineering awaits.</p>
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-stack-md">
            {/* Email Input */}
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
            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                <a className="font-body-sm text-body-sm text-primary hover:opacity-80 transition-colors" href="#">Forgot password?</a>
              </div>
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
            {/* Submit Button */}
            <button
              className="mt-2 w-full h-11 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/40"></div>
            <span className="flex-shrink-0 mx-4 font-body-sm text-body-sm text-on-surface-variant">or continue with</span>
            <div className="flex-grow border-t border-outline-variant/40"></div>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-3">
            <button className="h-10 flex items-center justify-center gap-2 bg-surface border border-outline-variant/60 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors active:scale-[0.98]" type="button">
              <GoogleIcon />
              Google
            </button>
            <button className="h-10 flex items-center justify-center gap-2 bg-surface border border-outline-variant/60 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors active:scale-[0.98]" type="button">
              <GitHubIcon />
              GitHub
            </button>
          </div>
        </div>
        {/* Footer */}
        <div className="bg-surface-container-low p-6 border-t border-outline-variant/30 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don't have an account?
            <Link to="/register" className="font-label-md text-label-md text-primary hover:opacity-80 transition-colors ml-1">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" fillRule="evenodd"></path>
    </svg>
  )
}
