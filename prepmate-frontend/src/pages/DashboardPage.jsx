import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getInterviewHistory } from '../api'

export function DashboardPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const isTrialActive = localStorage.getItem('prepmate_trial_active') === 'true'

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.userId || !token) { setLoading(false); return }
      try {
        const data = await getInterviewHistory(user.userId, token)
        setRecentSessions((data || []).slice(0, 3))
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [user?.userId, token])

  const displayName = user?.name || user?.email?.split('@')[0] || 'there'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const avgScore = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / recentSessions.length * 10)
    : null

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg md:py-stack-xl flex flex-col gap-stack-lg">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">{today}</p>
          <h2 className="font-headline-lg text-headline-lg md:text-display-lg font-bold text-on-surface tracking-tight">
            Hey, {displayName}.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">
            {recentSessions.length > 0
              ? `You have ${recentSessions.length} recent session${recentSessions.length > 1 ? 's' : ''}. Keep the momentum going.`
              : "You haven't run a mock interview yet. Start one below to track your progress."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isTrialActive && (
            <div className="flex items-center gap-2 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full font-label-md text-[12px] shadow-sm border border-primary/10">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Sandbox mode
            </div>
          )}
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">

        {/* Score Card */}
        <section className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-stack-md border border-outline-variant/50 ambient-shadow flex flex-col items-center justify-center text-center">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-6 w-full text-left">Avg. Interview Score</h3>
          {avgScore !== null ? (
            <>
              <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  <circle className="stroke-surface-container-high" cx="60" cy="60" fill="none" r="54" strokeWidth="8"></circle>
                  <circle
                    className="stroke-primary progress-ring__circle"
                    cx="60" cy="60" fill="none" r="54"
                    strokeDasharray="339.292"
                    strokeDashoffset={339.292 - (339.292 * avgScore / 100)}
                    strokeLinecap="round" strokeWidth="8"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-display-lg text-display-lg font-bold text-primary tracking-tighter">{avgScore}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">/ 100</span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant px-4">
                Based on your last {recentSessions.length} session{recentSessions.length > 1 ? 's' : ''}.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <span className="material-symbols-outlined text-outline-variant text-[48px]">leaderboard</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">No score yet.<br />Complete a mock interview to see your score here.</p>
            </div>
          )}
        </section>

        {/* Recent Sessions */}
        <section className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-stack-md border border-outline-variant/50 ambient-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Recent Sessions</h3>
            {recentSessions.length > 0 && (
              <button onClick={() => navigate('/history')} className="text-primary hover:opacity-80 font-label-md text-label-md transition-colors flex items-center gap-1">
                View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-on-surface-variant">
                <div className="w-5 h-5 border-2 border-outline-variant border-t-primary rounded-full animate-spin mr-3" />
                Loading sessions...
              </div>
            ) : recentSessions.length > 0 ? (
              recentSessions.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/results/${s.id}`)}
                  className="flex items-center p-4 rounded-xl border border-outline-variant/40 bg-surface hover:bg-surface-container-low transition-colors cursor-pointer group/item"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 mr-4">
                    <span className="material-symbols-outlined text-[20px]">{i % 2 === 0 ? 'code' : 'psychology'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface truncate">{s.topic}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Score: {s.overallScore}/10</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">{new Date(s.timestamp).toLocaleDateString()}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover/item:text-primary transition-colors ml-3">chevron_right</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-outline-variant text-[40px] mb-3">videocam</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">No sessions yet. Run your first mock interview.</p>
                <button
                  onClick={() => navigate('/interview')}
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Start Mock Interview
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="md:col-span-6 bg-surface-container-lowest rounded-2xl p-stack-md border border-outline-variant/50 ambient-shadow flex flex-col gap-4">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3 flex-1">
            <ActionItem icon="videocam" label="New Mock Interview" desc="AI-powered interview with instant feedback" onClick={() => navigate('/interview')} />
            <ActionItem icon="alt_route" label="Build a Roadmap" desc="Get a personalized learning plan for your goal" onClick={() => navigate('/roadmap')} />
            <ActionItem icon="description" label="Analyze Resume" desc="Upload your resume for an ATS and quality audit" onClick={() => navigate('/analyzer')} />
          </div>
        </section>

        {/* CTA */}
        <section className="md:col-span-6 bg-primary text-on-primary rounded-2xl p-stack-md border border-primary/20 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <span className="material-symbols-outlined text-[32px] mb-3 block opacity-80">rocket_launch</span>
            <h3 className="font-headline-md text-headline-md font-semibold mb-2">Ready to practice?</h3>
            <p className="font-body-md text-body-md text-on-primary/80 max-w-sm">
              Mock interviews are the single best way to improve. Start one now and get instant AI feedback.
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={() => navigate('/interview')}
              className="bg-on-primary text-primary font-label-md text-label-md py-3 px-6 rounded-xl hover:opacity-90 transition-opacity font-semibold active:scale-[0.98]"
            >
              Start Interview
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function ActionItem({ icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/40 bg-surface hover:bg-surface-container-low text-left transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-label-md text-label-md font-semibold text-on-surface">{label}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{desc}</p>
      </div>
      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[20px]">chevron_right</span>
    </button>
  )
}
