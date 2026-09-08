import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { ListChecks } from 'lucide-react'

const STATUS_STEPS = ['applied', 'under_review', 'shortlisted', 'interview', 'selected']
const STATUS_LABEL = { applied: 'Applied', under_review: 'Under Review', shortlisted: 'Shortlisted', interview: 'Interview', selected: 'Selected', rejected: 'Rejected' }
const STATUS_COLOR = {
  applied: 'bg-slate-100 text-slate-600', under_review: 'bg-sky-100 text-sky-700', shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-violet-100 text-violet-700', selected: 'bg-emerald-100 text-emerald-700', rejected: 'bg-rose-100 text-rose-700',
}

export default function MyApplications() {
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState([])

  useEffect(() => {
    (async () => {
      const res = await api.get('/opportunities/my-applications/')
      setApps(res.data)
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><ListChecks size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">My Applications</h1></div>
        <p className="text-sm text-slate-500">Track the status of every internship and job you've applied to.</p>
      </div>

      {apps.length === 0 ? (
        <EmptyState icon={ListChecks} title="No applications yet" description="Browse Internships or Jobs to apply." />
      ) : (
        <div className="space-y-4">
          {apps.map((a) => {
            const rejected = a.status === 'rejected'
            const activeStepIdx = STATUS_STEPS.indexOf(a.status)
            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{a.internship_title || a.job_title}</h3>
                    <p className="text-sm text-slate-500">{a.company_name} · {a.internship ? 'Internship' : 'Job'}</p>
                  </div>
                  <span className={`badge ${STATUS_COLOR[a.status]} capitalize`}>{STATUS_LABEL[a.status]}</span>
                </div>
                {!rejected && (
                  <div className="flex items-center gap-1">
                    {STATUS_STEPS.map((s, idx) => (
                      <div key={s} className="flex items-center gap-1 flex-1">
                        <div className={`h-1.5 flex-1 rounded-full ${idx <= activeStepIdx ? 'bg-brand-600' : 'bg-slate-100'}`} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Applied {new Date(a.applied_at).toLocaleDateString()}</span>
                  <span>Match score: {Math.round(a.match_score)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
