import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import ScoreRing from '../../components/ScoreRing'
import { ClipboardCheck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

export default function Assessment() {
  const [phase, setPhase] = useState('intro') // intro | taking | result
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const start = async () => {
    setLoading(true)
    const res = await api.get('/skills/assessment/questions/')
    setQuestions(res.data)
    setAnswers({})
    setPhase('taking')
    setLoading(false)
  }

  const select = (qid, opt) => setAnswers((a) => ({ ...a, [qid]: opt }))

  const submit = async () => {
    setLoading(true)
    const payload = { answers: Object.entries(answers).map(([question_id, selected_option]) => ({ question_id: Number(question_id), selected_option })) }
    const res = await api.post('/skills/assessment/submit/', payload)
    setResult(res.data)
    setPhase('result')
    setLoading(false)
  }

  if (loading) return <LoadingState label="Please wait..." />

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto card p-8 text-center">
        <ClipboardCheck size={40} className="text-brand-600 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-800 mb-2">Skill Assessment</h1>
        <p className="text-slate-500 text-sm mb-6">
          20 randomly selected questions across technical skills (Programming, Data Structures, Databases,
          Web Development, Cloud, Machine Learning) and soft skills (Communication, Problem Solving,
          Leadership, Teamwork, Adaptability). Your results feed directly into your Skill Profile, Skill Gap
          Analysis and Career Recommendations.
        </p>
        <button onClick={start} className="btn-primary">Start Assessment</button>
      </div>
    )
  }

  if (phase === 'taking') {
    const answeredCount = Object.keys(answers).length
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="card p-4 flex items-center justify-between sticky top-0 z-10">
          <p className="text-sm font-medium text-slate-600">{answeredCount} / {questions.length} answered</p>
          <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-600" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
        </div>
        {questions.map((q, idx) => (
          <div key={q.id} className="card p-6">
            <p className="text-xs text-brand-600 font-semibold mb-1">{q.skill_name} · {q.difficulty}</p>
            <p className="font-medium text-slate-800 mb-4">{idx + 1}. {q.text}</p>
            <div className="space-y-2">
              {['a', 'b', 'c', 'd'].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 cursor-pointer text-sm transition-colors
                    ${answers[q.id] === opt ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <input type="radio" name={`q-${q.id}`} className="accent-brand-600"
                    checked={answers[q.id] === opt} onChange={() => select(q.id, opt)} />
                  {q[`option_${opt}`]}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={submit}
          disabled={answeredCount < questions.length}
          className="btn-primary w-full py-3"
        >
          Submit Assessment ({answeredCount}/{questions.length})
        </button>
      </div>
    )
  }

  // result
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-8 text-center">
        <ScoreRing score={result.overall_score} size={120} label="Overall Skill Score" color="#4f46e5" />
        <p className="text-sm text-slate-500 mt-3">{result.correct_answers} / {result.total_questions} correct</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-semibold text-emerald-700 flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} /> Strong Skills
          </h3>
          {result.strong_skills.length === 0 && <p className="text-sm text-slate-400">None identified yet — keep practicing!</p>}
          <div className="flex flex-wrap gap-2">
            {result.strong_skills.map((s) => <span key={s} className="badge bg-emerald-100 text-emerald-700">{s}</span>)}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-rose-700 flex items-center gap-2 mb-3">
            <XCircle size={18} /> Skills to Improve
          </h3>
          {result.weak_skills.length === 0 && <p className="text-sm text-slate-400">No major weak spots — great job!</p>}
          <div className="flex flex-wrap gap-2">
            {result.weak_skills.map((s) => <span key={s} className="badge bg-rose-100 text-rose-700">{s}</span>)}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(result.category_scores).map(([skill, score]) => (
            <div key={skill}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{skill}</span>
                <span className="font-semibold text-slate-800">{score}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600" style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setPhase('intro')} className="btn-secondary flex items-center gap-2 mx-auto">
        <RotateCcw size={16} /> Retake Assessment
      </button>
    </div>
  )
}
