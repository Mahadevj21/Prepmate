import { useState } from 'react'
import { User, Mail, Shield, Bell, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { changePassword } from '../api'

function Section({ title, desc, children }) {
  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-[12px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1f1f22]">
        <h2 className="text-sm font-semibold text-[#fafafa]">{title}</h2>
        {desc && <p className="text-xs text-[#71717a] mt-0.5">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function ProfilePage() {
  const { user, token } = useAuth()
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    setPwLoading(true)
    try {
      await changePassword({ userId: Number(user?.userId), newPassword }, token)
      setPwSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err.message || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  const initials =
    (user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()

  return (
    <div className="w-full h-full overflow-y-auto p-7 custom-scrollbar">
      <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Profile & Settings</h1>
        <p className="text-sm text-[#71717a]">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Avatar + name header */}
        <div className="flex items-center gap-4 bg-[#111113] border border-[#27272a] rounded-[12px] p-5">
          <div className="w-14 h-14 rounded-full bg-[#7c6af7]/20 border border-[#7c6af7]/30 flex items-center justify-center text-xl font-semibold text-[#9585f8] flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#fafafa] truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-[#71717a] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <Section title="Personal Information" desc="Update your name and email.">
          {saved && (
            <Alert type="success" message="Profile saved successfully." className="mb-4" />
          )}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User size={14} />}
              placeholder="Your full name"
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              leftIcon={<Mail size={14} />}
              disabled
              hint="Email cannot be changed"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </div>
          </form>
        </Section>

        {/* Password */}
        <Section title="Password" desc="Update your account password.">
          {pwSuccess && <Alert type="success" message={pwSuccess} onClose={() => setPwSuccess('')} className="mb-4" />}
          {pwError && <Alert type="error" message={pwError} onClose={() => setPwError('')} className="mb-4" />}
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <Input
              label="Current password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              leftIcon={<Shield size={14} />}
              required
            />
            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Shield size={14} />}
              hint="Minimum 6 characters"
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Shield size={14} />}
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                loading={pwLoading}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Change password
              </Button>
            </div>
          </form>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" desc="Choose what you want to hear about.">
          {[
            { label: 'Session reminders', sub: 'Daily practice nudges' },
            { label: 'Weekly report', sub: 'Performance summary every Monday' },
            { label: 'New features', sub: 'Product updates and announcements' },
          ].map(({ label, sub }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-[#1f1f22] last:border-0">
              <div>
                <p className="text-sm text-[#fafafa]">{label}</p>
                <p className="text-xs text-[#52525b]">{sub}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-[#27272a] peer-checked:bg-[#7c6af7] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" desc="Irreversible account actions.">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#fafafa]">Delete account</p>
              <p className="text-xs text-[#52525b]">Permanently remove your account and all data.</p>
            </div>
            <Button size="sm" variant="danger" leftIcon={<Trash2 size={13} />}>
              Delete
            </Button>
          </div>
        </Section>
      </div>
      </div>
    </div>
  )
}
