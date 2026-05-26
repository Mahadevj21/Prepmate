import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, Search, BarChart2, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getInterviewHistory } from '../api'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

const DIFF_COLORS = { easy: 'success', medium: 'warning', hard: 'error' }

export function HistoryPage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [search, setSearch] = useState('')
  const [filterDiff, setFilterDiff] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId || !token) return
      setLoading(true)
      try {
        const data = await getInterviewHistory(user.userId, token)
        setSessions(data || [])
        setError('')
      } catch (err) {
        setError(err.message)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [user?.userId, token])

  const filtered = sessions.filter((s) => {
    const matchSearch = s.topic.toLowerCase().includes(search.toLowerCase())
    const matchDiff = filterDiff === 'all' || s.difficulty === filterDiff
    return matchSearch && matchDiff
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-full h-full overflow-y-auto p-7 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Interview History</h1>
            <p className="text-sm text-[#71717a]">{sessions.length} sessions total</p>
          </div>
          <Button size="sm" onClick={() => navigate('/interview')} leftIcon={<Mic size={13} />}>
            New Session
          </Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by topic…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 bg-[#111113] border border-[#27272a] rounded-[8px] pl-9 pr-3 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#7c6af7]/70 transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                className={`px-3 h-9 rounded-[8px] text-xs font-medium border capitalize transition-all ${
                  filterDiff === d
                    ? 'bg-[#7c6af7]/15 border-[#7c6af7]/40 text-[#9585f8]'
                    : 'bg-[#111113] border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-[#7c6af7] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#52525b] mb-4">No sessions found</p>
            <Button onClick={() => navigate('/interview')} size="sm">New Session</Button>
          </div>
        ) : (
          <div className="bg-[#111113] border border-[#27272a] rounded-[12px] overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#1f1f22] bg-[#0d0d0f]">
              <span className="text-xs font-medium text-[#52525b]">Topic</span>
              <span className="text-xs font-medium text-[#52525b] w-16 text-center">Level</span>
              <span className="text-xs font-medium text-[#52525b] w-14 text-right">Score</span>
              <span className="text-xs font-medium text-[#52525b] w-20 text-right hidden sm:block">Duration</span>
              <span className="text-xs font-medium text-[#52525b] w-28 text-right hidden md:block">Date</span>
            </div>
            {filtered.map((s, i) => {
              const scoreColor = s.overallScore >= 8 ? '#22c55e' : s.overallScore >= 5 ? '#f59e0b' : '#ef4444'
              return (
                <div
                  key={s.id}
                  onClick={() => navigate(`/results/${s.id}`)}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-[#18181b] transition-colors cursor-pointer ${
                    i < filtered.length - 1 ? 'border-b border-[#1f1f22]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-[6px] bg-[#18181b] flex items-center justify-center flex-shrink-0">
                      <Mic size={13} className="text-[#71717a]" />
                    </div>
                    <span className="text-sm text-[#fafafa] font-medium truncate">{s.topic}</span>
                  </div>
                  <div className="w-16 flex justify-center">
                    <Badge variant={DIFF_COLORS[s.difficulty]}>{s.difficulty}</Badge>
                  </div>
                  <span className="w-14 text-sm font-semibold text-right" style={{ color: scoreColor }}>{s.overallScore || 0}/10</span>
                  <span className="w-20 text-xs text-[#52525b] text-right hidden sm:block">N/A</span>
                  <span className="w-28 text-xs text-[#52525b] text-right hidden md:block">{formatDate(s.createdAt)}</span>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-[#1f1f22]">
            <div className="flex items-center gap-2 text-xs text-[#52525b]">
              <BarChart2 size={13} className="text-[#7c6af7]" />
              Showing {filtered.length} of {sessions.length} sessions
            </div>
            {filtered.length > 0 && (
              <div className="text-xs text-[#52525b]">
                Avg score:{' '}
                <span className="text-[#a1a1aa] font-medium">
                  {Math.round(filtered.reduce((a, b) => a + (b.overallScore || 0), 0) / filtered.length)}/10
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
