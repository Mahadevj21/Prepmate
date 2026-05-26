import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Target, Mic, Send,
  CheckCircle, Clipboard, HelpCircle, RefreshCw,
  Edit, ThumbsUp, ThumbsDown, ArrowRight, BarChart2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { generateRoadmap, getInterviewHistory } from '../api'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'

const DIFF_COLORS = { easy: 'success', medium: 'warning', hard: 'error' }

function RoadmapSkeleton() {
  return (
    <div className="space-y-4 w-full animate-pulse py-1">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#27272a]/70" />
        <div className="h-4 w-48 bg-[#27272a]/70 rounded" />
      </div>
      <div className="bg-[#0a0a0b] border border-[#1f1f22] rounded-[8px] p-5 space-y-4">
        <div className="h-4 w-3/4 bg-[#27272a]/70 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 pl-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]/30 mt-2 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-1/3 bg-[#27272a]/70 rounded" />
                <div className="h-2.5 w-5/6 bg-[#1f1f22]/70 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState(user?.userId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentSessions, setRecentSessions] = useState([])

  const isTrialActive = localStorage.getItem('prepmate_trial_active') === 'true'
  const [trialCount, setTrialCount] = useState(() => Number(localStorage.getItem('prepmate_trial_count') ?? 0))
  const [timeRemaining, setTimeRemaining] = useState('')
  const [feedbacks, setFeedbacks] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (user?.userId) setUserId(user.userId)
  }, [user])

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.userId || !token) return
      try {
        const data = await getInterviewHistory(user.userId, token)
        setRecentSessions((data || []).slice(0, 3))
      } catch { /* ignore */ }
    }
    fetchSessions()
  }, [user?.userId, token])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!isTrialActive) return
    const check = () => {
      const start = localStorage.getItem('prepmate_trial_start_time')
      if (start && Date.now() - Number(start) >= 30 * 60 * 1000) {
        localStorage.setItem('prepmate_trial_count', '0')
        localStorage.removeItem('prepmate_trial_start_time')
        setTrialCount(0)
      }
    }
    check()
    const iv = setInterval(check, 15000)
    return () => clearInterval(iv)
  }, [isTrialActive])

  useEffect(() => {
    if (!isTrialActive) return
    const update = () => {
      const start = localStorage.getItem('prepmate_trial_start_time')
      if (start && trialCount > 0) {
        const rem = 30 * 60 * 1000 - (Date.now() - Number(start))
        if (rem > 0) {
          const m = Math.floor(rem / 60000), s = Math.floor((rem % 60000) / 1000)
          setTimeRemaining(`(resets in ${m}m ${s}s)`)
          return
        }
      }
      setTimeRemaining('')
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [isTrialActive, trialCount])

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return
    const promptText = input.trim()
    setInput('')
    setError('')

    if (isTrialActive && trialCount >= 3) {
      setMessages(prev => [...prev,
        { id: Date.now(), role: 'user', text: promptText },
        { id: Date.now() + 1, role: 'assistant', isTrialWall: true, text: '' }
      ])
      return
    }
    if (!userId) { setError('User ID is required.'); return }

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: promptText }])
    setLoading(true)
    try {
      const data = await generateRoadmap({ goal: promptText, userId: Number(userId) }, token)
      if (data.generatedContent?.startsWith?.('AI_ERROR:')) throw new Error(data.generatedContent.replace(/^AI_ERROR:/, ''))
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', mode: 'roadmap', text: `Roadmap for: "${promptText}"`, data }])
      if (isTrialActive) {
        const next = trialCount + 1
        setTrialCount(next)
        localStorage.setItem('prepmate_trial_count', String(next))
        if (!localStorage.getItem('prepmate_trial_start_time'))
          localStorage.setItem('prepmate_trial_start_time', String(Date.now()))
      }
    } catch (err) {
      const msg = err.message || 'AI request failed. Check your Gemini API key and model in backend config.'
      setError(msg)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', isError: true, text: msg }])
    } finally {
      setLoading(false)
    }
  }

  const getCopyText = (msg) => {
    if (msg.mode === 'roadmap' && msg.data?.generatedContent) return msg.data.generatedContent
    return msg.text
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0b] text-[#fafafa] relative overflow-hidden">

      {isTrialActive && (
        <div className="absolute top-4 right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-[#7c6af7]/10 border border-[#7c6af7]/25 rounded-full text-[10px] text-[#9585f8] font-mono shadow-xl backdrop-blur-md">
          <Sparkles size={11} />
          <span>Sandbox: {trialCount}/3 used {timeRemaining}</span>
        </div>
      )}

      {/* Chat stream */}
      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">

          {messages.length === 0 ? (
            <div className="py-10 max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7c6af7]/10 border border-[#7c6af7]/20 rounded-full text-xs text-[#9585f8] font-medium">
                  <Sparkles size={11} /> Powered by AI
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {isTrialActive ? 'Welcome to PrepMate Sandbox!' : `Welcome back, ${displayName}`}
                </h1>
                <p className="text-[#71717a] text-sm leading-relaxed max-w-lg mx-auto">
                  {isTrialActive
                    ? 'Explore AI-powered roadmaps in Sandbox Mode. For full mock interviews, create a free account.'
                    : 'Generate personalized AI learning roadmaps below, or start a full mock interview session from the sidebar.'}
                </p>
              </div>

              {/* Quick action cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div
                  onClick={() => setInput('Become a FAANG Backend Engineer with Go & Docker')}
                  className="bg-[#111113] border border-[#27272a] rounded-[10px] p-4 text-left hover:border-[#7c6af7]/40 hover:bg-[#111113]/80 transition-all cursor-pointer group"
                >
                  <Target size={15} className="text-[#7c6af7] mb-2" />
                  <p className="text-xs font-semibold text-[#fafafa] mb-1">Generate AI Roadmap</p>
                  <p className="text-[11px] text-[#52525b] group-hover:text-[#71717a] transition-colors">
                    "Become a FAANG Backend Engineer with Go..."
                  </p>
                </div>
                <div
                  onClick={() => navigate('/interview')}
                  className="bg-[#111113] border border-[#27272a] rounded-[10px] p-4 text-left hover:border-[#7c6af7]/40 hover:bg-[#111113]/80 transition-all cursor-pointer group"
                >
                  <Mic size={15} className="text-[#7c6af7] mb-2" />
                  <p className="text-xs font-semibold text-[#fafafa] mb-1">Start Mock Interview</p>
                  <p className="text-[11px] text-[#52525b] group-hover:text-[#71717a] transition-colors">
                    Paste a job description → get 7 targeted questions
                  </p>
                </div>
              </div>

              {/* Recent sessions */}
              {recentSessions.length > 0 && (
                <div className="max-w-xl mx-auto">
                  <p className="text-xs font-semibold text-[#52525b] uppercase tracking-wider mb-3">Recent Sessions</p>
                  <div className="flex flex-col gap-2">
                    {recentSessions.map(s => {
                      const scoreColor = s.overallScore >= 8 ? '#22c55e' : s.overallScore >= 5 ? '#f59e0b' : '#ef4444'
                      return (
                        <div
                          key={s.id}
                          onClick={() => navigate(`/results/${s.id}`)}
                          className="flex items-center gap-3 bg-[#111113] border border-[#27272a] rounded-[9px] px-4 py-3 hover:border-[#3f3f46] cursor-pointer transition-all"
                        >
                          <BarChart2 size={13} className="text-[#71717a] flex-shrink-0" />
                          <span className="text-sm text-[#fafafa] flex-1 truncate">{s.topic}</span>
                          <span className="text-xs font-semibold" style={{ color: scoreColor }}>{s.overallScore}/10</span>
                          <ArrowRight size={12} className="text-[#52525b]" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-[12px] p-4 ${
                    msg.role === 'user' ? 'bg-[#18181b] border border-[#27272a]'
                    : msg.isError ? 'bg-[#ef44440a] border border-[#ef444420]'
                    : msg.isTrialWall ? 'bg-[#7c6af7]/10 border border-[#7c6af7]/25'
                    : 'bg-[#111113] border border-[#1f1f22]'
                  }`}>

                    {msg.isTrialWall ? (
                      <div className="space-y-4 text-center py-4 px-2">
                        <div className="w-12 h-12 rounded-full bg-[#7c6af7]/10 border border-[#7c6af7]/25 flex items-center justify-center mx-auto">
                          <Sparkles size={20} className="text-[#9585f8]" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold">Sandbox Limit Reached</h3>
                          <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-sm mx-auto">
                            Create a free account to unlock unlimited roadmaps, full mock interviews, and progress tracking.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                          <Button size="sm" variant="primary" onClick={() => { localStorage.removeItem('prepmate_trial_active'); localStorage.removeItem('prepmate_trial_count'); window.location.href = '/register' }}>
                            Sign Up Free
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => { localStorage.removeItem('prepmate_trial_active'); localStorage.removeItem('prepmate_trial_count'); window.location.href = '/' }}>
                            Back to Home
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.role === 'user' && (
                          <div className="flex items-center justify-between gap-4 mb-1.5 border-b border-[#27272a]/40 pb-1 text-[#71717a]">
                            <span className="text-[10px] uppercase tracking-wider font-semibold font-mono">Roadmap Prompt</span>
                            <button onClick={() => { setInput(msg.text); document.querySelector('textarea')?.focus() }} className="hover:text-[#9585f8] transition-colors p-0.5 rounded">
                              <Edit size={11} />
                            </button>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed text-[#a1a1aa] whitespace-pre-wrap">{msg.text}</p>

                        {msg.role === 'assistant' && msg.data && msg.mode === 'roadmap' && (
                          <div className="mt-4 pt-3 border-t border-[#1f1f22] space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#9585f8]">
                              <Target size={13} /> Roadmap Generated
                            </div>
                            <div className="bg-[#0a0a0b] border border-[#1f1f22] rounded-[8px] p-4 text-xs leading-relaxed">
                              {(() => {
                                // Try to parse as structured JSON first
                                let weeks = null
                                try {
                                  const parsed = JSON.parse(msg.data.generatedContent)
                                  weeks = parsed?.weeks
                                } catch {}

                                if (weeks && Array.isArray(weeks)) {
                                  return (
                                    <div className="space-y-4">
                                      {weeks.map((week) => (
                                        <div key={week.weekNumber}>
                                          <h4 className="text-sm font-semibold text-[#fafafa] mb-2 flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#7c6af7]/20 border border-[#7c6af7]/40 flex items-center justify-center text-[10px] font-bold text-[#9585f8]">
                                              {week.weekNumber}
                                            </span>
                                            Week {week.weekNumber}: {week.title}
                                          </h4>
                                          <ul className="space-y-1 pl-7">
                                            {(week.topics || []).map((topic, i) => (
                                              <li key={i} className="flex items-start gap-2 text-[#71717a] hover:text-[#a1a1aa] transition-colors">
                                                <span className="w-1 h-1 rounded-full bg-[#7c6af7]/50 mt-1.5 flex-shrink-0" />
                                                {topic}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                }

                                // Fallback: render as markdown-style text
                                return (
                                  <div className="space-y-3 text-[#a1a1aa]">
                                    {msg.data.generatedContent.split('\n').map((line, idx) => {
                                      const t = line.trim()
                                      if (t.startsWith('##')) return <h4 key={idx} className="text-sm font-semibold text-[#fafafa] mt-3 mb-1 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]" />{t.replace(/^#+\s*/, '')}</h4>
                                      if (t.startsWith('*') || t.startsWith('-')) return <div key={idx} className="pl-4 py-0.5 text-[#71717a] border-l border-[#27272a] hover:border-[#7c6af7] transition-colors">{t.replace(/^[\*\-\s]+/, '')}</div>
                                      if (t) return <p key={idx}>{t}</p>
                                      return null
                                    })}
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        )}

                        {msg.role === 'assistant' && !msg.isError && (
                          <div className="mt-4 pt-2.5 border-t border-[#1f1f22] flex items-center justify-between text-xs text-[#52525b]">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setFeedbacks(p => ({ ...p, [msg.id]: p[msg.id] === 'up' ? null : 'up' }))} className={`p-1 rounded-[6px] hover:bg-[#18181b] transition-all ${feedbacks[msg.id] === 'up' ? 'text-[#22c55e] bg-[#22c55e]/10' : ''}`}><ThumbsUp size={12} /></button>
                              <button onClick={() => setFeedbacks(p => ({ ...p, [msg.id]: p[msg.id] === 'down' ? null : 'down' }))} className={`p-1 rounded-[6px] hover:bg-[#18181b] transition-all ${feedbacks[msg.id] === 'down' ? 'text-[#ef4444] bg-[#ef4444]/10' : ''}`}><ThumbsDown size={12} /></button>
                            </div>
                            <button onClick={() => handleCopy(msg.id, getCopyText(msg))} className={`px-2 py-1 rounded-[6px] hover:bg-[#18181b] flex items-center gap-1.5 text-[10px] font-medium transition-all ${copiedId === msg.id ? 'text-[#22c55e]' : ''}`}>
                              {copiedId === msg.id ? <><CheckCircle size={10} /> Copied!</> : <><Clipboard size={10} /> Copy</>}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-[85%] rounded-[12px] p-4 bg-[#111113] border border-[#1f1f22] space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-[#52525b] font-mono uppercase tracking-wider">
                      <RefreshCw size={10} className="animate-spin text-[#7c6af7]" /> Generating with AI...
                    </div>
                    <RoadmapSkeleton />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-[#1f1f22] bg-[#0a0a0b]/80 backdrop-blur-md px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Target size={13} className="text-[#7c6af7]" />
            <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">AI Roadmap Generator</span>
            <div className="flex-1" />
            <Button size="sm" variant="secondary" onClick={() => navigate('/interview')} leftIcon={<Mic size={12} />}>
              Mock Interview
            </Button>
          </div>
          <form onSubmit={handleSend} className="relative flex items-end bg-[#111113] border border-[#27272a] rounded-[12px] px-3.5 py-3 focus-within:border-[#7c6af7]/50 focus-within:ring-1 focus-within:ring-[#7c6af7]/20 transition-all">
            <textarea
              rows={2}
              placeholder="Describe your learning goal (e.g., Become a Spring Boot backend dev in 6 months)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              className="flex-1 bg-transparent text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none resize-none max-h-36 pr-10 leading-relaxed custom-scrollbar"
            />
            <button type="submit" disabled={!input.trim() || loading} className={`p-1.5 rounded-[8px] transition-all flex items-center justify-center ${input.trim() && !loading ? 'bg-[#7c6af7] text-white hover:bg-[#6b5ce0]' : 'bg-[#18181b] text-[#52525b] cursor-not-allowed'}`}>
              <Send size={14} />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-[#52525b]">
            <span className="flex items-center gap-1"><HelpCircle size={10} /> Shift + Enter for new line</span>
            <span className="font-mono">Secure SSL Connection</span>
          </div>
        </div>
      </div>
    </div>
  )
}
