import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ScoreRing from '../../components/ScoreRing'
import LoadingState from '../../components/LoadingState'
import MatchBadge from '../../components/MatchBadge'
import {
  CheckCircle2, Circle, ArrowRight, Briefcase, BookOpen, TrendingUp, Sparkles,
} from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [readiness, setReadiness] = useState(null)
  const [roles, setRoles] = useState([])
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [learning, setLearning] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => {
    (async () => {
      const [r, roleRec, intern, apps, learn, hist] = await Promise.all([
        api.get('/skills/placement-readiness/'),
        api.get('/skills/recommend-roles/'),
        api.get('/opportunities/internships/?sort=match'),
        api.get('/opportunities/my-applications/'),
        api.get('/opportunities/learning-programs/?personalized=1'),
        api.get('/skills/assessment/history/'),
      ])
      setReadiness(r.data)
      setRoles(roleRec.data.slice(0, 3))
      setInternships(intern.data.slice(0, 3))
      setApplications(apps.data.slice(0, 3))
      setLearning(learn.data.slice(0, 3))
      setHistory(hist.data)
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState label="Building your dashboard..." />

  const profile = user.profile
  const assessmentDone = history.length > 0
  const journey = [
    { label: 'Skill Assessment', done: assessmentDone },
    { label: 'Skill Analysis', done: assessmentDone },
    { label: 'Skill Development', done: false, inProgress: true },
    { label: 'Internship Application', done: applications.length > 0 },
    { label: `Placement — ${Math.round(readiness.readiness_score)}% Ready`, done: readiness.readiness_score >= 75 },
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Welcome, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile?.degree} · {profile?.branch} · Year {profile?.year} · {profile?.college}
          </p>
          <div className="mt-3 w-full max-w-xs">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Profile completion</span><span>{profile?.profile_completion}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600" style={{ width: `${profile?.profile_completion}%` }} />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <ScoreRing score={readiness.readiness_score} label="Placement Readiness" color="#4f46e5" />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Your SkillBridge Journey</h2>
        <div className="flex flex-wrap gap-3">
          {journey.map((j) => (
            <div key={j.label} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border
              ${j.done ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                j.inProgress ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              {j.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              {j.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Skill Compatibility</h3>
          <p className="text-2xl font-bold text-slate-800">{readiness.breakdown.skill_compatibility}%</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Assessment Performance</h3>
          <p className="text-2xl font-bold text-slate-800">{readiness.breakdown.assessment_performance}%</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Soft Skills</h3>
          <p className="text-2xl font-bold text-slate-800">{readiness.breakdown.soft_skills}%</p>
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="flex items-center gap-2 mb-2"><Sparkles size={18} /><h2 className="font-semibold">SkillBridge Intelligence — Why {Math.round(readiness.readiness_score)}%?</h2></div>
        <p className="text-sm text-brand-100 mb-3">Your readiness score blends skill compatibility, assessment performance, projects, certifications, internship experience and soft skills.</p>
        <ul className="text-sm text-brand-50 list-disc list-inside space-y-1">
          {readiness.recommended_actions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={16} /> Career Recommendations</h3>
            <Link to="/student/career-guidance" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {roles.map((r) => (
              <div key={r.role} className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5">
                <span className="text-sm font-medium text-slate-700">{r.role}</span>
                <MatchBadge percent={r.match_percent} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Briefcase size={16} /> Recommended Internships</h3>
            <Link to="/student/internships" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {internships.map((i) => (
              <div key={i.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{i.title}</p>
                  <p className="text-xs text-slate-400">{i.company_name}</p>
                </div>
                <MatchBadge percent={i.match_percent} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><BookOpen size={16} /> Recommended Learning</h3>
            <Link to="/student/learning-hub" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {learning.length === 0 && <p className="text-sm text-slate-400">Complete an assessment to get personalized picks.</p>}
            {learning.map((l) => (
              <div key={l.id} className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <p className="text-sm font-medium text-slate-700">{l.title}</p>
                <p className="text-xs text-slate-400">{l.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Recent Applications</h3>
            <Link to="/student/applications" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {applications.length === 0 && <p className="text-sm text-slate-400">No applications yet — explore internships to get started.</p>}
            {applications.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{a.internship_title || a.job_title}</p>
                  <p className="text-xs text-slate-400">{a.company_name}</p>
                </div>
                <span className="badge bg-slate-200 text-slate-600 capitalize">{a.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
