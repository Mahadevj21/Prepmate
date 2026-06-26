import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSessionDetails, getInterviewHistory } from '../api'

/* ---------- Evaluation Result Card ---------- */
function EvaluationCard({ result, index }) {
  const [expanded, setExpanded] = useState(true)

  let feedback = ''
  let missing = ''
  let strengths = []
  let improvements = []

  const rawFeedback = result?.feedback ?? result?.aiFeedback ?? ''
  if (rawFeedback && rawFeedback.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawFeedback)
      feedback = parsed.feedback ?? ''
      missing = parsed.missing ?? ''
      strengths = Array.isArray(parsed.strengths) ? parsed.strengths : []
      improvements = Array.isArray(parsed.improvements) ? parsed.improvements : []
    } catch {
      feedback = rawFeedback
    }
  } else {
    feedback = rawFeedback
    strengths = Array.isArray(result?.strengths) ? result.strengths : []
    improvements = Array.isArray(result?.improvements) ? result.improvements : []
  }

  const rawScore = result?.score ?? result?.aiScore ?? 0
  const scoreColor = rawScore >= 8 ? 'text-success' : rawScore >= 5 ? 'text-warning' : 'text-error'

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden ambient-shadow flex flex-col transition-all duration-300">
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between cursor-pointer hover:bg-surface-container-low/30"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant">
            {index + 1}
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm font-semibold max-w-[400px] truncate">{result.questionText}</h4>
            <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              Score: <span className={`font-bold ${scoreColor}`}>{rawScore}/10</span>
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>expand_more</span>
      </div>

      {expanded && (
        <div className="p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-success font-label-md uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Key Strengths
              </div>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-success/5 border border-success/10 rounded-xl text-body-sm">
                    <span className="material-symbols-outlined text-success text-[18px] shrink-0 mt-0.5">done</span>
                    {s}
                  </li>
                ))}
                {strengths.length === 0 && <p className="text-body-sm text-on-surface-variant opacity-50 italic">No specific strengths noted.</p>}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-warning font-label-md uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">emergency_home</span>
                Areas for Growth
              </div>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/10 rounded-xl text-body-sm">
                    <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">trending_up</span>
                    {s}
                  </li>
                ))}
                {improvements.length === 0 && <p className="text-body-sm text-on-surface-variant opacity-50 italic">No specific growth areas noted.</p>}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-2 text-primary font-label-md uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              AI Synthesis
            </div>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">{feedback}</p>
            {missing && (
              <div className="mt-4 pt-4 border-t border-primary/10">
                <p className="font-label-md text-label-md text-on-surface font-semibold mb-1">Missed Concepts:</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic">{missing}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Session Results View ---------- */
function SessionResultsView({ sessionId }) {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId || !token) return
      try {
        const data = await getSessionDetails(sessionId, token)
        setSession(data.session)
        setQuestions(data.questions || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchSession()
  }, [sessionId, token])

  if (loading) return <div className="flex-1 flex items-center justify-center py-20 animate-pulse"><div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div></div>

  const avgScore = questions.length > 0 ? (questions.reduce((a, b) => a + (b.aiScore || 0), 0) / questions.length).toFixed(1) : 0

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg antialiased">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate('/history')} className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-outline-variant/30 transition-all">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <span className="font-label-md text-label-md text-primary font-bold tracking-widest uppercase">Report Analysis</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg md:text-display-lg font-bold text-on-surface tracking-tight">{session?.topic}</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              {session?.difficulty}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              {new Date(session?.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Aptitude Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[56px] font-bold text-primary leading-none tracking-tighter">{avgScore}</span>
            <span className="text-[24px] font-medium text-on-surface-variant/40">/10</span>
          </div>
        </div>
      </header>

      <section className="space-y-gutter">
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-8 mb-6">Detailed Response Evaluation</h3>
        <div className="flex flex-col gap-gutter">
          {questions.map((q, i) => (
            <EvaluationCard key={q.id} result={q} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}

/* ---------- Overall Results View ---------- */
function OverallResultsView() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.userId || !token) return
      try {
        const data = await getInterviewHistory(user.userId, token)
        setSessions(data || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchSessions()
  }, [user?.userId, token])

  const avgScore = sessions.length > 0 ? (sessions.reduce((a, b) => a + (b.overallScore || 0), 0) / sessions.length).toFixed(1) : 0
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.overallScore || 0)) : 0

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg antialiased">
      <header className="flex flex-col gap-2 mb-4">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Analytics & History</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Track your technical progression and review past evaluations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Bento Summary Stats */}
        <div className="md:col-span-4 bg-primary text-on-primary rounded-3xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <div>
            <p className="font-label-md text-label-md text-on-primary/70 uppercase tracking-widest mb-2">Cumulative Score</p>
            <h3 className="text-[64px] font-bold tracking-tighter leading-none">{avgScore}</h3>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-white/20 pt-6">
            <div>
              <p className="font-label-md text-[10px] text-on-primary/60 uppercase">Sessions</p>
              <p className="text-xl font-bold">{sessions.length}</p>
            </div>
            <div className="text-right">
              <p className="font-label-md text-[10px] text-on-primary/60 uppercase">Best</p>
              <p className="text-xl font-bold">{bestScore}/10</p>
            </div>
          </div>
        </div>

        {/* History Table/List */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 ambient-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm font-semibold">Session Logs</h3>
            <div className="flex gap-2">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">filter_list</span></button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">search</span></button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30 animate-pulse">
                <div className="w-12 h-12 bg-outline-variant rounded-full"></div>
                <div className="h-4 bg-outline-variant w-32 rounded"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-4 grayscale opacity-50">
                <span className="material-symbols-outlined text-[48px]">history_toggle_off</span>
                <p className="text-on-surface-variant">No interview history discovered yet.</p>
              </div>
            ) : (
              sessions.map((s) => {
                const scColor = s.overallScore >= 8 ? 'text-success' : s.overallScore >= 5 ? 'text-warning' : 'text-error'
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/results/${s.id}`)}
                    className="group flex items-center justify-between p-4 bg-surface-container-low/30 hover:bg-surface-container-low border border-transparent hover:border-outline-variant/40 rounded-2xl cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                        <span className="material-symbols-outlined">analytics</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md font-bold text-on-surface group-hover:text-primary transition-all">{s.topic}</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{new Date(s.createdAt).toLocaleDateString()} · {s.difficulty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-headline-sm text-headline-sm font-bold ${scColor}`}>{s.overallScore}/10</p>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Page Orchestrator ---------- */
export function ResultsPage() {
  const { sessionId } = useParams()
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
      {sessionId ? <SessionResultsView sessionId={sessionId} /> : <OverallResultsView />}
    </div>
  )
}
