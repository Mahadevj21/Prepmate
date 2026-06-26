import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getInterviewHistory } from '../api'

export function HistoryPage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [search, setSearch] = useState('')
  const [filterDiff, setFilterDiff] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.userId || !token) return
      try {
        const data = await getInterviewHistory(user.userId, token)
        setSessions(data || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchHistory()
  }, [user?.userId, token])

  const filtered = sessions.filter((s) => {
    const matchSearch = s.topic.toLowerCase().includes(search.toLowerCase())
    const matchDiff = filterDiff === 'all' || s.difficulty === filterDiff
    return matchSearch && matchDiff
  })

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg antialiased overflow-y-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Technical History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Review all your previous interview sessions and growth metrics.</p>
        </div>
        <button onClick={() => navigate('/interview')} className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:scale-[0.98] transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Session
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
        <div className="relative flex-1 w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input
            type="text"
            placeholder="Filter by session topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface"
          />
        </div>
        <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 overflow-x-auto w-full md:w-auto">
          {['all', 'easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md capitalize transition-all ${filterDiff === d ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl overflow-hidden ambient-shadow">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30 animate-pulse">
            <div className="w-12 h-12 bg-outline-variant rounded-full"></div>
            <div className="h-4 bg-outline-variant w-32 rounded"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant/30 mb-2">
              <span className="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <h4 className="font-headline-sm font-semibold">No results found</h4>
            <p className="font-body-md text-on-surface-variant">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low border-b border-outline-variant/30">
              <div className="col-span-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Topic</div>
              <div className="col-span-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-center">Difficulty</div>
              <div className="col-span-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-center">Score</div>
              <div className="col-span-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-right">Date</div>
            </div>
            {filtered.map((s) => {
              const scColor = s.overallScore >= 8 ? 'text-success' : s.overallScore >= 5 ? 'text-warning' : 'text-error'
              return (
                <div
                  key={s.id}
                  onClick={() => navigate(`/results/${s.id}`)}
                  className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-outline-variant/10 hover:bg-surface-container-low/30 cursor-pointer transition-colors items-center last:border-0 group"
                >
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <span className="material-symbols-outlined text-[20px]">terminal</span>
                    </div>
                    <span className="font-label-md text-label-md font-bold group-hover:text-primary transition-all truncate">{s.topic}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 font-label-md text-[11px] capitalize">
                      {s.difficulty}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`font-headline-sm font-bold ${scColor}`}>{s.overallScore}/10</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-body-sm text-on-surface-variant">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
