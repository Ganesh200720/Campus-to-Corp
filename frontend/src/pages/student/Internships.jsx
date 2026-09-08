import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import MatchBadge from '../../components/MatchBadge'
import { Search, MapPin, Clock, IndianRupee, Briefcase, X, CheckCircle2 } from 'lucide-react'

export default function Internships() {
  const [loading, setLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('')
  const [selected, setSelected] = useState(null)
  const [applying, setApplying] = useState(false)
  const [appliedIds, setAppliedIds] = useState(new Set())

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort: 'match' })
    if (search) params.set('search', search)
    if (mode) params.set('mode', mode)
    const res = await api.get(`/opportunities/internships/?${params.toString()}`)
    setInternships(res.data)
    setLoading(false)
  }

  useEffect(() => {
    (async () => {
      await load()
      const apps = await api.get('/opportunities/my-applications/')
      setAppliedIds(new Set(apps.data.filter((a) => a.internship).map((a) => a.internship)))
    })()
  }, [])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search, mode])

  const openDetail = async (id) => {
    const res = await api.get(`/opportunities/internships/${id}/`)
    setSelected(res.data)
  }

  const apply = async (id) => {
    setApplying(true)
    try {
      await api.post('/opportunities/apply/', { internship_id: id })
      setAppliedIds((s) => new Set([...s, id]))
      setSelected(null)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><Briefcase size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Internship Marketplace</h1></div>
        <p className="text-sm text-slate-500 mb-4">Ranked by how well they match your current skill profile.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or company..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
          </div>
          <select value={mode} onChange={(e) => setMode(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
            <option value="">All modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingState /> : internships.length === 0 ? (
        <EmptyState icon={Briefcase} title="No internships found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {internships.map((i) => (
            <button key={i.id} onClick={() => openDetail(i.id)} className="card p-5 text-left hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-slate-800">{i.title}</h3>
                  <p className="text-sm text-slate-500">{i.company_name}</p>
                </div>
                <MatchBadge percent={i.match_percent} />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-3">
                <span className="flex items-center gap-1"><MapPin size={12} />{i.location} · {i.mode}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{i.duration}</span>
                <span className="flex items-center gap-1"><IndianRupee size={12} />{i.stipend}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {i.required_skills_detail.slice(0, 4).map((s) => (
                  <span key={s.id} className="badge bg-slate-100 text-slate-600">{s.name}</span>
                ))}
              </div>
              {appliedIds.has(i.id) && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-3"><CheckCircle2 size={12} /> Applied</p>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{selected.title}</h2>
                <p className="text-sm text-slate-500">{selected.company_name} · {selected.location}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <MatchBadge percent={selected.match_percent} />
            <p className="text-sm text-slate-600 mt-4">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm mt-4">
              <div><p className="text-xs text-slate-400">Mode</p><p className="font-medium text-slate-700 capitalize">{selected.mode}</p></div>
              <div><p className="text-xs text-slate-400">Duration</p><p className="font-medium text-slate-700">{selected.duration}</p></div>
              <div><p className="text-xs text-slate-400">Stipend</p><p className="font-medium text-slate-700">{selected.stipend}</p></div>
              <div><p className="text-xs text-slate-400">Min. CGPA</p><p className="font-medium text-slate-700">{selected.min_cgpa}</p></div>
              <div><p className="text-xs text-slate-400">Deadline</p><p className="font-medium text-slate-700">{selected.deadline}</p></div>
            </div>

            {selected.match_explanation && (
              <div className="bg-brand-50 rounded-xl p-4 mt-4">
                <p className="text-xs font-semibold text-brand-700 mb-2">Why this internship is recommended</p>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {selected.match_explanation.matched_skills.map((s) => <span key={s} className="badge bg-emerald-100 text-emerald-700">{s} ✓</span>)}
                  {selected.match_explanation.skill_gaps.map((s) => <span key={s} className="badge bg-amber-100 text-amber-700">{s} △</span>)}
                </div>
                <p className="text-xs text-slate-500 mt-1">CGPA eligible: {selected.match_explanation.cgpa_eligible ? 'Yes' : 'No'}</p>
              </div>
            )}

            <button
              disabled={appliedIds.has(selected.id) || applying}
              onClick={() => apply(selected.id)}
              className="btn-primary w-full mt-5"
            >
              {appliedIds.has(selected.id) ? 'Already Applied' : applying ? 'Applying...' : 'Apply Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
