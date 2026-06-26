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
    fetch(`${getApiBaseUrl()}/api/test/ping`).catch(() => {})
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
      <header className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant dark:border-outline/20 shadow-sm">
        <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-stack-sm">
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight">PrepMate AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-stack-lg font-body-md text-body-md">
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#features">Features</a>
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Roadmap</a>
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Interviews</a>
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Resume</a>
          </nav>
          <div className="flex items-center gap-stack-md">
            <button 
              onClick={() => navigate('/login')}
              className="text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed font-label-md text-label-md transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="relative w-full">
        {/* Hero Background */}
        <div className="absolute inset-0 grid-pattern pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-[120px] pb-stack-xl flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/50 text-primary font-label-md text-label-md mb-stack-lg">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            PrepMate AI 2.0 is now live
          </div>
          <h1 className="font-display-lg text-[48px] md:text-[64px] leading-tight max-w-4xl mb-stack-md text-on-background tracking-tight font-bold">
            Engineer your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-surface-tint">AI precision.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-stack-xl">
            The most advanced preparation ecosystem for ambitious professionals and students. Stop guessing what recruiters want. Start engineering your path to the perfect role.
          </p>

          {trialError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-medium">{trialError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-stack-md w-full sm:w-auto">
            <button 
              onClick={handleTryForFree}
              disabled={tryingFree}
              className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {tryingFree ? 'Activating Sandbox...' : 'Try Sandbox Free'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-surface text-on-surface border border-outline-variant font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-surface-variant transition-all duration-200 active:scale-95 flex items-center justify-center"
            >
              Create Account
            </button>
          </div>

          <div className="w-full max-w-5xl mt-[80px] rounded-xl border border-outline-variant bg-surface p-2 shadow-2xl relative">
            <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full transform translate-y-10 scale-90"></div>
            <img 
              alt="PrepMate Dashboard Preview" 
              className="w-full h-auto rounded-lg border border-outline-variant/50" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEAvlpZuVf0Z8JdsPaolaP4aWa63PBxYlVsUx-QoMkygpAhLDJGCyyP35lb48OxnGONXbA9yQaQexSDnMnB812xCtE4qyffldFAPj3cYmdkm3Bk1FnluGbOJuLoUSwB-szmEFt_Btmggs_15dADCIeX9Ek7WyK9DlaBIKtXZFkWobrEXYOrFFupB8XPpYsyt9ufaWz5FW_faF9inUeaYaxPoktswdS_JA_kc5lSno2TsCIqaZGENvzB8l3pXv4vViPanpDR33lrDc" 
            />
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
