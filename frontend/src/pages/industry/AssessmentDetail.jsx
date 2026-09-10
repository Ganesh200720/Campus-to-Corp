import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { ArrowLeft, Plus, Trash2, Users, CheckCircle2, XCircle } from 'lucide-react'

const CATEGORY_OPTIONS = [
  ['technical', 'Technical'], ['logical', 'Logical Reasoning'], ['quantitative', 'Quantitative Aptitude'],
  ['verbal', 'Verbal Reasoning'], ['numerical', 'Numerical Ability'], ['problem_solving', 'Problem Solving'],
]

const emptyQuestion = { question_type: 'mcq', category: 'technical', text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', marks: 1 }

export default function AssessmentDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState(null)
  const [tab, setTab] = useState('questions') // questions | results
  const [attempts, setAttempts] = useState(null)
  const [form, setForm] = useState(emptyQuestion)
  const [adding, setAdding] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await api.get(`/skills/industry/assessments/${id}/`)
    setAssessment(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const loadAttempts = async () => {
    const res = await api.get(`/skills/industry/assessments/${id}/attempts/`)
    setAttempts(res.data)
  }

  useEffect(() => { if (tab === 'results' && attempts === null) loadAttempts() }, [tab])

  const addQuestion = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post(`/skills/industry/assessments/${id}/questions/`, form)
      setForm(emptyQuestion)
      load()
    } finally {
      setAdding(false)
    }
  }

  const deleteQuestion = async (qid) => {
    await api.delete(`/skills/industry/assessments/${id}/questions/${qid}/`)
    load()
  }

  const toggleActive = async () => {
    await api.patch(`/skills/industry/assessments/${id}/`, { active: !assessment.active })
    load()
  }

  if (loading) return <LoadingState />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/industry/assessments" className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"><ArrowLeft size={14} /> Back to Assessments</Link>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{assessment.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{assessment.description}</p>
          </div>
          <button onClick={toggleActive} className={`badge shrink-0 ${assessment.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {assessment.active ? 'Active' : 'Inactive'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-3">
          <span className="badge bg-slate-100 text-slate-600 capitalize">{assessment.assessment_type}</span>
          <span>{assessment.duration_minutes} min</span>
          <span>Pass at {assessment.passing_score}%</span>
          <span>Max {assessment.max_attempts} attempt(s)</span>
          <span>{assessment.question_count} questions · {assessment.total_marks} marks total</span>
        </div>
        {(assessment.linked_internships.length > 0 || assessment.linked_jobs.length > 0) && (
          <p className="text-xs text-slate-500 mt-3">
            Required for: {[...assessment.linked_internships, ...assessment.linked_jobs].map((x) => x.title).join(', ')}
            {' '}— manage this from Post Opportunity / My Internships / My Jobs.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('questions')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border ${tab === 'questions' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>
          Questions ({assessment.question_count})
        </button>
        <button onClick={() => setTab('results')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-1.5 ${tab === 'results' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>
          <Users size={14} /> Student Results
        </button>
      </div>

      {tab === 'questions' ? (
        <>
          <div className="space-y-3">
            {assessment.questions?.map((q, idx) => (
              <div key={q.id} className="card p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-brand-600 font-semibold mb-1 capitalize">{q.category.replace('_', ' ')} · {q.marks} mark(s)</p>
                  <p className="text-sm font-medium text-slate-800">{idx + 1}. {q.text}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    {['a', 'b', 'c', 'd'].filter((o) => q[`option_${o}`]).map((o) => (
                      <span key={o} className={q.correct_option === o ? 'text-emerald-600 font-semibold' : ''}>
                        {o.toUpperCase()}. {q[`option_${o}`]} {q.correct_option === o && '✓'}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => deleteQuestion(q.id)} className="text-slate-300 hover:text-rose-500 shrink-0"><Trash2 size={16} /></button>
              </div>
            ))}
            {(!assessment.questions || assessment.questions.length === 0) && (
              <EmptyState title="No questions yet" description="Add at least one question below before activating this assessment." />
            )}
          </div>

          <form onSubmit={addQuestion} className="card p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Plus size={16} /> Add Question</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
                  {CATEGORY_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Marks</label>
                <input type="number" step="0.5" value={form.marks} onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Question Text</label>
              <textarea required rows={2} value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['a', 'b', 'c', 'd'].map((o) => (
                <input key={o} required placeholder={`Option ${o.toUpperCase()}`} value={form[`option_${o}`]}
                  onChange={(e) => setForm((f) => ({ ...f, [`option_${o}`]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Correct Option</label>
              <select value={form.correct_option} onChange={(e) => setForm((f) => ({ ...f, correct_option: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
                {['a', 'b', 'c', 'd'].map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
              </select>
            </div>
            <button type="submit" disabled={adding} className="btn-primary w-full py-2.5">{adding ? 'Adding...' : 'Add Question'}</button>
          </form>
        </>
      ) : (
        attempts === null ? <LoadingState /> : attempts.length === 0 ? (
          <EmptyState icon={Users} title="No attempts yet" description="Results will appear here once students take this assessment." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Attempt</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Result</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0">
                    <td className="p-4 font-medium text-slate-700">{a.student_name}</td>
                    <td className="p-4 text-slate-500">#{a.attempt_number}</td>
                    <td className="p-4 text-slate-700">{a.percentage}% ({a.scored_marks}/{a.total_marks})</td>
                    <td className="p-4">
                      {a.passed
                        ? <span className="badge bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Passed</span>
                        : <span className="badge bg-rose-100 text-rose-700 flex items-center gap-1 w-fit"><XCircle size={12} /> Failed</span>}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{new Date(a.started_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
