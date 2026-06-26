import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginUser, getApiBaseUrl } from '../api'

export function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tryingFree, setTryingFree] = useState(false)
  const [trialError, setTrialError] = useState('')

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/test/ping`).catch(() => { })
  }, [])

  const handleTryForFree = async () => {
    setTryingFree(true)
    setTrialError('')
    try {
      const response = await loginUser({ email: 'guest@prepmate.com', password: 'password123' })
      login(response.token, {
        email: response.email,
        name: response.name,
        userId: response.id || '3',
      })
      localStorage.setItem('prepmate_trial_active', 'true')
      navigate('/dashboard')
    } catch (err) {
      setTrialError(err.message || 'Sandbox activation failed. Please try register/login.')
    } finally {
      setTryingFree(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      {/* TopNavBar */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-on-primary text-[22px]">auto_awesome</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">PrepMate</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 font-label-md text-label-md">
            <a className="text-on-surface-variant hover:text-primary transition-all duration-200 uppercase tracking-wider font-semibold opacity-70 hover:opacity-100" href="#features">Platform</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-200 uppercase tracking-wider font-semibold opacity-70 hover:opacity-100" href="#">Intelligence</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-200 uppercase tracking-wider font-semibold opacity-70 hover:opacity-100" href="#">Docs</a>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      <main className="relative w-full">
        {/* Hero Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] bg-tertiary/5 blur-[120px] rounded-full"></div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-[100px] pb-stack-xl flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-primary font-label-md text-label-md mb-stack-lg shadow-sm">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Trusted by candidates at top engineering teams
          </div>
          <h1 className="font-display-lg text-[48px] md:text-[72px] leading-[1.1] max-w-4xl mb-stack-md text-on-background tracking-tighter font-bold">
            Engineer your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary-container">AI precision.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-stack-xl leading-relaxed opacity-80">
            The most advanced preparation ecosystem for ambitious professionals. Stop guessing what recruiters want. Start engineering your path to the perfect role.
          </p>

          {trialError && (
            <div className="mb-8 p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-sm font-bold tracking-tight">{trialError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20">
            <button
              onClick={handleTryForFree}
              disabled={tryingFree}
              className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {tryingFree ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Trial Sandbox <span className="material-symbols-outlined text-[18px]">bolt</span></>
              )}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-surface text-on-surface border border-outline-variant/50 font-label-md text-label-md px-10 py-4 rounded-2xl hover:bg-surface-container-low transition-all active:scale-95 flex items-center justify-center ambient-shadow"
            >
              Create Account
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[100px]">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-stack-sm font-bold">The complete preparation toolkit</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Everything you need to master your next career move, engineered into one platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <FeatureCard
              icon="alt_route"
              title="AI Roadmap"
              desc="Generate a step-by-step, personalized curriculum tailored to your target role. We analyze thousands of successful career trajectories to build your optimal path."
            />
            <FeatureCard
              icon="videocam"
              title="Mock Interviews"
              desc="Practice with our hyper-realistic AI interviewer. Receive instant, actionable feedback on your delivery, content depth, and technical accuracy in real-time."
            />
            <FeatureCard
              icon="description"
              title="Resume Analyzer"
              desc="Stop getting filtered by ATS. Our models parse your resume exactly like enterprise systems do, scoring your impact and suggesting critical keyword optimizations."
            />
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-low dark:bg-inverse-surface border-t border-outline-variant dark:border-outline/10">
        <div className="py-stack-xl px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-stack-lg">
          <div className="flex flex-col items-center md:items-start gap-stack-xs">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">PrepMate AI</span>
            <p className="text-primary dark:text-primary-fixed-dim font-body-sm text-body-sm">
              © {new Date().getFullYear()} PrepMate AI. Precision Career Engineering.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-stack-lg">
            <a className="text-on-surface-variant font-body-sm text-body-sm hover:text-primary underline-offset-4 hover:underline transition-opacity duration-200" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant font-body-sm text-body-sm hover:text-primary underline-offset-4 hover:underline transition-opacity duration-200" href="#">Terms of Service</a>
            <a className="text-on-surface-variant font-body-sm text-body-sm hover:text-primary underline-offset-4 hover:underline transition-opacity duration-200" href="#">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg soft-shadow hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-stack-md border border-primary/10">
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-background mb-stack-sm font-semibold">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant flex-grow mb-stack-lg">{desc}</p>
      <a className="text-primary font-label-md text-label-md flex items-center gap-1 hover:gap-2 transition-all" href="#">
        Learn more <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
      </a>
    </div>
  )
}
