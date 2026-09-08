import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { BarChart3, AlertTriangle } from 'lucide-react'

export default function SkillAnalysis() {
  const [myScores, setMyScores] = useState([])
  const [roles, setRoles] = useState([])
  const [role, setRole] = useState('')
  const [gap, setGap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [scores, roleList] = await Promise.all([
        api.get('/skills/my-scores/'),
        api.get('/skills/roles/'),
      ])
      setMyScores(scores.data)
      setRoles(roleList.data)
      const defaultRole = roleList.data[0]
      setRole(defaultRole)
      if (defaultRole) {
        const g = await api.get(`/skills/gap/${encodeURIComponent(defaultRole)}/`)
        setGap(g.data)
      }
      setLoading(false)
    })()
  }, [])

  const changeRole = async (r) => {
    setRole(r)
    setLoading(true)
    const g = await api.get(`/skills/gap/${encodeURIComponent(r)}/`)
    setGap(g.data)
    setLoading(false)
  }

  if (loading && !gap) return <LoadingState label="Analyzing your skills..." />

  if (myScores.length === 0) {
    return (
      <EmptyState icon={BarChart3} title="No skill data yet"
        description="Take the Skill Assessment first to generate your skill profile and gap analysis." />
    )
  }

  const statusColor = { Strong: 'bg-emerald-500', 'Minor Gap': 'bg-amber-500', 'Major Gap': 'bg-rose-500' }
  const statusBadge = { Strong: 'bg-emerald-100 text-emerald-700', 'Minor Gap': 'bg-amber-100 text-amber-700', 'Major Gap': 'bg-rose-100 text-rose-700' }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Skill Gap Analysis</h1>
        <p className="text-sm text-slate-500 mb-4">Your current skills vs. industry-required skills for a target role.</p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => changeRole(r)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${role === r ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {gap && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Target Role: {gap.role}</h2>
          <div className="space-y-5 mt-4">
            {gap.gap_analysis.map((g) => (
              <div key={g.skill}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{g.skill}</span>
                  <span className={`badge ${statusBadge[g.status]}`}>{g.status}</span>
                </div>
                <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="absolute h-full bg-slate-300" style={{ width: `${g.required}%` }} />
                  <div className={`absolute h-full ${statusColor[g.status]}`} style={{ width: `${g.current}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Current: {g.current}%</span>
                  <span>Required: {g.required}%</span>
                </div>
              </div>
            ))}
          </div>
          {gap.gap_analysis.some((g) => g.status === 'Major Gap') && (
            <div className="mt-5 flex items-start gap-2 bg-amber-50 text-amber-800 text-sm rounded-xl p-3">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              Focus on closing the "Major Gap" skills above — check the Learning Hub for recommended programs.
            </div>
          )}
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">All Skills</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {myScores.sort((a, b) => b.score - a.score).map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{s.skill_name} <span className="text-xs text-slate-400">({s.category})</span></span>
                <span className="font-semibold text-slate-800">{Math.round(s.score)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${s.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
