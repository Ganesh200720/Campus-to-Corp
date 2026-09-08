import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import { Briefcase, FileText, ListChecks, Users, ArrowRight, TrendingUp } from 'lucide-react'

export default function IndustryDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [demand, setDemand] = useState([])

  useEffect(() => {
    (async () => {
      const [i, j, a, d] = await Promise.all([
        api.get('/opportunities/industry/internships/'),
        api.get('/opportunities/industry/jobs/'),
        api.get('/opportunities/industry/applications/'),
        api.get('/skills/demand/'),
      ])
      setInternships(i.data); setJobs(j.data); setApplications(a.data); setDemand(d.data.slice(0, 6))
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState label="Loading your dashboard..." />

  const funnel = ['applied', 'under_review', 'shortlisted', 'interview', 'selected'].map((s) => ({
    status: s, count: applications.filter((a) => a.status === s).length,
  }))

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-800">Welcome, {user.profile?.company_name}</h1>
        <p className="text-sm text-slate-500">{user.profile?.industry_type} · {user.profile?.location}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Internships" value={internships.length} color="bg-brand-50 text-brand-600" />
        <StatCard icon={FileText} label="Active Jobs" value={jobs.length} color="bg-sky-50 text-sky-600" />
        <StatCard icon={ListChecks} label="Total Applications" value={applications.length} color="bg-amber-50 text-amber-600" />
        <StatCard icon={Users} label="Shortlisted" value={applications.filter((a) => ['shortlisted', 'interview', 'selected'].includes(a.status)).length} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Application Funnel</h3>
          <div className="space-y-3">
            {funnel.map((f) => (
              <div key={f.status}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600 capitalize">{f.status.replace('_', ' ')}</span><span className="font-semibold text-slate-800">{f.count}</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600" style={{ width: `${applications.length ? (f.count / applications.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-brand-600" /><h3 className="font-semibold text-slate-800">Top Skills You're Hiring For</h3></div>
          <div className="space-y-3">
            {demand.map((d) => (
              <div key={d.skill}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{d.skill}</span><span className="font-semibold text-slate-800">{d.demand_percent}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-sky-500" style={{ width: `${d.demand_percent}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Recent Applications</h3>
          <Link to="/industry/applications" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="space-y-2">
          {applications.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-700">{a.student_name}</p>
                <p className="text-xs text-slate-400">{a.internship_title || a.job_title}</p>
              </div>
              <span className="badge bg-slate-200 text-slate-600 capitalize">{a.status.replace('_', ' ')}</span>
            </div>
          ))}
          {applications.length === 0 && <p className="text-sm text-slate-400">No applications yet.</p>}
        </div>
      </div>
    </div>
  )
}
