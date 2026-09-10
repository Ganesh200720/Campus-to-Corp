import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import MatchBadge from '../../components/MatchBadge'
import { Compass, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react'

const ROADMAP = {
  'Full Stack Developer': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases', 'Cloud', 'Projects', 'Internship', 'Placement'],
  'Frontend Developer': ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Testing', 'Projects', 'Internship', 'Placement'],
  'Backend Developer': ['Python', 'SQL', 'APIs', 'System Design', 'Cloud', 'Projects', 'Internship', 'Placement'],
  'Data Scientist': ['Python', 'Statistics', 'SQL', 'Machine Learning', 'Projects', 'Internship', 'Placement'],
  'Cloud Engineer': ['Networking', 'Linux', 'AWS', 'Docker', 'CI/CD', 'Projects', 'Internship', 'Placement'],
  'ML Engineer': ['Python', 'Statistics', 'Machine Learning', 'MLOps', 'Projects', 'Internship', 'Placement'],
  'DevOps Engineer': ['Linux', 'Docker', 'Cloud', 'CI/CD', 'Monitoring', 'Projects', 'Internship', 'Placement'],
  'Mobile App Developer': ['JavaScript', 'React', 'Mobile UI', 'APIs', 'Projects', 'Internship', 'Placement'],
}

export default function CareerGuidance() {
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    (async () => {
      const res = await api.get('/skills/recommend-roles/')
      setRecommendations(res.data)
      setSelected(res.data[0]?.role || null)
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState label="Mapping your career path..." />

  const active = recommendations.find((r) => r.role === selected)
  const roadmap = ROADMAP[selected] || []

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><Compass size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Career Guidance</h1></div>
        <p className="text-sm text-slate-500">Based on your current skill profile, here's how you match against real industry roles.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-1 space-y-3">
          {recommendations.map((r) => (
            <button
              key={r.role}
              onClick={() => setSelected(r.role)}
              className={`w-full text-left card p-4 transition-colors ${selected === r.role ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800 text-sm">{r.role}</span>
                <MatchBadge percent={r.match_percent} />
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{r.explanation}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-5">
          {active && (
            <>
              <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
                <div className="flex items-center gap-2 mb-2"><Sparkles size={18} /><h2 className="font-semibold">Why {active.role} — {Math.round(active.match_percent)}% Match?</h2></div>
                <p className="text-sm text-brand-100">{active.explanation}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-brand-200 mb-2 font-semibold uppercase tracking-wide">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {active.matched_skills.length === 0 && <span className="text-xs text-brand-200">None yet</span>}
                      {active.matched_skills.map((s) => (
                        <span key={s} className="badge bg-white/20 text-white flex items-center gap-1"><CheckCircle2 size={12} />{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-brand-200 mb-2 font-semibold uppercase tracking-wide">Skill Gaps</p>
                    <div className="flex flex-wrap gap-1.5">
                      {active.skill_gaps.length === 0 && <span className="text-xs text-brand-200">None — you're fully matched!</span>}
                      {active.skill_gaps.map((s) => (
                        <span key={s} className="badge bg-white/10 text-white flex items-center gap-1"><ArrowUpRight size={12} />{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Recommended Career Roadmap</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {roadmap.map((step, idx) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">{step}</span>
                      {idx < roadmap.length - 1 && <span className="text-slate-300">→</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Ready to act on this?</h3>
                  <p className="text-xs text-slate-400">Explore matched internships or close your skill gaps in the Learning Hub.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to="/student/internships" className="btn-secondary text-sm">Internships</Link>
                  <Link to="/student/learning-hub" className="btn-primary text-sm">Learning Hub</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
