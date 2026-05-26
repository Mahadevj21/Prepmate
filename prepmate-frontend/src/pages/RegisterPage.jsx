import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Sparkles, Eye, EyeOff } from 'lucide-react'
import { registerUser } from '../api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

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
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7c6af7]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[360px] relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#7c6af7] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-base font-semibold text-[#fafafa]">PrepMate</span>
        </Link>

        <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-7">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-[#fafafa] mb-1">Create your account</h1>
            <p className="text-sm text-[#71717a]">Start your AI interview preparation journey</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />
          )}
          {success && (
            <Alert type="success" message="Account created! Redirecting to login..." className="mb-5" />
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              leftIcon={<User size={14} />}
              required
              autoComplete="name"
            />

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
              placeholder="Create a password"
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
              hint="Minimum 8 characters"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-1"
            >
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#71717a] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#9585f8] hover:text-[#7c6af7] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
