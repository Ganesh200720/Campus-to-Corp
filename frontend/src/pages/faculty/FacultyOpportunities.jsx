import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { Presentation, Users, GraduationCap, Handshake } from 'lucide-react'

export default function FacultyOpportunities() {
  const [loading, setLoading] = useState(true)
  const [programs, setPrograms] = useState([])
  const [tab, setTab] = useState('workshop')

  useEffect(() => {
    (async () => {
      const res = await api.get('/opportunities/learning-programs/')
      setPrograms(res.data)
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState />

  const filtered = programs.filter((p) => p.program_type === tab)

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><Presentation size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Faculty Opportunities</h1></div>
        <p className="text-sm text-slate-500 mb-4">Industry-driven engagement opportunities for faculty and academicians.</p>
        <div className="flex gap-2">
          <button onClick={() => setTab('workshop')} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${tab === 'workshop' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}><GraduationCap size={14} /> Workshops & FDPs</button>
          <button onClick={() => setTab('mentorship')} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${tab === 'mentorship' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}><Users size={14} /> Industry Mentorship</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Presentation} title="Nothing here yet" description="Check back soon for new opportunities." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card p-5">
              <h3 className="font-semibold text-slate-800 text-sm">{p.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{p.provider} · {p.duration}</p>
              <p className="text-sm text-slate-500 mt-2">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Handshake size={18} /></div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Research Collaboration & Consultancy</h3>
          <p className="text-sm text-slate-500 mt-1">Industry partners on SkillBridge are actively looking for faculty collaboration on applied research, live projects and technical consultancy. Reach out to Institution Admin to formalise an MoU with a partner company.</p>
        </div>
      </div>
    </div>
  )
}
