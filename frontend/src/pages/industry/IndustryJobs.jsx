import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { FileText, MapPin, IndianRupee, Users, PlusCircle } from 'lucide-react'

export default function IndustryJobs() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    (async () => {
      const res = await api.get('/opportunities/industry/jobs/')
      setJobs(res.data)
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="card p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><FileText size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">My Jobs</h1></div>
          <p className="text-sm text-slate-500">Full-time postings you've created.</p>
        </div>
        <Link to="/industry/post" className="btn-primary flex items-center gap-2 text-sm"><PlusCircle size={16} /> Post New</Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={FileText} title="No jobs posted yet" description="Post your first job to start receiving matched candidates." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <div key={j.id} className="card p-5">
              <h3 className="font-semibold text-slate-800">{j.title}</h3>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1"><MapPin size={12} />{j.location}</span>
                <span>{j.experience_required}</span>
                <span className="flex items-center gap-1"><IndianRupee size={12} />{j.salary}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {j.required_skills_detail.map((s) => <span key={s.id} className="badge bg-slate-100 text-slate-600">{s.name}</span>)}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400">Deadline: {j.deadline}</span>
                <Link to={`/industry/candidates?job_id=${j.id}`} className="text-xs text-brand-600 font-medium flex items-center gap-1"><Users size={14} /> View Candidates</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
