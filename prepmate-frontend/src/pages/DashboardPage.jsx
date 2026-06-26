import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getInterviewHistory } from '../api'

export function DashboardPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [recentSessions, setRecentSessions] = useState([])

  const isTrialActive = localStorage.getItem('prepmate_trial_active') === 'true'
  const trialCount = Number(localStorage.getItem('prepmate_trial_count') ?? 0)

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

  const displayName = user?.name || user?.email?.split('@')[0] || 'Alex'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg md:py-stack-xl flex flex-col gap-stack-lg">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">{today}</p>
          <h2 className="font-headline-lg text-headline-lg md:text-display-lg font-bold text-on-surface tracking-tight">Welcome back, {displayName}.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">
            You're making steady progress. Let's focus on refining your behavioral interview responses today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isTrialActive && (
            <div className="flex items-center gap-2 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full font-label-md text-[12px] shadow-sm border border-primary/10">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Sandbox: {trialCount}/3 used
            </div>
          )}
          <button className="p-2 rounded-full border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all flex items-center justify-center bg-surface">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Readiness Score (Span 4) */}
        <section className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-stack-md border border-outline-variant/50 ambient-shadow flex flex-col items-center justify-center text-center group hover:border-outline-variant transition-colors">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-6 w-full text-left">Overall Readiness</h3>
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle className="stroke-surface-container-high" cx="60" cy="60" fill="none" r="54" strokeWidth="8"></circle>
              <circle className="stroke-primary progress-ring__circle" cx="60" cy="60" fill="none" r="54" strokeDasharray="339.292" strokeDashoffset="74.644" strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-display-lg text-display-lg font-bold text-primary tracking-tighter">78</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Score</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 px-4">Your readiness score is up <strong className="text-primary font-medium">+4 points</strong> from last week.</p>
        </section>

        {/* Upcoming Interviews (Span 8) */}
        <section className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-stack-md border border-outline-variant/50 ambient-shadow flex flex-col group hover:border-outline-variant transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Recent Sessions</h3>
            <button onClick={() => navigate('/history')} className="text-primary hover:opacity-80 font-label-md text-label-md transition-colors flex items-center gap-1">
              View History <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/results/${s.id}`)}
                  className="flex items-center p-4 rounded-xl border border-outline-variant/40 bg-surface hover:bg-surface-container-low transition-colors group/item cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 mr-4">
                    <span className="material-symbols-outlined">{i % 2 === 0 ? 'code' : 'psychology'}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">{s.topic}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Score: {s.overallScore}/10</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-label-md text-label-md text-on-surface">{new Date(s.timestamp).toLocaleDateString()}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover/item:text-primary transition-colors ml-4">chevron_right</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-outline-variant text-[40px] mb-2">videocam_off</span>
                <p className="text-sm text-on-surface-variant">No recent sessions found.</p>
                <button onClick={() => navigate('/interview')} className="mt-4 text-primary font-label-md text-label-md">Start your first mock</button>
              </div>
            )}
          </div>
        </section>

        {/* Resume Strength (Span 6) */}
        <section className="md:col-span-6 bg-surface-container-lowest rounded-2xl p-stack-md border border-outline-variant/50 ambient-shadow flex flex-col group hover:border-outline-variant transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Resume Strength</h3>
            <span className="px-2.5 py-1 bg-surface-container-high text-primary rounded-full font-code-sm text-code-sm font-medium">Top 15%</span>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <div className="flex justify-between font-label-md text-label-md mb-2">
                <span className="text-on-surface">Action Verbs</span>
                <span className="text-on-surface-variant">Great</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-label-md text-label-md mb-2">
                <span className="text-on-surface">Quantifiable Metrics</span>
                <span className="text-on-surface-variant">Needs Work</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                <div className="bg-tertiary h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/analyzer')} className="w-full mt-6 py-2.5 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors">
            Analyze Resume
          </button>
        </section>

        {/* Quick Actions (Span 6) */}
        <section className="md:col-span-6 bg-primary-container text-on-primary-container rounded-2xl p-stack-md border border-primary/20 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="font-headline-md text-headline-md font-semibold mb-2">Ready to level up?</h3>
            <p className="font-body-md text-body-md text-on-primary-container/80 max-w-sm">Complete your roadmap milestone to unlock advanced system design scenarios.</p>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={() => navigate('/roadmap')} className="bg-on-primary-container text-primary-container font-label-md text-label-md py-3 px-6 rounded-xl hover:opacity-90 transition-opacity font-semibold flex-1 active:scale-[0.98]">
              Continue Roadmap
            </button>
            <button className="bg-white/10 border border-white/20 text-on-primary-container font-label-md text-label-md py-3 px-4 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">auto_awesome</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
