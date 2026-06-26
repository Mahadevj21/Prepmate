import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerUser(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 flex items-center justify-center p-6 antialiased overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="w-full max-w-[440px] relative">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-on-primary text-[22px]">auto_awesome</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-on-surface">PrepMate</span>
          </Link>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2">Create your account</h1>
          <p className="text-on-surface-variant/70">Join 10,000+ engineers leveling up with AI.</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] p-8 md:p-10 ambient-shadow backdrop-blur-sm animate-in zoom-in-95 duration-500">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-label-md flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm font-label-md flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant px-1">Full Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant px-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Password</label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4 tracking-tight">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-on-surface-variant text-xs mt-8 opacity-50 px-4 leading-relaxed">
          By creating an account, you agree to our Terms of Service and Privacy Policy. Built with precision for top-tier engineers.
        </p>
      </div>
    </div>
  )
}
