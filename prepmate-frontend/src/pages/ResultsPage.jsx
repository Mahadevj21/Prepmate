import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BarChart2, CheckCircle, XCircle, Lightbulb,
  TrendingUp, Mic, ArrowRight, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getSessionDetails, getInterviewHistory } from '../api'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'



/* ---------- Evaluation Result Card ---------- */
function EvaluationCard({ result, className = '' }) {
  const [expanded, setExpanded] = useState(true)

  // aiFeedback from backend is a JSON string: { feedback, missing, strengths[], improvements[] }
  // result.feedback may be the raw aiFeedback string or already parsed fields
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

  const rawScore = result?.score ?? result?.aiScore ?? null
  const score100 = rawScore !== null ? rawScore * 10 : null
  const suggestion = missing // use "missing" as the suggestion/tip section

  const scoreColor =
    rawScore >= 8 ? 'text-[#22c55e]' :
    rawScore >= 5 ? 'text-[#f59e0b]' :
    'text-[#ef4444]'

  const scoreRing =
    rawScore >= 8 ? 'stroke-[#22c55e]' :
    rawScore >= 5 ? 'stroke-[#f59e0b]' :
    'stroke-[#ef4444]'

  return (
    <div className={`bg-[#0a0a0b] border border-[#1f1f22] rounded-[12px] overflow-hidden ${className}`}>
      {/* Score Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f22]">
        <div className="flex items-center gap-3">
          {rawScore !== null && (
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  className={scoreRing}
                  strokeWidth="2.5"
                  strokeDasharray={`${score100} ${100 - score100}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${scoreColor}`}>
                {rawScore}/10
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-[#fafafa]">Evaluation Result</p>
            {rawScore !== null && (
              <Badge variant={rawScore >= 8 ? 'success' : rawScore >= 5 ? 'warning' : 'error'}>
                {rawScore >= 8 ? 'Strong' : rawScore >= 5 ? 'Decent' : 'Needs Work'}
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-[#52525b] hover:text-[#a1a1aa] transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="p-5 flex flex-col gap-5">
          {/* Feedback */}
          {feedback && (
            <div>
              <p className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">AI Feedback</p>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{feedback}</p>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle size={11} /> Strengths
              </p>
              <ul className="flex flex-col gap-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                    <CheckCircle size={13} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {improvements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#ef4444] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <XCircle size={11} /> Areas to Improve
              </p>
              <ul className="flex flex-col gap-1.5">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                    <XCircle size={13} className="text-[#ef4444] flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestion */}
          {suggestion && (
            <div className="bg-[#7c6af7]/8 border border-[#7c6af7]/20 rounded-[8px] p-4 flex gap-3">
              <Lightbulb size={15} className="text-[#9585f8] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{suggestion}</p>
            </div>
          )}

          {/* Raw JSON fallback */}
          {!feedback && rawScore === null && (
            <pre className="text-xs text-[#71717a] whitespace-pre-wrap font-mono bg-[#111113] rounded-[8px] p-4 overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
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
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId || !token) return
      setLoading(true)
      try {
        const data = await getSessionDetails(sessionId, token)
        setSession(data.session)
        setQuestions(data.questions || [])
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId, token])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="text-[#7c6af7] animate-spin" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="text-center py-16">
        <Alert type="error" message={error || 'Session not found'} />
      </div>
    )
  }

  const answeredQuestions = questions.filter(q => q.userAnswer && q.userAnswer.trim())
  const avgScore = answeredQuestions.length > 0 
    ? (answeredQuestions.reduce((a, b) => a + (b.aiScore || 0), 0) / answeredQuestions.length).toFixed(1)
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-sm text-[#7c6af7] hover:text-[#9585f8] transition-colors"
        >
          ← Back to History
        </button>
        <Button size="sm" variant="secondary" onClick={() => navigate('/interview')}>
          New Session
        </Button>
      </div>

      {/* Session Info */}
      <div className="bg-[#111113] border border-[#27272a] rounded-[12px] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa] mb-1">{session.topic}</h2>
            <p className="text-sm text-[#71717a]">
              <Badge variant={session.difficulty === 'easy' ? 'success' : session.difficulty === 'medium' ? 'warning' : 'error'}>
                {session.difficulty}
              </Badge>
              {' '}· {session.mode} Mode
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#71717a] mb-1">Average Score</p>
            <p className="text-3xl font-bold text-[#7c6af7]">{avgScore}/10</p>
          </div>
        </div>
      </div>

      {/* Questions & Answers */}
      <div>
        <h3 className="text-sm font-semibold text-[#fafafa] mb-4">
          Questions & Answers
          <span className="ml-2 text-xs font-normal text-[#52525b]">
            ({answeredQuestions.length} answered)
          </span>
        </h3>
        <div className="flex flex-col gap-6">
          {questions.map((q, idx) => {
            const isAnswered = q.userAnswer && q.userAnswer.trim()
            return (
              <div key={q.id}>
                {/* Question + answer context */}
                <div className="bg-[#111113] border border-[#27272a] rounded-t-[12px] px-5 py-4 border-b-0">
                  <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider mb-1">
                    Q{idx + 1}
                  </p>
                  <p className="text-sm text-[#fafafa] leading-relaxed">{q.questionText}</p>
                  {isAnswered && (
                    <div className="mt-3 pt-3 border-t border-[#1f1f22]">
                      <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider mb-1">Your Answer</p>
                      <p className="text-xs text-[#71717a] leading-relaxed whitespace-pre-wrap line-clamp-4">{q.userAnswer}</p>
                    </div>
                  )}
                </div>
                {/* Evaluation */}
                {isAnswered ? (
                  <EvaluationCard
                    result={{
                      score: q.aiScore,
                      feedback: q.aiFeedback,
                    }}
                    className="rounded-t-none border-t-0"
                  />
                ) : (
                  <div className="bg-[#0a0a0b] border border-[#1f1f22] rounded-b-[12px] px-5 py-3 text-xs text-[#52525b] italic">
                    Not answered
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Overall Results Page ---------- */
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
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [user?.userId, token])

  const avgScore = sessions.length > 0
    ? (sessions.reduce((a, b) => a + (b.overallScore || 0), 0) / sessions.length).toFixed(1)
    : 0
  const bestScore = sessions.length > 0
    ? Math.max(...sessions.map(s => s.overallScore || 0))
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Avg Score Banner */}
      <div className="bg-[#111113] border border-[#27272a] rounded-[12px] p-5 mb-6 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[9px] bg-[#7c6af7]/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-[#7c6af7]" />
          </div>
          <div>
            <p className="text-xs text-[#71717a]">Average Score</p>
            <p className="text-2xl font-semibold text-[#fafafa]">{avgScore}/10</p>
          </div>
        </div>
        <div className="w-px h-10 bg-[#27272a]" />
        <div>
          <p className="text-xs text-[#71717a]">Sessions</p>
          <p className="text-2xl font-semibold text-[#fafafa]">{sessions.length}</p>
        </div>
        <div className="w-px h-10 bg-[#27272a]" />
        <div>
          <p className="text-xs text-[#71717a]">Best Score</p>
          <p className="text-2xl font-semibold text-[#22c55e]">{bestScore}/10</p>
        </div>
        <div className="ml-auto">
          <Button size="sm" variant="secondary" onClick={() => navigate('/interview')}>
            New Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Results List */}
        <div>
          <h2 className="text-sm font-semibold text-[#fafafa] mb-4">Session History</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-[#7c6af7] animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[#52525b]">No sessions yet. Start your first interview!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.slice(0, 5).map((s) => {
                const scoreColor = s.overallScore >= 8 ? '#22c55e' : s.overallScore >= 5 ? '#f59e0b' : '#ef4444'
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/results/${s.id}`)}
                    className="bg-[#111113] border border-[#27272a] rounded-[10px] px-4 py-3.5 flex items-center gap-4 hover:border-[#3f3f46] transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-[7px] bg-[#18181b] flex items-center justify-center flex-shrink-0">
                      <BarChart2 size={14} className="text-[#71717a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#fafafa] truncate">{s.topic}</p>
                      <p className="text-xs text-[#52525b]">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: scoreColor }}>
                      {s.overallScore}/10
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
export function ResultsPage() {
  const { sessionId } = useParams()

  return (
    <div className="w-full h-full overflow-y-auto p-7 custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Results</h1>
        <p className="text-sm text-[#71717a]">Review your performance and AI feedback from past sessions.</p>
      </div>

      {sessionId ? <SessionResultsView sessionId={sessionId} /> : <OverallResultsView />}
    </div>
  )
}
