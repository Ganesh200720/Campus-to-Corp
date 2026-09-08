import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import ScoreRing from '../../components/ScoreRing'
import { FolderKanban, Award, Trophy, Plus, ExternalLink, ShieldCheck, X } from 'lucide-react'

function AddModal({ title, fields, onClose, onSubmit }) {
  const [form, setForm] = useState({})
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-slate-600 mb-1 block">{f.label}</label>
              <input
                type={f.type || 'text'} required={f.required}
                onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          ))}
          <button type="submit" className="btn-primary w-full mt-2">Add</button>
        </form>
      </div>
    </div>
  )
}

export default function Portfolio() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [modal, setModal] = useState(null)

  const load = async () => {
    const res = await api.get('/portfolio/me/')
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addProject = async (form) => {
    await api.post('/portfolio/projects/', { title: form.title, tech_stack: form.tech_stack, link: form.link || '', description: form.description || '' })
    setModal(null); load()
  }
  const addCert = async (form) => {
    await api.post('/portfolio/certifications/', { title: form.title, issuer: form.issuer, date_earned: form.date_earned })
    setModal(null); load()
  }
  const addAchievement = async (form) => {
    await api.post('/portfolio/achievements/', { title: form.title, description: form.description || '', date_earned: form.date_earned })
    setModal(null); load()
  }

  if (loading) return <LoadingState />

  const readiness = data.placement_readiness.readiness_score
  const ready = readiness >= 75

  return (
    <div className="space-y-6">
      <div className="card p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-3xl font-bold shrink-0">
          {data.profile.full_name?.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl font-bold text-slate-800">{data.profile.full_name}</h1>
          <p className="text-sm text-slate-500">{data.profile.degree} · {data.profile.branch} · {data.profile.college}</p>
          <p className="text-sm text-slate-500 mt-1">{data.profile.bio}</p>
          <span className={`badge mt-2 inline-flex items-center gap-1 ${ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            <ShieldCheck size={12} /> {ready ? 'Placement Ready' : 'Building Placement Readiness'}
          </span>
        </div>
        <ScoreRing score={readiness} label="Placement Readiness" color="#4f46e5" />
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Verified Skills</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {Object.entries(data.skills).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([skill, score]) => (
            <div key={skill}>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{skill}</span><span className="font-semibold text-slate-800">{Math.round(score)}%</span></div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${score}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><FolderKanban size={18} /> Projects</h2>
          <button onClick={() => setModal('project')} className="btn-secondary text-xs flex items-center gap-1"><Plus size={14} /> Add</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {data.projects.map((p) => (
            <div key={p.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-800 text-sm">{p.title}</h3>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-brand-600"><ExternalLink size={14} /></a>}
              </div>
              <p className="text-xs text-slate-400 mt-1">{p.tech_stack}</p>
              <p className="text-xs text-slate-500 mt-2">{p.description}</p>
            </div>
          ))}
          {data.projects.length === 0 && <p className="text-sm text-slate-400">No projects added yet.</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Award size={18} /> Certifications</h2>
            <button onClick={() => setModal('cert')} className="btn-secondary text-xs flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-2">
            {data.certifications.map((c) => (
              <div key={c.id} className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <p className="text-sm font-medium text-slate-700">{c.title}</p>
                <p className="text-xs text-slate-400">{c.issuer} · {c.date_earned}</p>
              </div>
            ))}
            {data.certifications.length === 0 && <p className="text-sm text-slate-400">No certifications added yet.</p>}
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Trophy size={18} /> Achievements</h2>
            <button onClick={() => setModal('achievement')} className="btn-secondary text-xs flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-2">
            {data.achievements.map((a) => (
              <div key={a.id} className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <p className="text-sm font-medium text-slate-700">{a.title}</p>
                <p className="text-xs text-slate-400">{a.description}</p>
              </div>
            ))}
            {data.achievements.length === 0 && <p className="text-sm text-slate-400">No achievements added yet.</p>}
          </div>
        </div>
      </div>

      {modal === 'project' && (
        <AddModal title="Add Project" onClose={() => setModal(null)} onSubmit={addProject}
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'tech_stack', label: 'Tech Stack' },
            { name: 'link', label: 'Link (optional)' },
            { name: 'description', label: 'Description' },
          ]} />
      )}
      {modal === 'cert' && (
        <AddModal title="Add Certification" onClose={() => setModal(null)} onSubmit={addCert}
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'issuer', label: 'Issuer', required: true },
            { name: 'date_earned', label: 'Date Earned', type: 'date', required: true },
          ]} />
      )}
      {modal === 'achievement' && (
        <AddModal title="Add Achievement" onClose={() => setModal(null)} onSubmit={addAchievement}
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'description', label: 'Description' },
            { name: 'date_earned', label: 'Date Earned', type: 'date', required: true },
          ]} />
      )}
    </div>
  )
}
