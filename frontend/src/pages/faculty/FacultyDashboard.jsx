import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import { Presentation, Users, BookOpen, Award, ArrowRight, Sparkles } from 'lucide-react'

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [programs, setPrograms] = useState([])
  const [demand, setDemand] = useState([])

  useEffect(() => {
    (async () => {
      const [p, d] = await Promise.all([
        api.get('/opportunities/learning-programs/'),
        api.get('/skills/demand/'),
      ])
      setPrograms(p.data)
      setDemand(d.data.slice(0, 5))
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState label="Loading faculty dashboard..." />

  const mentorships = programs.filter((p) => p.program_type === 'mentorship')
  const workshops = programs.filter((p) => p.program_type === 'workshop')

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-800">Welcome, {user.profile?.full_name}</h1>
        <p className="text-sm text-slate-500">{user.profile?.designation} · {user.profile?.department} · {user.profile?.college}</p>
        {user.profile?.research_interest && <p className="text-xs text-slate-400 mt-1">Research interest: {user.profile.research_interest}</p>}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard icon={Presentation} label="Workshops Available" value={workshops.length} color="bg-brand-50 text-brand-600" />
        <StatCard icon={Users} label="Industry Mentorships" value={mentorships.length} color="bg-amber-50 text-amber-600" />
        <StatCard icon={BookOpen} label="Total Learning Programs" value={programs.length} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="flex items-center gap-2 mb-2"><Sparkles size={18} /><h2 className="font-semibold">SkillBridge Intelligence — Industry Skill Demand</h2></div>
        <p className="text-sm text-brand-100 mb-3">These are the skills industry partners are currently hiring for most — useful context for curriculum and student guidance.</p>
        <div className="grid md:grid-cols-5 gap-3">
          {demand.map((d) => (
            <div key={d.skill} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{d.demand_percent}%</p>
              <p className="text-xs text-brand-100">{d.skill}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Award size={18} /> Faculty Development & Collaboration</h3>
          <Link to="/faculty/opportunities" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        <p className="text-sm text-slate-500 mb-3">Explore industry mentorship programs, workshops and guest-lecture opportunities available for faculty engagement, plus consultancy and research collaboration channels with industry partners.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {mentorships.slice(0, 4).map((m) => (
            <div key={m.id} className="bg-slate-50 rounded-xl px-3.5 py-2.5">
              <p className="text-sm font-medium text-slate-700">{m.title}</p>
              <p className="text-xs text-slate-400">{m.provider}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
