import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import MatchBadge from '../../components/MatchBadge'
import { Users, GraduationCap, Sparkles, X, MapPin, Briefcase, Award, Trophy, Code, FileText } from 'lucide-react'

export default function CandidateMatching() {
  const [searchParams] = useSearchParams()
  const [internships, setInternships] = useState([])
  const [jobs, setJobs] = useState([])
  const [selection, setSelection] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [portfolio, setPortfolio] = useState(null)
  const [portfolioLoading, setPortfolioLoading] = useState(false)

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

    ;(async () => {
      setFetching(true)
      const [type, id] = selection.split(':')
      const param = type === 'internship' ? `internship_id=${id}` : `job_id=${id}`
      const res = await api.get(`/opportunities/candidate-matches/?${param}`)
      setCandidates(res.data)
      setFetching(false)
    })()
  }, [selection])

  const viewPortfolio = async (studentId) => {
    setPortfolioLoading(true)
    try {
      const res = await api.get(`/portfolio/student/${studentId}/`)
      setPortfolio(res.data)
    } catch (e) {
      console.error('Failed to load portfolio:', e)
    } finally {
      setPortfolioLoading(false)
    }
  }

  if (loading) return <LoadingState />

  const allOptions = [
    ...internships.map((i) => ({
      value: `internship:${i.id}`,
      label: `${i.title} (Internship)`
    })),
    ...jobs.map((j) => ({
      value: `job:${j.id}`,
      label: `${j.title} (Job)`
    })),
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-brand-600" />
          <h1 className="text-xl font-bold text-slate-800">Candidate Matching</h1>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          See ranked, explainable candidate matches for any posting — two-way intelligence in action.
        </p>

        {allOptions.length === 0 ? (
          <p className="text-sm text-slate-400">
            Post an internship or job first to see matched candidates.
          </p>
        ) : (
          <select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="w-full md:w-96 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {allOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {fetching ? (
        <LoadingState label="Ranking candidates..." />
      ) : candidates.length === 0 ? (
        <EmptyState icon={Users} title="No candidates found" />
      ) : (
        <div className="space-y-4">
          {candidates.map((c, idx) => (
            <div key={c.student_id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                    #{idx + 1}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 flex items-center gap-2">
                      {c.name}
                      {!c.cgpa_eligible && (
                        <span className="badge bg-rose-100 text-rose-700 text-[10px]">
                          CGPA below cutoff
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <GraduationCap size={12} />
                      {c.college} · CGPA {c.cgpa}
                    </p>
                  </div>
                </div>

                <MatchBadge percent={c.match_percent} />
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-4 bg-slate-50 rounded-xl p-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1">
                    <Sparkles size={12} />
                    Why this candidate
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {c.matched_skills.length === 0 && (
                      <span className="text-xs text-slate-400">
                        No strong skill matches
                      </span>
                    )}

                    {c.matched_skills.map((s) => (
                      <span key={s} className="badge bg-emerald-100 text-emerald-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1.5">
                    Missing skills
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {c.skill_gaps.length === 0 && (
                      <span className="text-xs text-slate-400">
                        None — fully matched!
                      </span>
                    )}

                    {c.skill_gaps.map((s) => (
                      <span key={s} className="badge bg-amber-100 text-amber-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-start md:justify-end">
                  <button
                    onClick={() => viewPortfolio(c.student_id)}
                    disabled={portfolioLoading}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <FileText size={15} />
                    {portfolioLoading ? 'Loading...' : 'View Portfolio'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {portfolio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-start justify-between p-6 border-b border-slate-100 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {portfolio.profile.full_name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {portfolio.profile.career_interest || 'Student Portfolio'}
                </p>
              </div>

              <button
                onClick={() => setPortfolio(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon />
                  <h3 className="font-semibold text-slate-800">Personal & Education</h3>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4">
                  <PortfolioField label="Name" value={portfolio.profile.full_name} />
                  <PortfolioField label="Email" value={portfolio.profile.email || 'Not available'} />
                  <PortfolioField label="Location" value={portfolio.profile.location} icon={<MapPin size={12} />} />
                  <PortfolioField label="College" value={portfolio.profile.college} />
                  <PortfolioField label="Degree" value={portfolio.profile.degree} />
                  <PortfolioField label="Branch" value={portfolio.profile.branch} />
                  <PortfolioField label="Year" value={portfolio.profile.year} />
                  <PortfolioField label="CGPA" value={portfolio.profile.cgpa} />
                  <PortfolioField label="Career Interest" value={portfolio.profile.career_interest} />
                </div>

                {portfolio.profile.bio && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">About</p>
                    <p className="text-sm text-slate-600 leading-6">
                      {portfolio.profile.bio}
                    </p>
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Code size={17} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">Skills</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(portfolio.skills || {}).length === 0 ? (
                    <span className="text-sm text-slate-400">No skills added.</span>
                  ) : (
                    Object.entries(portfolio.skills).map(([skill, score]) => (
                      <span key={skill} className="badge bg-brand-50 text-brand-700">
                        {skill} · {score}
                      </span>
                    ))
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase size={17} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">Projects</h3>
                </div>

                {portfolio.projects?.length ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {portfolio.projects.map((project) => (
                      <div key={project.id} className="border border-slate-200 rounded-xl p-4">
                        <p className="font-semibold text-sm text-slate-800">
                          {project.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {project.description || 'No description provided.'}
                        </p>
                        {project.technologies && (
                          <p className="text-xs text-brand-600 mt-2">
                            {project.technologies}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No projects added.</p>
                )}
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Award size={17} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">Certifications</h3>
                </div>

                {portfolio.certifications?.length ? (
                  <div className="space-y-2">
                    {portfolio.certifications.map((certification) => (
                      <div key={certification.id} className="border border-slate-200 rounded-xl p-4">
                        <p className="font-semibold text-sm text-slate-800">
                          {certification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {certification.issuer || certification.provider || 'Certification'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No certifications added.</p>
                )}
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={17} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">Achievements</h3>
                </div>

                {portfolio.achievements?.length ? (
                  <div className="space-y-2">
                    {portfolio.achievements.map((achievement) => (
                      <div key={achievement.id} className="border border-slate-200 rounded-xl p-4">
                        <p className="font-semibold text-sm text-slate-800">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {achievement.description || 'No description provided.'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No achievements added.</p>
                )}
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={17} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">Placement Readiness</h3>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  {Object.entries(portfolio.placement_readiness || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b last:border-0 border-slate-200">
                      <span className="text-sm text-slate-600 capitalize">
                        {key.replaceAll('_', ' ')}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {typeof value === 'number' ? `${value}%` : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PortfolioField({ label, value, icon }) {
  return (
    <div>
      <p className="text-xs text-slate-400 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-700 mt-0.5">
        {value || 'Not provided'}
      </p>
    </div>
  )
}

function UserIcon() {
  return <Users size={17} className="text-brand-600" />
}