import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { generateRoadmap } from '../api'

export function RoadmapPage() {
    const { user, token } = useAuth()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const isTrialActive = localStorage.getItem('prepmate_trial_active') === 'true'
    const [trialCount, setTrialCount] = useState(() => Number(localStorage.getItem('prepmate_trial_count') ?? 0))
    const chatEndRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleSend = async (e) => {
        if (e) e.preventDefault()
        if (!input.trim() || loading) return
        const promptText = input.trim()
        setInput('')
        setError('')

        if (isTrialActive && trialCount >= 3) {
            setMessages(prev => [...prev,
            { id: Date.now(), role: 'user', text: promptText },
            { id: Date.now() + 1, role: 'assistant', isTrialWall: true, text: 'Sandbox limit reached.' }
            ])
            return
        }

        setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: promptText }])
        setLoading(true)
        try {
            const data = await generateRoadmap({ goal: promptText, userId: Number(user?.userId) }, token)
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', mode: 'roadmap', data }])
            if (isTrialActive) {
                const next = trialCount + 1
                setTrialCount(next)
                localStorage.setItem('prepmate_trial_count', String(next))
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-gutter overflow-hidden h-full antialiased">
            <header className="flex flex-col gap-2 shrink-0">
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">AI Career Roadmap</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Describe your career goal, and our AI will engineer a personalized path for you.</p>
            </header>

            {/* Roadmap Stream */}
            <div className="flex-1 overflow-y-auto px-1 space-y-gutter custom-scrollbar pb-24">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-16 h-16 rounded-3xl bg-surface-container-high flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
                        </div>
                        <div>
                            <h3 className="font-headline-md text-headline-md font-semibold mb-2">What's your next big move?</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">"Become a Senior Frontend Engineer at a Fintech startup" or "Transition from Java to Go Backend".</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                            {['FAANG Backend Engineer', 'React specialist', 'Cloud Architect'].map(sq => (
                                <button
                                    key={sq}
                                    onClick={() => setInput(sq)}
                                    className="px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-full text-sm hover:border-primary transition-colors"
                                >
                                    {sq}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] md:max-w-[70%] rounded-2xl p-6 ${msg.role === 'user' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest border border-outline-variant/50 ambient-shadow'}`}>
                                {msg.role === 'user' ? (
                                    <p className="font-body-md text-body-md leading-relaxed">{msg.text}</p>
                                ) : (
                                    <div className="space-y-6">
                                        {msg.isTrialWall ? (
                                            <div className="text-center py-4">
                                                <span className="material-symbols-outlined text-primary text-[40px] mb-4">lock</span>
                                                <h4 className="font-headline-sm font-bold mb-2">Sandbox Limit Reached</h4>
                                                <p className="text-sm text-on-surface-variant">Sign up to unlock unlimited Roadmap generation and full mock interviews.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {(() => {
                                                    let content = msg.data?.generatedContent || ''
                                                    let weeks = []
                                                    try {
                                                        const parsed = JSON.parse(content)
                                                        weeks = parsed.weeks || []
                                                    } catch {
                                                        // basic parsing for non-json
                                                        return <p className="whitespace-pre-wrap text-sm text-on-surface-variant">{content}</p>
                                                    }

                                                    return (
                                                        <div className="flex flex-col gap-6">
                                                            {weeks.map((week, idx) => (
                                                                <div key={idx} className="relative pl-12 before:absolute before:left-[19px] before:top-10 before:bottom-0 before:w-0.5 before:bg-outline-variant/30 last:before:hidden">
                                                                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 ${idx === 0 ? 'bg-primary border-primary text-on-primary' : 'bg-surface border-outline-variant/50 text-on-surface-variant'}`}>
                                                                        <span className="font-label-md font-bold">{week.weekNumber}</span>
                                                                    </div>
                                                                    <div className="bg-surface-container-low/50 rounded-xl p-4 border border-outline-variant/20">
                                                                        <h4 className="font-headline-sm font-bold text-on-surface mb-3">Week {week.weekNumber}: {week.title}</h4>
                                                                        <ul className="space-y-2">
                                                                            {week.topics?.map((topic, tidx) => (
                                                                                <li key={tidx} className="flex items-start gap-3 text-sm text-on-surface-variant">
                                                                                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                                                                                    {topic}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 w-full max-w-[70%] animate-pulse">
                            <div className="h-4 bg-outline-variant/20 rounded w-1/4 mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-20 bg-outline-variant/10 rounded-xl"></div>
                                <div className="h-20 bg-outline-variant/10 rounded-xl w-[90%]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Section */}
            <div className="fixed bottom-0 left-0 right-0 md:left-sidebar-w bg-surface/80 backdrop-blur-md p-margin-mobile md:p-margin-desktop z-10 transition-all duration-300">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative group">
                    <textarea
                        rows="1"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="I want to become a Spring Boot expert..."
                        className="w-full bg-surface-container-highest border border-outline-variant/50 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50 resize-none shadow-lg text-body-md"
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
