import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import { ClipboardCheck, CheckCircle2, XCircle, ArrowLeft, Clock, Target, RotateCcw } from 'lucide-react'

export default function TakeCompanyAssessment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('loading') // loading | intro | blocked | taking | result
  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [blockedReason, setBlockedReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadIntro = async () => {
    setPhase('loading')
    try {
      const res = await api.get(`/skills/company-assessments/${id}/questions/`)
      setAssessment(res.data.assessment)
      setQuestions(res.data.questions)
      setAnswers({})
      setPhase('intro')
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.code === 'MAX_ATTEMPTS_REACHED') {
        setBlockedReason(err.response.data.detail)
        setPhase('blocked')
      } else {
        throw err
      }
    }
  }

  useEffect(() => { loadIntro() }, [id])

  const select = (qid, opt) => setAnswers((a) => ({ ...a, [qid]: opt }))

  const submit = async () => {
    setSubmitting(true)
    try {
      const payload = { answers: Object.entries(answers).map(([question_id, selected_option]) => ({ question_id: Number(question_id), selected_option })) }
      const res = await api.post(`/skills/company-assessments/${id}/submit/`, payload)
      setResult(res.data)
      setPhase('result')
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'loading') return <LoadingState />

  const backLink = <Link to="/student/company-assessments" className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4"><ArrowLeft size={14} /> Back to Company Assessments</Link>

  if (phase === 'blocked') {
    return (
      <div className="max-w-lg mx-auto">
        {backLink}
        <div className="card p-8 text-center">
          <XCircle size={36} className="text-rose-500 mx-auto mb-3" />
          <h2 className="font-bold text-slate-800 mb-1">No Attempts Remaining</h2>
          <p className="text-sm text-slate-500">{blockedReason}</p>
        </div>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        {backLink}
        <div className="card p-8 text-center">
          <ClipboardCheck size={40} className="text-brand-600 mx-auto mb-4" />
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">{assessment.company_name}</p>
          <h1 className="text-xl font-bold text-slate-800 mb-2">{assessment.title}</h1>
          <p className="text-slate-500 text-sm mb-6">{assessment.description}</p>
          <div className="flex justify-center gap-6 text-sm text-slate-500 mb-6">
            <span className="flex items-center gap-1.5"><Clock size={14} />{assessment.duration_minutes} min</span>
            <span className="flex items-center gap-1.5"><Target size={14} />Pass at {assessment.passing_score}%</span>
            <span>{questions.length} questions</span>
          </div>
          {assessment.student_status?.attempts_used > 0 && (
            <p className="text-xs text-slate-400 mb-4">
              Attempt {assessment.student_status.attempts_used + 1} of {assessment.max_attempts} ·
              Previous best: {assessment.student_status.best_percentage}%
            </p>
          )}
          <button onClick={() => setPhase('taking')} className="btn-primary">Start Assessment</button>
        </div>
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
            <p className="text-xs text-brand-600 font-semibold mb-1 capitalize">{q.category.replace('_', ' ')} · {q.marks} mark{q.marks !== 1 ? 's' : ''}</p>
            <p className="font-medium text-slate-800 mb-4">{idx + 1}. {q.text}</p>
            <div className="space-y-2">
              {['a', 'b', 'c', 'd'].filter((opt) => q[`option_${opt}`]).map((opt) => (
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
          disabled={answeredCount < questions.length || submitting}
          className="btn-primary w-full py-3"
        >
          {submitting ? 'Submitting...' : `Submit Assessment (${answeredCount}/${questions.length})`}
        </button>
      </div>
    )
  }

  // result
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {backLink}
      <div className="card p-8 text-center">
        {result.passed ? (
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
        ) : (
          <XCircle size={40} className="text-rose-500 mx-auto mb-3" />
        )}
        <h2 className="text-2xl font-bold text-slate-800">{result.percentage}%</h2>
        <p className="text-sm text-slate-500 mt-1">{result.scored_marks} / {result.total_marks} marks</p>
        <span className={`badge mt-3 inline-block ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {result.passed ? 'Passed' : 'Not Passed'}
        </span>
        {result.passed ? (
          <p className="text-sm text-slate-500 mt-4">
            You've met {result.company_name}'s requirement — you can now go back and apply.
          </p>
        ) : (
          <p className="text-sm text-slate-500 mt-4">
            You didn't reach the passing score this time.
          </p>
        )}
      </div>

      {Object.keys(result.category_breakdown || {}).length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(result.category_breakdown).map(([category, stats]) => {
              const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 capitalize">{category.replace('_', ' ')}</span>
                    <span className="font-semibold text-slate-800">{stats.correct}/{stats.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {!result.passed && (
          <button onClick={loadIntro} className="btn-secondary flex items-center gap-2">
            <RotateCcw size={16} /> Try Again
          </button>
        )}
        <button onClick={() => navigate('/student/company-assessments')} className="btn-primary">
          Back to Company Assessments
        </button>
      </div>
    </div>
  )
}
