import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { analyzeResume } from '../api'

export function ResumeAnalyzerPage() {
    const { token } = useAuth()
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [analysis, setAnalysis] = useState(null)

    const handleDrop = (e) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile)
            setAnalysis(null)
            setError('')
        }
    }

    const handleAnalyze = async () => {
        if (!file) return
        setLoading(true)
        setError('')
        try {
            const result = await analyzeResume(file, token)
            setAnalysis(result)
        } catch (err) {
            setError(err.message || 'Failed to analyze resume.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg antialiased overflow-y-auto">
            <header className="flex flex-col gap-2">
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Resume Analyzer</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Upload your resume to get feedback on keyword density, action verbs, and overall impact.</p>
            </header>

            {!analysis ? (
                <div className="flex flex-col gap-gutter">
                    {/* Upload Area */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className={`w-full aspect-[21/9] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-stack-xl transition-all duration-300 ambient-shadow ${file ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50 bg-surface-container-low/50'}`}
                    >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${file ? 'bg-primary text-on-primary scale-110' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-[36px]">{file ? 'description' : 'upload_file'}</span>
                        </div>
                        {file ? (
                            <div className="text-center">
                                <h4 className="font-headline-sm font-bold text-on-surface mb-2 tracking-tight">{file.name}</h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mb-8 uppercase tracking-widest font-bold opacity-60">Ready for Intelligence Audit</p>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="bg-primary text-on-primary font-label-md text-label-md px-16 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center gap-3 mx-auto"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Run Diagnostics'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center px-6">
                                <h4 className="font-headline-sm font-bold text-on-surface mb-2 tracking-tight">Drop your resume here</h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Support for professional PDF formats only</p>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    id="resume-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                        setFile(e.target.files[0])
                                        setAnalysis(null)
                                        setError('')
                                    }}
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer bg-surface text-on-surface border border-outline-variant/50 font-label-md text-label-md px-10 py-3.5 rounded-2xl hover:bg-surface-container-low transition-all inline-block ambient-shadow">
                                    Choose File
                                </label>
                            </div>
                        )}
                    </div>

                    {error && <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-center font-label-md">{error}</div>}

                    {/* Feature Teasers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                        {[
                            { icon: 'psychology', label: 'ATS Compatibility', desc: 'Predict how enterprise parsers will interpret your experience markers.', color: 'text-tertiary', bg: 'bg-tertiary/10' },
                            { icon: 'edit_note', label: 'Refactor Recommendations', desc: 'Strategic suggestions to replace passive language with impact-driven action verbs.', color: 'text-primary', bg: 'bg-primary/10' },
                            { icon: 'report_problem', label: 'Layout Integrity', desc: 'Identify multi-column or graphical elements that disrupt parsing logic.', color: 'text-error', bg: 'bg-error/10' }
                        ].map((f, i) => (
                            <div key={i} className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 flex flex-col gap-6 hover:translate-y-[-4px] transition-all">
                                <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-[28px]">{f.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-headline-sm font-bold tracking-tight mb-2">{f.label}</h4>
                                    <p className="font-body-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-gutter animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Results Header */}
                    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[32px] p-8 md:p-10 ambient-shadow grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-3 flex justify-center">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-outline-variant/20" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * analysis.score) / 100} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-bold tracking-tighter text-on-surface">{analysis.score}</span>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Score</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-9 space-y-4">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md text-[11px] uppercase tracking-wider">Analysis Complete</div>
                            <h3 className="text-3xl font-bold tracking-tight">Technical Assessment</h3>
                            <p className="font-body-md text-on-surface-variant leading-relaxed">{analysis.summary}</p>
                            <button onClick={() => setAnalysis(null)} className="text-primary font-bold text-sm hover:underline underline-offset-4">Analyze another resume</button>
                        </div>
                    </div>

                    {/* Feedback Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[32px] p-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-tertiary">
                                <span className="material-symbols-outlined">description</span>
                                <h4 className="font-headline-sm font-bold">ATS Alignment</h4>
                            </div>
                            <p className="font-body-sm text-on-surface-variant leading-relaxed">{analysis.atsCompatibility}</p>
                        </div>
                        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[32px] p-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-success">
                                <span className="material-symbols-outlined">bolt</span>
                                <h4 className="font-headline-sm font-bold">Action Verb Velocity</h4>
                            </div>
                            <p className="font-body-sm text-on-surface-variant leading-relaxed">{analysis.actionVerbFeedback}</p>
                        </div>
                        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[32px] p-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-primary">
                                <span className="material-symbols-outlined">stars</span>
                                <h4 className="font-headline-sm font-bold">Key Strengths</h4>
                            </div>
                            <ul className="space-y-3">
                                {analysis.topStrengths?.map((s, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[32px] p-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-error">
                                <span className="material-symbols-outlined">warning</span>
                                <h4 className="font-headline-sm font-bold">Critical Refactors</h4>
                            </div>
                            <ul className="space-y-3">
                                {analysis.criticalImprovements?.map((s, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-error text-[18px]">arrow_forward</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[32px] p-8">
                        <h4 className="font-headline-sm font-bold mb-6">Strategic Keyword Suggestions</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.suggestedKeywords?.map(kw => (
                                <span key={kw} className="bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-label-md border border-outline-variant/30">{kw}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
