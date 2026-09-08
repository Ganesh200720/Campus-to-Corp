import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { ListChecks } from 'lucide-react'

const STATUSES = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected']
const STATUS_COLOR = {
  applied: 'bg-slate-100 text-slate-600', under_review: 'bg-sky-100 text-sky-700', shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-violet-100 text-violet-700', selected: 'bg-emerald-100 text-emerald-700', rejected: 'bg-rose-100 text-rose-700',
}

export default function IndustryApplications() {
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState([])
  const [filter, setFilter] = useState('')

  const load = async () => {
    const res = await api.get('/opportunities/industry/applications/')
    setApps(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    setApps((a) => a.map((x) => x.id === id ? { ...x, status } : x))
    await api.patch(`/opportunities/applications/${id}/status/`, { status })
  }

  if (loading) return <LoadingState />

  const filtered = filter ? apps.filter((a) => a.status === filter) : apps

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><ListChecks size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Applications</h1></div>
        <p className="text-sm text-slate-500 mb-4">Review candidates and move them through your hiring pipeline.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === '' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>All</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${filter === s ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>{s.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="No applications" description="No candidates match this filter yet." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((a) => (
            <div key={a.id} className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800 text-sm">{a.student_name}</p>
                <p className="text-xs text-slate-400">{a.internship_title || a.job_title} · Applied {new Date(a.applied_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="badge bg-slate-100 text-slate-600">{Math.round(a.match_score)}% match</span>
                <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}
                  className={`text-xs font-semibold rounded-full px-3 py-1.5 border-none focus:outline-none focus:ring-2 focus:ring-brand-200 capitalize ${STATUS_COLOR[a.status]}`}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
