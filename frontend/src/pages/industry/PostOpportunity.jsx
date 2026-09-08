import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import { PlusCircle, CheckCircle2 } from 'lucide-react'

export default function PostOpportunity() {
  const [kind, setKind] = useState('internship')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', location: '', mode: 'hybrid', duration: '3 months', stipend: '',
    experience_required: '0-1 years', salary: '', min_cgpa: 6.0, deadline: '', required_skills: [],
  })
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      const res = await api.get('/skills/skills/')
      setSkills(res.data)
      setLoading(false)
    })()
  }, [])

  const toggleSkill = (id) => {
    setForm((f) => ({
      ...f,
      required_skills: f.required_skills.includes(id) ? f.required_skills.filter((s) => s !== id) : [...f.required_skills, id],
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const endpoint = kind === 'internship' ? '/opportunities/industry/internships/' : '/opportunities/industry/jobs/'
      await api.post(endpoint, form)
      setSuccess(true)
      setTimeout(() => navigate(kind === 'internship' ? '/industry/internships' : '/industry/jobs'), 1200)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState />

  if (success) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center">
        <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="font-bold text-slate-800">Opportunity Posted!</h2>
        <p className="text-sm text-slate-500 mt-1">Students will now see this in their matched opportunities.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><PlusCircle size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Post a New Opportunity</h1></div>
        <p className="text-sm text-slate-500 mb-4">Reach students whose skill profiles match what you need.</p>
        <div className="flex gap-2">
          {['internship', 'job'].map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border capitalize ${kind === k ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Title</label>
          <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Description</label>
          <textarea rows={3} required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Location</label>
            <input required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Min. CGPA</label>
            <input type="number" step="0.1" value={form.min_cgpa} onChange={(e) => setForm((f) => ({ ...f, min_cgpa: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
          </div>
        </div>

        {kind === 'internship' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Mode</label>
              <select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
                <option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Duration</label>
              <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Stipend</label>
              <input placeholder="₹15,000/month" value={form.stipend} onChange={(e) => setForm((f) => ({ ...f, stipend: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Experience Required</label>
              <input value={form.experience_required} onChange={(e) => setForm((f) => ({ ...f, experience_required: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Salary</label>
              <input placeholder="₹6-10 LPA" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Application Deadline</label>
          <input type="date" required value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-2 block">Required Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button type="button" key={s.id} onClick={() => toggleSkill(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${form.required_skills.includes(s.id) ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Posting...' : `Post ${kind === 'internship' ? 'Internship' : 'Job'}`}
        </button>
      </form>
    </div>
  )
}
