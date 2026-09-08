import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import MatchBadge from '../../components/MatchBadge'
import { Users, GraduationCap, Sparkles } from 'lucide-react'

export default function CandidateMatching() {
  const [searchParams] = useSearchParams()
  const [internships, setInternships] = useState([])
  const [jobs, setJobs] = useState([])
  const [selection, setSelection] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    (async () => {
      const [i, j] = await Promise.all([
        api.get('/opportunities/industry/internships/'),
        api.get('/opportunities/industry/jobs/'),
      ])
      setInternships(i.data)
      setJobs(j.data)
      const preselectInternship = searchParams.get('internship_id')
      const preselectJob = searchParams.get('job_id')
      if (preselectInternship) setSelection(`internship:${preselectInternship}`)
      else if (preselectJob) setSelection(`job:${preselectJob}`)
      else if (i.data.length) setSelection(`internship:${i.data[0].id}`)
      else if (j.data.length) setSelection(`job:${j.data[0].id}`)
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (!selection) return
    (async () => {
      setFetching(true)
      const [type, id] = selection.split(':')
      const param = type === 'internship' ? `internship_id=${id}` : `job_id=${id}`
      const res = await api.get(`/opportunities/candidate-matches/?${param}`)
      setCandidates(res.data)
      setFetching(false)
    })()
  }, [selection])

  if (loading) return <LoadingState />

  const allOptions = [
    ...internships.map((i) => ({ value: `internship:${i.id}`, label: `${i.title} (Internship)` })),
    ...jobs.map((j) => ({ value: `job:${j.id}`, label: `${j.title} (Job)` })),
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><Users size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Candidate Matching</h1></div>
        <p className="text-sm text-slate-500 mb-4">See ranked, explainable candidate matches for any posting — two-way intelligence in action.</p>
        {allOptions.length === 0 ? (
          <p className="text-sm text-slate-400">Post an internship or job first to see matched candidates.</p>
        ) : (
          <select value={selection} onChange={(e) => setSelection(e.target.value)}
            className="w-full md:w-96 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
            {allOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </div>

      {fetching ? <LoadingState label="Ranking candidates..." /> : candidates.length === 0 ? (
        <EmptyState icon={Users} title="No candidates found" />
      ) : (
        <div className="space-y-4">
          {candidates.map((c, idx) => (
            <div key={c.student_id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">#{idx + 1}</div>
                  <div>
                    <p className="font-semibold text-slate-800 flex items-center gap-2">{c.name} {!c.cgpa_eligible && <span className="badge bg-rose-100 text-rose-700 text-[10px]">CGPA below cutoff</span>}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><GraduationCap size={12} /> {c.college} · CGPA {c.cgpa}</p>
                  </div>
                </div>
                <MatchBadge percent={c.match_percent} />
              </div>
              <div className="grid md:grid-cols-2 gap-3 mt-4 bg-slate-50 rounded-xl p-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1"><Sparkles size={12} /> Why this candidate</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.matched_skills.length === 0 && <span className="text-xs text-slate-400">No strong skill matches</span>}
                    {c.matched_skills.map((s) => <span key={s} className="badge bg-emerald-100 text-emerald-700">{s}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1.5">Missing skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skill_gaps.length === 0 && <span className="text-xs text-slate-400">None — fully matched!</span>}
                    {c.skill_gaps.map((s) => <span key={s} className="badge bg-amber-100 text-amber-700">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
