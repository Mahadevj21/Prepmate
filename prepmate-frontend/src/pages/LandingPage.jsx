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
      setTrialError(err.message || 'Sandbox is currently unavailable. Please register for a free account.')
    } finally {
      setTryingFree(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden min-h-screen">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-on-primary text-[22px]">auto_awesome</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">PrepMate</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 font-label-md text-label-md">
            <a className="text-on-surface-variant hover:text-primary transition-all duration-200 uppercase tracking-wider font-semibold opacity-70 hover:opacity-100" href="#features">Features</a>
            <a className="text-on-surface-variant hover:text-primary transition-all duration-200 uppercase tracking-wider font-semibold opacity-70 hover:opacity-100" href="#how-it-works">How it works</a>
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
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="relative w-full">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] bg-tertiary/5 blur-[120px] rounded-full"></div>
        </div>

        {/* Hero */}
        <section className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-[100px] pb-stack-xl flex flex-col items-center text-center">
          <h1 className="font-display-lg text-[48px] md:text-[72px] leading-[1.1] max-w-4xl mb-stack-md text-on-background tracking-tighter font-bold">
            Stop guessing.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary-container">Prepare with precision.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-stack-xl leading-relaxed opacity-80">
            PrepMate uses AI to run mock interviews, build personalized roadmaps, and analyze your resume — all in one place.
          </p>

          {trialError && (
            <div className="mb-8 p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-sm font-bold tracking-tight">{trialError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all"
            >
              Create Free Account
            </button>
            <button
              onClick={handleTryForFree}
              disabled={tryingFree}
              className="w-full sm:w-auto bg-surface text-on-surface border border-outline-variant/50 font-label-md text-label-md px-10 py-4 rounded-2xl hover:bg-surface-container-low transition-all active:scale-95 flex items-center justify-center gap-2 ambient-shadow disabled:opacity-70"
            >
              {tryingFree ? (
                <div className="w-4 h-4 border-2 border-outline/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <>Try Sandbox <span className="material-symbols-outlined text-[16px]">bolt</span></>
              )}
            </button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[80px]">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-stack-sm font-bold">Everything you need to land the role</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">Three powerful tools, one focused platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <FeatureCard
              icon="alt_route"
              title="AI Roadmap"
              desc="Get a personalized, step-by-step learning plan based on your target role. No generic tutorials — a curriculum built around where you actually want to go."
            />
            <FeatureCard
              icon="videocam"
              title="Mock Interviews"
              desc="Practice real-world interview questions with an AI interviewer. Get scored on content, clarity, and depth — then review your answers to improve."
            />
            <FeatureCard
              icon="description"
              title="Resume Analyzer"
              desc="Upload your resume and get an instant audit: ATS compatibility, keyword gaps, action verb strength, and concrete suggestions to improve your score."
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[80px] border-t border-outline-variant/20">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-stack-sm font-bold">How it works</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Simple to start, designed to actually help.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-center">
            {[
              { step: '1', title: 'Create your account', desc: 'Sign up for free. No credit card required.' },
              { step: '2', title: 'Pick your goal', desc: 'Tell us your target role. We build your plan.' },
              { step: '3', title: 'Practice and improve', desc: 'Run interviews, get feedback, track progress.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {step}
                </div>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-background">{title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-on-primary font-label-md text-label-md px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all"
            >
              Start for free
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-low border-t border-outline-variant">
        <div className="py-stack-xl px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-stack-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[16px]">auto_awesome</span>
            </div>
            <span className="font-semibold text-on-surface">PrepMate</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} PrepMate. Built to help you land the job.
          </p>
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
      <p className="font-body-md text-body-md text-on-surface-variant flex-grow">{desc}</p>
    </div>
  )
}
