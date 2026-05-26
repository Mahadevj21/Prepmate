import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { generateInterview, evaluateAnswer } from '../api'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Textarea } from '../components/ui/Input'

const TOPICS = ['Data Structures', 'System Design', 'React', 'Node.js', 'SQL', 'Java', 'Python', 'Spring Boot', 'AWS', 'Docker']
const DIFFICULTIES = ['easy', 'medium', 'hard']
const DIFF_COLORS = { easy: 'success', medium: 'warning', hard: 'error' }

/* ---------- Step 1 — Setup ---------- */
function SetupStep({ onStart }) {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('practice') // 'practice' | 'mock'
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [userId, setUserId] = useState(user?.userId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeTopic = topic === '__custom__' ? customTopic : topic

  const handleStart = async (e) => {
    e.preventDefault()
    if (activeTab === 'practice' && !activeTopic.trim()) {
      setError('Please select or enter a topic.')
      return
    }
    if (activeTab === 'mock' && !jobDescription.trim()) {
      setError('Please paste a job description.')
      return
    }
    if (!userId) {
      setError('User ID is required.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const payload = {
        difficulty,
        userId: Number(userId),
        mode: activeTab === 'mock' ? 'MOCK' : 'PRACTICE'
      }
      if (activeTab === 'mock') {
        payload.jobDescription = jobDescription
        payload.topic = 'Job Description Mock Interview'
      } else {
        payload.topic = activeTopic
      }

      const result = await generateInterview(payload, token)
      onStart(result, payload.topic, difficulty)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-7 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#fafafa] mb-1">New Interview Session</h1>
        <p className="text-sm text-[#71717a]">Select practice mode or paste a job description to begin.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

      {/* Mode Tabs */}
      <div className="flex bg-[#111113] p-1 rounded-lg border border-[#27272a] mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab('practice'); setError(''); }}
          className={`flex-1 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
            activeTab === 'practice'
              ? 'bg-[#7c6af7] text-white shadow'
              : 'text-[#71717a] hover:text-[#fafafa]'
          }`}
        >
          Topic Practice (5 Questions)
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('mock'); setError(''); }}
          className={`flex-1 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
            activeTab === 'mock'
              ? 'bg-[#7c6af7] text-white shadow'
              : 'text-[#71717a] hover:text-[#fafafa]'
          }`}
        >
          Job Description Mock (7 Questions)
        </button>
      </div>

      <form onSubmit={handleStart} className="flex flex-col gap-6">
        {/* Topic Selection for Practice Mode */}
        {activeTab === 'practice' ? (
          <div>
            <p className="text-sm font-medium text-[#a1a1aa] mb-3">Topic</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-[7px] text-xs font-medium border transition-all duration-150 ${
                    topic === t
                      ? 'bg-[#7c6af7]/15 border-[#7c6af7]/40 text-[#9585f8]'
                      : 'bg-[#111113] border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTopic('__custom__')}
                className={`px-3 py-1.5 rounded-[7px] text-xs font-medium border transition-all duration-150 ${
                  topic === '__custom__'
                    ? 'bg-[#7c6af7]/15 border-[#7c6af7]/40 text-[#9585f8]'
                    : 'bg-[#111113] border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                }`}
              >
                + Custom
              </button>
            </div>
            {topic === '__custom__' && (
              <input
                type="text"
                placeholder="Enter your topic…"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full h-9 bg-[#111113] border border-[#27272a] rounded-[8px] px-3 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#7c6af7]/70 focus:ring-1 focus:ring-[#7c6af7]/30 transition-all"
              />
            )}
          </div>
        ) : (
          /* Job Description Textarea for Mock Mode */
          <div>
            <p className="text-sm font-medium text-[#a1a1aa] mb-2">Pasted Job Description</p>
            <textarea
              rows={8}
              placeholder="Paste the job description (requirements, skills, responsibilities) here. We will generate 7 highly targeted interview questions based on it..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              className="w-full bg-[#111113] border border-[#27272a] rounded-[8px] p-3 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#7c6af7]/70 focus:ring-1 focus:ring-[#7c6af7]/30 transition-all"
            />
          </div>
        )}

        {/* Difficulty */}
        <div>
          <p className="text-sm font-medium text-[#a1a1aa] mb-3">Difficulty</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-[8px] text-xs font-medium border capitalize transition-all duration-150 ${
                  difficulty === d
                    ? d === 'easy'
                      ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]'
                      : d === 'medium'
                        ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'
                        : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
                    : 'bg-[#111113] border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* User ID — hidden, auto-filled from auth */}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          disabled={activeTab === 'practice' ? !activeTopic.trim() : !jobDescription.trim()}
          leftIcon={<Mic size={15} />}
        >
          {activeTab === 'mock' ? 'Generate 7 Custom Questions' : 'Start Interview'}
        </Button>
      </form>
    </div>
  )
}

/* ---------- Step 2 — Active Interview ---------- */
function InterviewStep({ session, topic, difficulty, onDone }) {
  const { token } = useAuth()
  const navigate = useNavigate()
  const questions = session?.questions ?? []

  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const q = questions[current]
  const progress = ((current) / questions.length) * 100

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setError('')
    setLoading(true)
    try {
      const result = await evaluateAnswer({ questionId: q.id, userAnswer: answer }, token)
      // Replace result at current index (handles re-submission after Back)
      const updated = [...results]
      updated[current] = { question: q, answer, evaluation: result }
      setResults(updated)
      if (current + 1 >= questions.length) {
        onDone(updated)
      } else {
        setCurrent((c) => c + 1)
        setAnswer('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!q) return null

  return (
    <div className="p-7 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-[#52525b] mb-1">
            Question {current + 1} of {questions.length}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#a1a1aa]">{topic}</span>
            <Badge variant={DIFF_COLORS[difficulty]}>{difficulty}</Badge>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-[#52525b] hover:text-[#71717a] transition-colors"
        >
          End session
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[#1f1f22] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#7c6af7] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      {/* Question card */}
      <div className="bg-[#111113] border border-[#27272a] rounded-[12px] p-6 mb-5">
        <p className="text-xs font-medium text-[#7c6af7] uppercase tracking-wider mb-3">Question</p>
        <p className="text-base text-[#fafafa] leading-relaxed">{q.questionText ?? q.text ?? q.question}</p>
      </div>

      {/* Answer */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          label="Your answer"
          placeholder="Type your answer here… Be specific and use examples where possible."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={7}
          required
        />
        <div className="flex gap-3">
          {current > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setCurrent((c) => c - 1)
                setAnswer(results[current - 1]?.answer ?? '')
              }}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!answer.trim()}
            rightIcon={<ChevronRight size={15} />}
          >
            {current + 1 === questions.length ? 'Submit & Finish' : 'Submit Answer'}
          </Button>
        </div>
      </form>
    </div>
  )
}

/* ---------- Page Orchestrator ---------- */
export function InterviewPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('setup')       // 'setup' | 'interview' | 'done'
  const [session, setSession] = useState(null)
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [finalResults, setFinalResults] = useState([])

  const handleStart = (result, t, d) => {
    setSession(result)
    setTopic(t)
    setDifficulty(d)
    setPhase('interview')
  }

  const handleDone = (results) => {
    setFinalResults(results)
    setPhase('done')
  }

  if (phase === 'done') {
    const sessionId = session?.session?.id
    const avgScore = finalResults.length > 0
      ? Math.round(finalResults.reduce((a, b) => a + (b.evaluation?.aiScore ?? 0), 0) / finalResults.length)
      : 0

    return (
      <div className="w-full h-full overflow-y-auto p-7 custom-scrollbar">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={26} className="text-[#22c55e]" />
          </div>
          <h2 className="text-xl font-semibold text-[#fafafa] mb-2">Session Complete</h2>
          <p className="text-sm text-[#71717a] mb-2">
            You answered {finalResults.length} questions.
          </p>
          <p className="text-3xl font-bold text-[#7c6af7] mb-8">{avgScore}/10 avg score</p>

          {/* Quick results summary */}
          <div className="flex flex-col gap-3 mb-8 text-left">
            {finalResults.map(({ question, evaluation }, idx) => {
              const score = evaluation?.aiScore ?? 0
              const color = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'
              return (
                <div key={question.id} className="bg-[#111113] border border-[#27272a] rounded-[10px] px-4 py-3 flex items-start gap-3">
                  <span className="text-xs font-mono text-[#52525b] mt-0.5 w-5 flex-shrink-0">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#a1a1aa] truncate">{question.questionText}</p>
                    {evaluation?.aiFeedback && (() => {
                      let displayFeedback = evaluation.aiFeedback
                      if (displayFeedback.trim().startsWith('{')) {
                        try { displayFeedback = JSON.parse(displayFeedback).feedback ?? displayFeedback } catch {}
                      }
                      return <p className="text-[11px] text-[#52525b] mt-1 line-clamp-2">{displayFeedback}</p>
                    })()}
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{score}/10</span>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 justify-center">
            {sessionId && (
              <Button variant="primary" onClick={() => navigate(`/results/${sessionId}`)}>
                Full Results
              </Button>
            )}
            <Button variant="secondary" onClick={() => { setPhase('setup'); setSession(null) }}>
              New Session
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'interview') {
    return (
      <InterviewStep
        session={session}
        topic={topic}
        difficulty={difficulty}
        onDone={handleDone}
      />
    )
  }

  return <SetupStep onStart={handleStart} />
}
