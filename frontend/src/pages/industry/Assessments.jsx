import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { ClipboardList, Plus, Clock, Target, ListChecks, X } from 'lucide-react'

export default function IndustryAssessments() {
  const [loading, setLoading] = useState(true)
  const [assessments, setAssessments] = useState([])
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', assessment_type: 'questionnaire',
    duration_minutes: 30, passing_score: 50, max_attempts: 1,
  })
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    const res = await api.get('/skills/industry/assessments/')
    setAssessments(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/skills/industry/assessments/', form)
      setCreating(false)
      navigate(`/industry/assessments/${res.data.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (a) => {
    await api.patch(`/skills/industry/assessments/${a.id}/`, { active: !a.active })
    load()
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1"><ClipboardList size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Assessments</h1></div>
            <p className="text-sm text-slate-500">Create questionnaires or aptitude tests, then require them before students can apply to your postings.</p>
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={16} /> Create Assessment
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assessments yet" description="Create one to screen applicants before they apply." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {assessments.map((a) => (
            <button key={a.id} onClick={() => navigate(`/industry/assessments/${a.id}`)} className="card p-5 text-left hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-slate-800">{a.title}</h3>
                <span className={`badge ${a.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {a.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{a.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-3">
                <span className="badge bg-slate-100 text-slate-600 capitalize">{a.assessment_type}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{a.duration_minutes} min</span>
                <span className="flex items-center gap-1"><Target size={12} />Pass at {a.passing_score}%</span>
                <span className="flex items-center gap-1"><ListChecks size={12} />{a.question_count} questions</span>
              </div>
              {(a.linked_internships.length > 0 || a.linked_jobs.length > 0) && (
                <p className="text-xs text-slate-400 mt-2">
                  Required for: {[...a.linked_internships, ...a.linked_jobs].map((x) => x.title).join(', ')}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <span onClick={(e) => { e.stopPropagation(); toggleActive(a) }}
                  className="text-xs font-medium text-brand-600 hover:underline">
                  {a.active ? 'Deactivate' : 'Activate'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50" onClick={() => setCreating(false)}>
          <form onSubmit={create} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-slate-800">Create Assessment</h2>
              <button type="button" onClick={() => setCreating(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Title</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Type</label>
                <select value={form.assessment_type} onChange={(e) => setForm((f) => ({ ...f, assessment_type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
                  <option value="questionnaire">Questionnaire</option>
                  <option value="aptitude">Aptitude Test</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Duration (min)</label>
                <input type="number" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Passing Score (%)</label>
                <input type="number" value={form.passing_score} onChange={(e) => setForm((f) => ({ ...f, passing_score: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Max Attempts</label>
                <input type="number" min="1" value={form.max_attempts} onChange={(e) => setForm((f) => ({ ...f, max_attempts: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? 'Creating...' : 'Create & Add Questions'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
