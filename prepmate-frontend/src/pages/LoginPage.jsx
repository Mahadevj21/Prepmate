import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react'
import { loginUser } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7c6af7]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[360px] relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#7c6af7] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-base font-semibold text-[#fafafa]">PrepMate</span>
        </Link>

        {/* Card */}
        <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-7">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-[#fafafa] mb-1">Welcome back</h1>
            <p className="text-sm text-[#71717a]">Sign in to your PrepMate account</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              leftIcon={<Mail size={14} />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              leftIcon={<Lock size={14} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="hover:text-[#a1a1aa] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-1"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#71717a] mt-5">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#9585f8] hover:text-[#7c6af7] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
