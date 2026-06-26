import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { loginUser, getApiBaseUrl } from '../api'

export function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
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
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
            </button>
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

        {/* Hero - Split Layout */}
        <section className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-[80px] md:pt-[120px] pb-[100px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Copy & Actions */}
            <div className="flex flex-col text-left max-w-xl">
              <h1 className="font-display-lg text-[52px] md:text-[68px] leading-[1.05] mb-6 text-on-background tracking-tight font-bold">
                Practice makes <br /><span className="italic font-light text-primary">perfect.</span>
              </h1>
              <p className="font-body-lg text-[18px] md:text-[20px] text-on-surface-variant mb-10 leading-relaxed opacity-90">
                A better way to prepare for technical interviews. Generate study roadmaps, analyze your resume, and run mock interviews right in your browser.
              </p>

              {trialError && (
                <div className="mb-6 p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <p className="text-sm font-medium">{trialError}</p>
                </div>
              )}

              {/* Auth Block (Claude Style) */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm max-w-md w-full">
                <p className="font-label-md text-on-surface mb-4">Start practicing today</p>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-xl hover:opacity-90 transition-opacity mb-4 shadow-sm"
                >
                  Create an account
                </button>

                <div className="relative flex items-center py-2 mb-4">
                  <div className="flex-grow border-t border-outline-variant/30"></div>
                  <span className="flex-shrink-0 mx-4 font-body-sm text-[11px] uppercase tracking-widest text-on-surface-variant/60">or</span>
                  <div className="flex-grow border-t border-outline-variant/30"></div>
                </div>

                <button
                  onClick={handleTryForFree}
                  disabled={tryingFree}
                  className="w-full bg-transparent text-on-surface-variant font-label-md text-sm py-2 rounded-xl hover:text-on-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {tryingFree ? (
                    <div className="w-4 h-4 border-2 border-outline/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <>Try Sandbox <span className="material-symbols-outlined text-[16px]">bolt</span></>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Dynamic Preview */}
            <div className="relative lg:ml-auto w-full max-w-md lg:max-w-lg">
              {/* Decorative background blob */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-[80px] -z-10 translate-x-10 translate-y-10"></div>

              {/* Preview Component Container */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-ambient overflow-hidden relative">
                <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-4">
                  <span className="font-label-md font-semibold tracking-tight text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                    Mock Interview
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">more_horiz</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-sm w-5/6">
                    <p className="font-body-sm text-on-surface text-sm leading-relaxed">
                      "Can you walk me through the architecture of a system you built recently? How did you handle scalability?"
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tr-sm w-5/6">
                      <p className="font-body-sm text-on-surface text-sm leading-relaxed opacity-80">
                        In my last role, we migrated a monolith to microservices... <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-1"></span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-outline-variant/20 flex gap-2">
                  <div className="h-10 px-4 bg-surface-container-high rounded-full flex items-center justify-center border border-outline-variant/30 w-full animate-pulse"></div>
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0 text-primary">
                    <span className="material-symbols-outlined text-[18px]">mic</span>
                  </div>
                </div>
              </div>
            </div>
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
    </svg>
  )
}

