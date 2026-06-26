import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAdminMetrics, getAdminUsers, resetUserPassword } from '../api'

export function AdminPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/dashboard')
  }, [user, navigate])

  const [metrics, setMetrics] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const [resetModalUser, setResetModalUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccessMsg, setResetSuccessMsg] = useState('')
  const [resetErrorMsg, setResetErrorMsg] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [mRes, uRes] = await Promise.all([getAdminMetrics(token), getAdminUsers(token)])
      setMetrics(mRes)
      setUsers(uRes)
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc'); }
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword.trim() || newPassword.length < 6) return setResetErrorMsg('Minimum 6 characters.')
    setResetLoading(true)
    setResetErrorMsg('')
    setResetSuccessMsg('')
    try {
      await resetUserPassword({ userId: String(resetModalUser.id), newPassword }, token)
      setResetSuccessMsg('Success.')
      setTimeout(() => setResetModalUser(null), 1000)
    } catch (err) {
      setResetErrorMsg(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortField] || ''
    let valB = b[sortField] || ''
    if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (loading) return <div className="flex-1 flex items-center justify-center animate-pulse"><div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg antialiased overflow-y-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">admin_panel_settings</span>
            <span className="font-label-md text-label-md text-primary font-bold tracking-widest uppercase">Admin Terminal</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Platform Governance</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Real-time metrics and authority controls for the PrepMate ecosystem.</p>
        </div>
        <button onClick={fetchData} className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-outline-variant/30 transition-all active:scale-95">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[
          { label: 'Citizens', val: metrics?.totalUsers, icon: 'group', color: 'text-primary' },
          { label: 'Knowledge Paths', val: metrics?.totalRoadmaps, icon: 'flowsheet', color: 'text-secondary' },
          { label: 'Evaluation Sessions', val: metrics?.totalInterviews, icon: 'contract_edit', color: 'text-tertiary' },
          { label: 'Intelligence Level', val: metrics?.averageScore + '/10', icon: 'psychology', color: 'text-success' }
        ].map((m, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 ambient-shadow flex flex-col justify-between aspect-square md:aspect-auto md:h-32 group hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest">{m.label}</span>
              <span className={`material-symbols-outlined ${m.color} group-hover:scale-110 transition-transform`}>{m.icon}</span>
            </div>
            <h3 className="text-3xl font-bold tracking-tighter">{m.val}</h3>
          </div>
        ))}
      </div>

      {/* User Management Module */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[32px] p-6 ambient-shadow overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-headline-sm text-headline-sm font-semibold">User Directory</h3>
          <div className="relative group w-full md:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search identifiers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-on-surface text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest">
                <th className="py-4 px-6 cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>Identity</th>
                <th className="py-4 px-6 text-center">Engagement</th>
                <th className="py-4 px-6 text-center">Performance</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {sortedUsers.map(u => (
                <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{u.name || 'Anonymous'}</span>
                        <span className="text-[11px] text-on-surface-variant opacity-70">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-4 text-[11px] font-label-md">
                      <span className="flex flex-col items-center">
                        <span className="text-on-surface font-bold">{u.roadmapsCount}</span>
                        <span className="opacity-50 uppercase text-[9px]">Roadmaps</span>
                      </span>
                      <span className="flex flex-col items-center">
                        <span className="text-on-surface font-bold">{u.interviewsCount}</span>
                        <span className="opacity-50 uppercase text-[9px]">Sessions</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`font-bold text-lg ${u.averageScore >= 8 ? 'text-success' : u.averageScore >= 5 ? 'text-warning' : 'text-error'}`}>
                      {u.averageScore > 0 ? u.averageScore : '-'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setResetModalUser(u)}
                      className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all"
                      title="Security Reset"
                    >
                      <span className="material-symbols-outlined text-[18px]">key</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/40 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setResetModalUser(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-outline-variant">close</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">security</span>
              </div>
              <div>
                <h4 className="font-headline-sm font-bold">Terminal Reset</h4>
                <p className="text-sm text-on-surface-variant">Overriding credentials for {resetModalUser.name}</p>
              </div>
            </div>

            {resetSuccessMsg && <div className="p-4 bg-success/10 text-success rounded-xl mb-4 font-label-md">Operation Successful</div>}
            {resetErrorMsg && <div className="p-4 bg-error/10 text-error rounded-xl mb-4 font-label-md">{resetErrorMsg}</div>}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant px-1">Temporary Security Code</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all"
              >
                Inject Authority
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
