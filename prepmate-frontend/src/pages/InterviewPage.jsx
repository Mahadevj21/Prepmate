import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { generateInterview, evaluateAnswer } from '../api'

const TOPICS = [
  { id: 'ds', label: 'Data Structures', icon: 'account_tree' },
  { id: 'sys', label: 'System Design', icon: 'hub' },
  { id: 'react', label: 'React', icon: 'rebase_edit' },
  { id: 'node', label: 'Node.js', icon: 'terminal' },
  { id: 'sql', label: 'SQL', icon: 'database' },
  { id: 'python', label: 'Python', icon: 'code_blocks' },
  { id: 'aws', label: 'AWS', icon: 'cloud_queue' },
  { id: 'docker', label: 'Docker', icon: 'grid_view' }
]
const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Fundamental concepts' },
  { id: 'medium', label: 'Medium', desc: 'Real-world scenarios' },
  { id: 'hard', label: 'Hard', desc: 'Complex edge cases' }
]

/* ---------- Step 1 — Setup ---------- */
function SetupStep({ onStart }) {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState('practice') // 'practice' | 'mock'
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
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
    if (!user?.userId) {
      setError('User ID is required.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const payload = {
        difficulty,
        userId: Number(user.userId),
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
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg overflow-y-auto antialiased">
      <header className="flex flex-col gap-2 mb-2">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Configure Your Session</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Choose your focus area and difficulty to begin an AI-simulated interview.</p>
      </header>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container text-sm rounded-xl border border-error/20 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex p-1 bg-surface-container-high rounded-xl w-full max-w-md mx-auto mb-4 border border-outline-variant/30">
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-3 rounded-lg font-label-md text-label-md transition-all duration-200 ${activeTab === 'practice' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Topic Practice
        </button>
        <button
          onClick={() => setActiveTab('mock')}
          className={`flex-1 py-3 rounded-lg font-label-md text-label-md transition-all duration-200 ${activeTab === 'mock' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Mock Interview
        </button>
      </div>

      <div className="flex flex-col gap-stack-xl">
        {activeTab === 'practice' ? (
          <section>
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-6">1. Select a focus area</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.label)}
                  className={`bg-surface-container-lowest border rounded-2xl p-stack-md flex flex-col items-center gap-stack-sm hover:-translate-y-1 transition-all duration-300 text-center ${topic === t.label ? 'border-primary ring-1 ring-primary/20 bg-primary-container/20' : 'border-outline-variant/50 hover:border-primary/50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 ${topic === t.label ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[24px]">{t.icon}</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm font-semibold">{t.label}</span>
                </button>
              ))}
              <button
                onClick={() => setTopic('__custom__')}
                className={`bg-surface-container-lowest border rounded-2xl p-stack-md flex flex-col items-center gap-stack-sm hover:-translate-y-1 transition-all duration-300 text-center ${topic === '__custom__' ? 'border-primary ring-1 ring-primary/20 bg-primary-container/20' : 'border-outline-variant/60 border-dashed hover:border-primary/50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 ${topic === '__custom__' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-semibold">Custom</span>
              </button>
            </div>
            {topic === '__custom__' && (
              <div className="mt-6 animate-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Enter custom topic (e.g. GraphQL, Flutter, Architecture)"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full h-12 px-4 bg-surface border border-outline-variant rounded-xl font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
            )}
          </section>
        ) : (
          <section>
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-6">1. Paste Job Description</h3>
            <textarea
              rows={8}
              placeholder="Requirements: 3+ years React experience, Node.js proficiency, familiar with AWS..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-4 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm resize-none"
            />
            <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">Our AI will extract core competencies and generate 7 targeted questions.</p>
          </section>
        )}

        <section>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-6">2. Choose Difficulty</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`p-stack-md rounded-2xl border text-left transition-all duration-200 ${difficulty === d.id ? 'bg-surface-container-lowest border-primary ring-1 ring-primary/20' : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-headline-sm text-headline-sm font-bold capitalize">{d.label}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${difficulty === d.id ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-outline'}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {difficulty === d.id ? 'check_circle' : 'circle'}
                    </span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{d.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleStart}
          disabled={loading || (activeTab === 'practice' ? !activeTopic.trim() : !jobDescription.trim())}
          className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-2xl flex items-center justify-center gap-3 shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 mb-12"
        >
          {loading ? 'Analyzing & Generating...' : 'Begin Session'}
          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
        </button>
      </div>
    </div>
  )
}

/* ---------- Step 2 — Active Interview ---------- */
function InterviewStep({ session, topic, difficulty, onDone }) {
  const { token } = useAuth()
  const questions = session?.questions ?? []
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const q = questions[current]
  const progressPercent = ((current) / questions.length) * 100

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setError('')
    setLoading(true)
    try {
      const result = await evaluateAnswer({ questionId: q.id, userAnswer: answer }, token)
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
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-gutter overflow-y-auto">
      {/* Session Progress Header */}
      <header className="flex flex-col gap-stack-md mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">{topic}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-label-md text-label-md text-on-surface-variant">Question {current + 1} of {questions.length}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="font-label-md text-label-md text-primary font-bold capitalize">{difficulty} Mode</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <button onClick={() => window.location.reload()} className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-2 font-label-md">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Exit Session
            </button>
          </div>
        </div>
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container text-sm rounded-xl border border-error/20 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter flex-1 items-start">
        {/* Question Panel */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-stack-md soft-shadow">
          <div className="flex items-center gap-2 text-primary font-label-md text-label-md uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
            Prompt
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold leading-relaxed">
            {q.questionText || q.text || q.question}
          </h3>
          <div className="mt-8 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Highlight your relevant experience and explain your architectural trade-offs where applicable.
            </p>
          </div>
        </div>

        {/* Answer Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <div className="relative group">
            <textarea
              rows={12}
              placeholder="Your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-6 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl font-body-md text-on-surface text-body-md leading-relaxed focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm resize-none"
            />
            <div className="absolute top-4 right-4 text-outline font-label-md text-label-md px-3 py-1 bg-surface-container round-full border border-outline-variant/30">
              {answer.trim().split(/\s+/).length} words
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-[18px]">keyboard_option_key</span>
              Press Cmd/Ctrl + Enter to submit
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
              className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-[0.98] transition-all disabled:opacity-70 active:scale-95"
            >
              {loading ? 'Evaluating...' : (current + 1 === questions.length ? 'Finalize Session' : 'Continue')}
              <span className="material-symbols-outlined text-[20px]">
                {current + 1 === questions.length ? 'done_all' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </div>
      </div>
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
      <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl flex flex-col items-center justify-center text-center antialiased">
        <div className="w-20 h-20 rounded-2xl bg-primary shadow-lg flex items-center justify-center mb-stack-lg pulse-ring">
          <span className="material-symbols-outlined text-on-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="font-headline-lg text-[32px] md:text-[48px] font-bold text-on-surface tracking-tight mb-2">Session Complete.</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-stack-xl">
          Excellent work! Your responses have been analyzed by our AI model. You maintained focus throughout the session.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full max-w-4xl mb-stack-xl">
          <div className="bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant/30">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Average Score</h4>
            <p className="text-[40px] font-bold text-primary tracking-tighter">{avgScore}<span className="text-[20px] text-on-surface-variant/50">/10</span></p>
          </div>
          <div className="bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant/30">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Depth of Analysis</h4>
            <p className="text-[40px] font-bold text-on-surface tracking-tighter">High</p>
          </div>
          <div className="bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant/30">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Questions</h4>
            <p className="text-[40px] font-bold text-on-surface tracking-tighter">{finalResults.length}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {sessionId && (
            <button
              onClick={() => navigate(`/results/${sessionId}`)}
              className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-md hover:opacity-90 transition-all font-semibold"
            >
              Detailed Report
            </button>
          )}
          <button
            onClick={() => { setPhase('setup'); setSession(null) }}
            className="flex-1 bg-surface text-on-surface border border-outline-variant font-label-md text-label-md py-4 rounded-xl hover:bg-surface-container-low transition-all font-semibold"
          >
            New Session
          </button>
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
