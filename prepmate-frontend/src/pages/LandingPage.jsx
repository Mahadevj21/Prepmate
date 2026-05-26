import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, ArrowRight, Mic, BarChart2, Clock,
  Brain, Target, Zap, ChevronRight
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { loginUser } from '../api'
import { Alert } from '../components/ui/Alert'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Questions',
    desc: 'AI generates realistic, role-specific interview questions tailored to your target position and experience level.',
  },
  {
    icon: BarChart2,
    title: 'Instant Evaluation',
    desc: 'Get scored answers with detailed feedback on what you said well and exactly what to improve.',
  },
  {
    icon: Target,
    title: 'Custom Roadmaps',
    desc: 'AI builds a personalized study plan based on your goal, gaps, and the role you\'re targeting.',
  },
  {
    icon: Zap,
    title: 'Adaptive Difficulty',
    desc: 'Start easy and progress to hard. The system adapts to challenge you at exactly the right level.',
  },
  {
    icon: Clock,
    title: 'Session History',
    desc: 'Every session is saved. Review past answers, track your improvement, and identify patterns.',
  },
  {
    icon: Mic,
    title: 'Distraction-Free Mode',
    desc: 'A clean, focused interface that simulates a real interview environment without distractions.',
  },
]


export function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [tryingFree, setTryingFree] = useState(false)
  const [trialError, setTrialError] = useState('')

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
      if (!localStorage.getItem('prepmate_trial_count')) {
        localStorage.setItem('prepmate_trial_count', '0')
      }
      navigate('/dashboard')
    } catch (err) {
      setTrialError(err.message || 'Sandbox activation failed. Please try register/login.')
    } finally {
      setTryingFree(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#fafafa]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle glow backdrop */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7c6af7]/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#7c6af7]/10 border border-[#7c6af7]/20 rounded-full text-[12px] text-[#9585f8] font-medium mb-8">
            <Sparkles size={11} />
            Powered by AI
          </div>

          <h1 className="text-[52px] font-semibold leading-[1.1] tracking-tight text-[#fafafa] mb-6">
            Interview prep that
            <br />
            <span className="text-[#7c6af7]">actually works.</span>
          </h1>

          <p className="text-lg text-[#71717a] leading-relaxed max-w-xl mx-auto mb-10">
            Practice with AI-generated questions, get scored answers with real feedback,
            and track your progress — all in one clean interface.
          </p>

          {trialError && (
            <Alert type="error" message={trialError} onClose={() => setTrialError('')} className="max-w-md mx-auto mb-6" />
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="xl"
              variant="primary"
              loading={tryingFree}
              onClick={handleTryForFree}
              rightIcon={<ArrowRight size={16} />}
            >
              Try Sandbox (No Sign Up)
            </Button>
            <Button
              size="xl"
              variant="secondary"
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
            <Button
              size="xl"
              variant="secondary"
              onClick={() => navigate('/login')}
              className="border-none hover:bg-transparent text-[#71717a] hover:text-[#fafafa] text-sm"
            >
              Sign In
            </Button>
          </div>

          <p className="text-xs text-[#52525b] mt-5">
            No credit card required. Free to start.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[#1f1f22]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-[#7c6af7] uppercase mb-3">Features</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#fafafa]">
              Everything you need to ace your next interview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1f1f22]">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#0a0a0b] p-6 group hover:bg-[#111113] transition-colors duration-200"
              >
                <div className="w-9 h-9 rounded-[8px] bg-[#7c6af7]/10 flex items-center justify-center mb-4 group-hover:bg-[#7c6af7]/20 transition-colors">
                  <Icon size={17} className="text-[#7c6af7]" />
                </div>
                <h3 className="text-sm font-semibold text-[#fafafa] mb-2">{title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statement */}
      <section className="py-20 px-6 border-t border-[#1f1f22]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-[#7c6af7] uppercase mb-3">Empowering Candidates</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#fafafa] mb-4">
            Helping people confidently ace their technical interviews
          </h2>
          <p className="text-sm text-[#71717a] leading-relaxed max-w-xl mx-auto">
            From Software Engineers to Technical Managers, PrepMate builds the interview muscle memory needed to stand out. Practice under realistic pressure, master core domain concepts, and track your readiness progress all in one unified, clean workflow.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[#1f1f22]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#fafafa] mb-4">
            Ready to start preparing?
          </h2>
          <p className="text-[#71717a] mb-8">
            Join thousands of engineers using PrepMate to land better roles.
          </p>
          <Button
            size="xl"
            variant="primary"
            onClick={() => navigate('/register')}
            rightIcon={<ArrowRight size={16} />}
          >
            Create your account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f1f22] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#7c6af7] flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[#fafafa]">PrepMate</span>
          </div>
          <p className="text-xs text-[#52525b]">
            &copy; {new Date().getFullYear()} PrepMate. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
