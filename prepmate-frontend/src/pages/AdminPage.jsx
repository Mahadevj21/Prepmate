import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Target, Mic, Shield, Calendar, Award, KeyRound,
  CheckCircle, AlertCircle, X, Search, RefreshCw, BarChart2,
  Lock, ArrowUpDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getAdminMetrics, getAdminUsers, resetUserPassword } from '../api'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'

export function AdminPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const [metrics, setMetrics] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Reset password modal state
  const [resetModalUser, setResetModalUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccessMsg, setResetSuccessMsg] = useState('')
  const [resetErrorMsg, setResetErrorMsg] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [mRes, uRes] = await Promise.all([
        getAdminMetrics(token),
        getAdminUsers(token)
      ])
      setMetrics(mRes)
      setUsers(uRes)
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword.trim() || newPassword.length < 6) {
      setResetErrorMsg('Password must be at least 6 characters.')
      return
    }
    setResetLoading(true)
    setResetErrorMsg('')
    setResetSuccessMsg('')
    try {
      const res = await resetUserPassword({
        userId: String(resetModalUser.id),
        newPassword: newPassword
      }, token)
      setResetSuccessMsg(res.message || 'Password updated successfully.')
      setNewPassword('')
      setTimeout(() => {
        setResetModalUser(null)
        setResetSuccessMsg('')
      }, 1500)
    } catch (err) {
      setResetErrorMsg(err.message || 'Failed to reset password.')
    } finally {
      setResetLoading(false)
    }
  }

  // Filter and sort users
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    if (typeof valA === 'string') {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Format dates cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-10 bg-[#0a0a0b] text-[#fafafa]">
        <RefreshCw size={24} className="animate-spin text-[#7c6af7]" />
        <p className="text-sm text-[#71717a]">Loading professional admin insights dashboard...</p>
      </div>
    )
  }

  // Calculate SVG Graph Stats
  // We'll map users to a simple usage chart: roadmaps vs interviews
  const maxActivityVal = Math.max(...users.map(u => (u.roadmapsCount || 0) + (u.interviewsCount || 0)), 5)

  return (
    <div className="w-full h-full overflow-y-auto p-7 bg-[#0a0a0b] text-[#fafafa] custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f22] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9585f8] uppercase tracking-wider mb-1">
              <Shield size={12} />
              Secured Administrator Area
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">Platform Overview & Insights</h1>
            <p className="text-sm text-[#71717a]">Monitor platform engagement, active users, and system metrics in real-time.</p>
          </div>
          <Button onClick={fetchData} variant="secondary" size="sm" leftIcon={<RefreshCw size={13} />}>
            Refresh stats
          </Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 flex flex-col justify-between hover:border-[#7c6af7]/35 transition-all">
              <div className="flex justify-between items-start text-[#71717a]">
                <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                <Users size={16} className="text-[#9585f8]" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#fafafa]">{metrics.totalUsers}</h3>
                <p className="text-[10px] text-[#52525b] mt-1 font-mono">Registered accounts</p>
              </div>
            </div>

            <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 flex flex-col justify-between hover:border-[#7c6af7]/35 transition-all">
              <div className="flex justify-between items-start text-[#71717a]">
                <span className="text-xs font-medium uppercase tracking-wider">Roadmaps</span>
                <Target size={16} className="text-[#7c6af7]" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#fafafa]">{metrics.totalRoadmaps}</h3>
                <p className="text-[10px] text-[#52525b] mt-1 font-mono">Learning paths generated</p>
              </div>
            </div>

            <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 flex flex-col justify-between hover:border-[#7c6af7]/35 transition-all">
              <div className="flex justify-between items-start text-[#71717a]">
                <span className="text-xs font-medium uppercase tracking-wider">Interviews</span>
                <Mic size={16} className="text-[#f59e0b]" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#fafafa]">{metrics.totalInterviews}</h3>
                <p className="text-[10px] text-[#52525b] mt-1 font-mono">Sessions launched</p>
              </div>
            </div>

            <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 flex flex-col justify-between hover:border-[#7c6af7]/35 transition-all">
              <div className="flex justify-between items-start text-[#71717a]">
                <span className="text-xs font-medium uppercase tracking-wider">Answers</span>
                <BarChart2 size={16} className="text-[#22c55e]" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#fafafa]">{metrics.totalQuestionsAnswered}</h3>
                <p className="text-[10px] text-[#52525b] mt-1 font-mono">Responses evaluated</p>
              </div>
            </div>

            <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 flex flex-col justify-between hover:border-[#7c6af7]/35 transition-all">
              <div className="flex justify-between items-start text-[#71717a]">
                <span className="text-xs font-medium uppercase tracking-wider">Avg Score</span>
                <Award size={16} className="text-[#3b82f6]" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#fafafa]">{metrics.averageScore}/10</h3>
                <p className="text-[10px] text-[#52525b] mt-1 font-mono">Overall user rating</p>
              </div>
            </div>

          </div>
        )}

        {/* Charts & Interactive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Distribution Chart */}
          <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#fafafa]">User Generation Activity Profile</h3>
              <p className="text-xs text-[#71717a]">Comparison of roadmaps vs interviews completed by user</p>
            </div>
            
            <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-[#27272a]/60 pb-1">
              {users.slice(0, 10).map((u, i) => {
                const totalActivity = (u.roadmapsCount || 0) + (u.interviewsCount || 0)
                const roadmapHeight = totalActivity > 0 ? ((u.roadmapsCount || 0) / maxActivityVal) * 100 : 0
                const interviewHeight = totalActivity > 0 ? ((u.interviewsCount || 0) / maxActivityVal) * 100 : 0
                
                return (
                  <div key={u.id} className="flex-1 flex flex-col items-center h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-[#18181b] border border-[#27272a] text-[10px] p-2 rounded shadow-xl hidden group-hover:block z-10 w-28 text-center pointer-events-none">
                      <p className="font-semibold text-white truncate">{u.name}</p>
                      <p className="text-[#7c6af7] font-mono mt-0.5">Roadmaps: {u.roadmapsCount}</p>
                      <p className="text-[#f59e0b] font-mono">Interviews: {u.interviewsCount}</p>
                    </div>

                    <div className="w-5 sm:w-8 h-full flex flex-col justify-end gap-0.5">
                      {/* Roadmaps segment */}
                      <div 
                        className="bg-gradient-to-t from-[#6366f1]/90 to-[#7c6af7]/90 rounded-t-[3px] w-full transition-all duration-500 hover:brightness-125"
                        style={{ height: `${Math.max(roadmapHeight, 2)}%` }}
                      />
                      {/* Interviews segment */}
                      <div 
                        className="bg-gradient-to-t from-[#f59e0b]/90 to-[#facc15]/90 rounded-t-[3px] w-full transition-all duration-500 hover:brightness-125"
                        style={{ height: `${Math.max(interviewHeight, 2)}%` }}
                      />
                    </div>

                    <span className="text-[9px] text-[#52525b] mt-2 truncate w-full text-center">
                      {u.name?.split(' ')[0] || `User ${u.id}`}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 justify-center text-[10px] text-[#71717a]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#7c6af7]" /> Roadmaps</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#f59e0b]" /> Interviews</span>
            </div>
          </div>

          {/* Engagement Overview */}
          <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#fafafa]">Key Metrics Distribution</h3>
              <p className="text-xs text-[#71717a]">Overall user behavior analysis</p>
            </div>
            
            {metrics && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a1a1aa]">Average Score Performance</span>
                    <span className="font-mono text-[#9585f8] font-semibold">{metrics.averageScore * 10}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1f1f22] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7c6af7] to-[#3b82f6] rounded-full"
                      style={{ width: `${metrics.averageScore * 10}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a1a1aa]">Question Answer Rate</span>
                    <span className="font-mono text-[#22c55e] font-semibold">
                      {metrics.totalInterviews > 0 
                        ? Math.min(100, Math.round((metrics.totalQuestionsAnswered / (metrics.totalInterviews * 5)) * 100)) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1f1f22] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] rounded-full"
                      style={{ 
                        width: `${metrics.totalInterviews > 0 
                          ? Math.min(100, Math.round((metrics.totalQuestionsAnswered / (metrics.totalInterviews * 5)) * 100)) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a1a1aa]">Engagement (Sessions per User)</span>
                    <span className="font-mono text-[#f59e0b] font-semibold">
                      {metrics.totalUsers > 0 ? (metrics.totalInterviews / metrics.totalUsers).toFixed(1) : 0} avg
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1f1f22] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fb923c] rounded-full"
                      style={{ width: `${Math.min(100, (metrics.totalInterviews / (metrics.totalUsers || 1)) * 10)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-[#0a0a0b] border border-[#27272a]/60 rounded-lg p-3 text-[11px] text-[#71717a] leading-relaxed">
              💡 <span className="text-white font-medium">Pro-tip:</span> Monitor engagement levels. Users with score performance &lt; 6.0/10 may need easier topic suggestions.
            </div>
          </div>

        </div>

        {/* User Directory */}
        <div className="bg-[#111113] border border-[#27272a] rounded-[14px] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#fafafa]">User Directory</h3>
              <p className="text-xs text-[#71717a]">{users.length} active registered user profiles on the platform</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8.5 bg-[#0a0a0b] border border-[#27272a] rounded-[8px] pl-9 pr-3 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#7c6af7]/70 transition-all"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="border border-[#1f1f22] rounded-lg overflow-hidden bg-[#0d0d0f]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0b] border-b border-[#1f1f22] text-[10px] text-[#52525b] uppercase font-mono tracking-wider select-none">
                    <th className="py-3 px-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">User <ArrowUpDown size={10} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-1">Role <ArrowUpDown size={10} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right" onClick={() => handleSort('roadmapsCount')}>
                      <div className="flex items-center gap-1 justify-end">Roadmaps <ArrowUpDown size={10} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right" onClick={() => handleSort('interviewsCount')}>
                      <div className="flex items-center gap-1 justify-end">Sessions <ArrowUpDown size={10} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right" onClick={() => handleSort('averageScore')}>
                      <div className="flex items-center gap-1 justify-end">Avg Score <ArrowUpDown size={10} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center gap-1">Joined Date <ArrowUpDown size={10} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f22] text-xs">
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#52525b]">No users matching filters found</td>
                    </tr>
                  ) : (
                    sortedUsers.map(user => {
                      const isCurrentUserAdmin = user.role === 'ADMIN'
                      
                      return (
                        <tr key={user.id} className="hover:bg-[#111113]/55 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1c1c1f] flex items-center justify-center text-xs font-semibold text-[#a1a1aa] border border-[#27272a]">
                                {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[#fafafa] truncate">{user.name || 'User'}</p>
                                <p className="text-[10px] text-[#52525b] truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={isCurrentUserAdmin ? 'success' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-[#fafafa]">{user.roadmapsCount}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-[#fafafa]">{user.interviewsCount}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold">
                            <span className={user.averageScore >= 8 ? 'text-[#22c55e]' : user.averageScore >= 5 ? 'text-[#f59e0b]' : user.averageScore > 0 ? 'text-[#ef4444]' : 'text-[#52525b]'}>
                              {user.averageScore > 0 ? `${user.averageScore}/10` : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#71717a] font-mono text-[11px]">{formatDate(user.createdAt)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setResetModalUser(user)
                                setResetSuccessMsg('')
                                setResetErrorMsg('')
                                setNewPassword('')
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] hover:border-[#7c6af7] hover:text-[#9585f8] rounded-[6px] text-[10px] font-medium transition-colors"
                              title="Reset user password"
                            >
                              <KeyRound size={11} />
                              Reset password
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Password Reset Glassmorphic Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111113] border border-[#27272a] w-full max-w-[360px] rounded-[14px] p-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-[#7c6af7]">
                <Lock size={15} />
                <h3 className="text-sm font-semibold text-[#fafafa]">Password Reset Form</h3>
              </div>
              <button 
                onClick={() => setResetModalUser(null)}
                className="text-[#52525b] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="bg-[#0a0a0b] p-3 rounded-lg border border-[#27272a] text-xs">
                <p className="text-[#71717a]">Target User Details:</p>
                <p className="font-semibold text-white mt-1">{resetModalUser.name}</p>
                <p className="text-[10px] text-[#52525b] font-mono mt-0.5">{resetModalUser.email}</p>
              </div>

              {resetSuccessMsg && <Alert type="success" message={resetSuccessMsg} />}
              {resetErrorMsg && <Alert type="error" message={resetErrorMsg} />}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new plain text password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full h-9 bg-[#0a0a0b] border border-[#27272a] rounded-[8px] px-3 text-xs text-[#fafafa] focus:outline-none focus:border-[#7c6af7]/70 transition-all"
                  />
                  <p className="text-[9px] text-[#52525b]">Minimum length required is 6 characters.</p>
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setResetModalUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm" 
                    loading={resetLoading}
                    disabled={!newPassword.trim() || newPassword.length < 6}
                  >
                    Confirm Update
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
