import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { changePassword } from '../api'

function ProfileSection({ title, desc, children }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl overflow-hidden ambient-shadow flex flex-col">
      <div className="px-6 py-5 border-b border-outline-variant/30">
        <h3 className="font-headline-sm text-headline-sm font-semibold">{title}</h3>
        {desc && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export function ProfilePage() {
  const { user, token } = useAuth()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await changePassword({ userId: Number(user?.userId), newPassword }, token)
      setSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  const initials = (user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg antialiased overflow-y-auto">
      <header className="flex flex-col gap-2 mb-4">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Account Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Update your security preferences and profile details.</p>
      </header>

      <div className="max-w-3xl flex flex-col gap-gutter">
        {/* Profile Hero */}
        <div className="bg-primary text-on-primary rounded-3xl p-8 flex items-center gap-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl"></div>
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
            {initials}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{user?.name || 'User'}</h3>
            <p className="text-on-primary/70 font-body-md">{user?.email}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-label-md tracking-wider uppercase">Active Trial</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-label-md tracking-wider uppercase">Level: Senior</span>
            </div>
          </div>
        </div>

        {/* Password Security */}
        <ProfileSection title="Security" desc="Secure your account with a unique password.">
          {success && <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-success font-label-md mb-6">{success}</div>}
          {error && <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error font-label-md mb-6">{error}</div>}

          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant px-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-on-surface"
              />
            </div>
            <div className="hidden md:block"></div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant px-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-on-surface"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant px-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-on-surface"
              />
            </div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !newPassword}
                className="bg-surface text-on-surface border border-outline-variant/50 font-label-md text-label-md px-8 py-3 rounded-xl hover:bg-surface-container-low transition-all active:scale-95 disabled:opacity-50"
              >
                Update Password
              </button>
            </div>
          </form>
        </ProfileSection>

        {/* Notifications & Toggles */}
        <ProfileSection title="Preferences" desc="Customize your experience and communication.">
          <div className="space-y-1">
            {[
              { label: 'Practice Reminders', sub: 'Daily motivation to keep practicing', key: 'reminders' },
              { label: 'Weekly Performance Reports', sub: 'Receive analysis of your weekly sessions', key: 'weekly' },
              { label: 'Marketing Updates', sub: 'Stay informed about new interview topics', key: 'marketing' }
            ].map((pref, i) => (
              <div key={pref.key} className={`flex items-center justify-between py-4 ${i !== 2 ? 'border-b border-outline-variant/20' : ''}`}>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{pref.label}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{pref.sub}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </ProfileSection>

        {/* Danger Zone */}
        <div className="bg-error/5 border border-error/20 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-error">Danger Zone</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Permanently remove your account and all interview analytics.</p>
          </div>
          <button className="bg-error text-on-error font-label-md text-label-md px-8 py-3 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-95">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
