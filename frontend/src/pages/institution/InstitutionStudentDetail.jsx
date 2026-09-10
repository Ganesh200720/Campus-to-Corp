import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import {
  ArrowLeft, Mail, MapPin, GraduationCap, Award, ClipboardCheck, Briefcase,
  FolderKanban, BadgeCheck, TrendingUp,
} from 'lucide-react'

const STATUS_STYLES = {
  applied: 'bg-slate-100 text-slate-600',
  under_review: 'bg-sky-50 text-sky-600',
  shortlisted: 'bg-amber-50 text-amber-600',
  interview: 'bg-violet-50 text-violet-600',
  selected: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-rose-50 text-rose-600',
}

export default function InstitutionStudentDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/analytics/students/${id}/`)
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load this student — they may not belong to your institution.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState label="Loading student profile..." />

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/institution/students" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline">
          <ArrowLeft size={16} /> Back to directory
        </Link>
        <div className="card p-6 text-sm text-rose-600">{error}</div>
      </div>
    )
  }

  const readiness = data.placement_readiness

  return (
    <div className="space-y-6">
      <Link to="/institution/students" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={16} /> Back to directory
      </Link>

      <div className="card p-6 flex flex-wrap items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
          style={{ backgroundColor: data.avatar_color }}
        >
          {data.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-xl font-bold text-slate-800">{data.full_name}</h1>
          <p className="text-sm text-slate-500">{data.degree} · {data.branch} · Year {data.year} · CGPA {data.cgpa}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Mail size={13} /> {data.email}</span>
            {data.location && <span className="flex items-center gap-1.5"><MapPin size={13} /> {data.location}</span>}
            <span className="flex items-center gap-1.5"><GraduationCap size={13} /> {data.college}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-brand-600">{readiness.readiness_score}%</p>
          <p className="text-xs text-slate-500">Placement Readiness</p>
        </div>
      </div>

      {data.bio && <div className="card p-5 text-sm text-slate-600">{data.bio}</div>}

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Award} label="Avg. Skill Score" value={`${readiness.breakdown?.skill_compatibility ?? 0}%`} color="bg-violet-50 text-violet-600" />
        <StatCard icon={ClipboardCheck} label="Assessments Taken" value={data.assessments.length} color="bg-sky-50 text-sky-600" />
        <StatCard icon={Briefcase} label="Applications" value={data.applications.length} color="bg-amber-50 text-amber-600" />
        <StatCard icon={FolderKanban} label="Projects & Certs" value={data.projects.length + data.certifications.length} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Skill Scores</h3>
          {data.skills.length === 0 ? (
            <p className="text-sm text-slate-400">No skills recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {data.skills.map((s) => (
                <div key={s.skill}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{s.skill}</span>
                    <span className="font-medium">{s.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${s.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-600" />
            <h3 className="font-semibold text-slate-800">Placement Readiness Breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(readiness.breakdown || {}).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="capitalize">{key.replaceAll('_', ' ')}</span>
                  <span className="font-medium">{value}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
          {readiness.recommended_actions?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Recommended Focus Areas</p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {readiness.recommended_actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Internship & Job Applications</h3>
        {data.applications.length === 0 ? (
          <p className="text-sm text-slate-400">No applications yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.applications.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.title || 'Opportunity'}</p>
                  <p className="text-xs text-slate-500">{a.company} · {a.type === 'internship' ? 'Internship' : 'Job'} · Applied {new Date(a.applied_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status] || 'bg-slate-100 text-slate-600'}`}>
                  {a.status.replaceAll('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Projects</h3>
          {data.projects.length === 0 ? (
            <p className="text-sm text-slate-400">No projects added yet.</p>
          ) : (
            <div className="space-y-3">
              {data.projects.map((p, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-3">
                  <p className="text-sm font-medium text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.tech_stack}</p>
                  {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Certifications</h3>
          {data.certifications.length === 0 ? (
            <p className="text-sm text-slate-400">No certifications added yet.</p>
          ) : (
            <div className="space-y-3">
              {data.certifications.map((c, i) => (
                <div key={i} className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                  <BadgeCheck size={18} className={c.verified ? 'text-emerald-500' : 'text-slate-300'} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.issuer} · {new Date(c.date_earned).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
