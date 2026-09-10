import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { BookOpen, GraduationCap, Users, Award } from 'lucide-react'

const TYPE_ICON = { course: BookOpen, certification: Award, workshop: GraduationCap, mentorship: Users }
const TYPE_LABEL = { course: 'Course', certification: 'Certification', workshop: 'Workshop', mentorship: 'Mentorship' }

export default function LearningHub() {
  const [loading, setLoading] = useState(true)
  const [personalized, setPersonalized] = useState([])
  const [all, setAll] = useState([])
  const [tab, setTab] = useState('personalized')

  useEffect(() => {
    (async () => {
      const [p, a] = await Promise.all([
        api.get('/opportunities/learning-programs/?personalized=1'),
        api.get('/opportunities/learning-programs/'),
      ])
      setPersonalized(p.data)
      setAll(a.data)
      setLoading(false)
    })()
  }, [])

  if (loading) return <LoadingState label="Curating your learning path..." />

  const list = tab === 'personalized' ? personalized : all

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><BookOpen size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Learning Hub</h1></div>
        <p className="text-sm text-slate-500 mb-4">Courses, certifications, workshops and mentorships — connected directly to your skill gaps.</p>
        <div className="flex gap-2">
          <button onClick={() => setTab('personalized')} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${tab === 'personalized' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>Recommended for You</button>
          <button onClick={() => setTab('all')} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${tab === 'all' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>Browse All</button>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nothing here yet" description="Complete the Skill Assessment to unlock personalized recommendations." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((p) => {
            const Icon = TYPE_ICON[p.program_type] || BookOpen
            return (
              <div key={p.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><Icon size={18} /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 text-sm">{p.title}</h3>
                      <span className="badge bg-slate-100 text-slate-600">{TYPE_LABEL[p.program_type]}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{p.provider} · {p.duration}</p>
                    {p.reason && <p className="text-xs text-brand-600 mt-2 bg-brand-50 rounded-lg px-2.5 py-1.5">{p.reason}</p>}
                    {p.description && !p.reason && <p className="text-xs text-slate-500 mt-2">{p.description}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
