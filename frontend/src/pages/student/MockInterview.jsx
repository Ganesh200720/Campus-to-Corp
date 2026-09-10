import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import ScoreRing from '../../components/ScoreRing'
import { Mic, CheckCircle2, AlertCircle, Lightbulb, RotateCcw } from 'lucide-react'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

export default function MockInterview() {
  const [phase, setPhase] = useState('setup') // setup | taking | result
  const [roles, setRoles] = useState([])
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)

  useEffect(() => {
    (async () => {
      const res = await api.get('/interviews/roles/')
      setRoles(res.data)
      setRole(res.data[0] || '')
      setLoading(false)
    })()
  }, [])

  const start = async () => {
    setLoading(true)
    const res = await api.get(`/interviews/questions/?role=${encodeURIComponent(role)}&difficulty=${difficulty}`)
    setQuestions(res.data)
    setAnswers({})
    setPhase('taking')
    setLoading(false)
  }

  const submit = async () => {
    setLoading(true)
    const payload = {
      role, difficulty,
      answers: questions.map((q) => ({ question_id: q.id, answer_text: answers[q.id] || '' })),
    }
    const res = await api.post('/interviews/submit/', payload)
    setResult(res.data)
    setPhase('result')
    setLoading(false)
  }

  if (loading) return <LoadingState label="Please wait..." />

  if (phase === 'setup') {
    return (
      <div className="max-w-xl mx-auto card p-8 text-center">
        <Mic size={40} className="text-brand-600 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-800 mb-2">Mock Interview</h1>
        <p className="text-slate-500 text-sm mb-6">
          Practice with realistic role-specific questions. Your answers are evaluated using a transparent
          rule-based scoring model (keyword relevance + depth) — designed so a real AI evaluator can be
          plugged in later.
        </p>
        <div className="text-left space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 px-3.5 py-2 rounded-xl text-sm font-medium border capitalize
                    ${difficulty === d ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={start} className="btn-primary mt-6 w-full">Start Interview</button>
      </div>
    )
  }

  if (phase === 'taking') {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-600">{role} · <span className="capitalize">{difficulty}</span></p>
        </div>
        {questions.map((q, idx) => (
          <div key={q.id} className="card p-6">
            <p className="font-medium text-slate-800 mb-3">{idx + 1}. {q.text}</p>
            <textarea
              rows={4}
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Type your answer here..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
            />
          </div>
        ))}
        <button onClick={submit} className="btn-primary w-full py-3">Submit Interview</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-8 text-center">
        <ScoreRing score={result.overall_score} size={120} label="Interview Score" color="#4f46e5" />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-semibold text-emerald-700 flex items-center gap-2 mb-3"><CheckCircle2 size={18} /> Strengths</h3>
          <ul className="text-sm text-slate-600 space-y-1.5">{result.strengths.map((s) => <li key={s}>• {s}</li>)}</ul>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-rose-700 flex items-center gap-2 mb-3"><AlertCircle size={18} /> Areas to Improve</h3>
          <ul className="text-sm text-slate-600 space-y-1.5">{result.improvements.map((s) => <li key={s}>• {s}</li>)}</ul>
        </div>
      </div>
      {result.suggested_topics?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3"><Lightbulb size={18} className="text-amber-500" /> Suggested Topics to Revisit</h3>
          <ul className="text-sm text-slate-600 space-y-1.5">{result.suggested_topics.map((s) => <li key={s}>• {s}</li>)}</ul>
        </div>
      )}
      <button onClick={() => setPhase('setup')} className="btn-secondary flex items-center gap-2 mx-auto">
        <RotateCcw size={16} /> Try Another Interview
      </button>
    </div>
  )
}
