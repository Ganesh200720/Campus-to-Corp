import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import MatchBadge from '../../components/MatchBadge'
import {
  Users,
  GraduationCap,
  Sparkles,
  Link,
  Globe,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

export default function CandidateMatching() {
  const [searchParams] = useSearchParams()

  const [internships, setInternships] = useState([])
  const [jobs, setJobs] = useState([])
  const [selection, setSelection] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const [i, j] = await Promise.all([
          api.get('/opportunities/industry/internships/'),
          api.get('/opportunities/industry/jobs/'),
        ])

        const internshipsData = i.data || []
        const jobsData = j.data || []

        setInternships(internshipsData)
        setJobs(jobsData)

        const preselectInternship = searchParams.get('internship_id')
        const preselectJob = searchParams.get('job_id')

        if (preselectInternship) {
          setSelection(`internship:${preselectInternship}`)
        } else if (preselectJob) {
          setSelection(`job:${preselectJob}`)
        } else if (internshipsData.length) {
          setSelection(`internship:${internshipsData[0].id}`)
        } else if (jobsData.length) {
          setSelection(`job:${jobsData[0].id}`)
        }
      } catch (error) {
        console.error('Failed to load opportunities:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOpportunities()
  }, [searchParams])

  useEffect(() => {
    if (!selection) return

    const loadCandidates = async () => {
      setFetching(true)

      try {
        const [type, id] = selection.split(':')
        const param =
          type === 'internship' ? `internship_id=${id}` : `job_id=${id}`

        const response = await api.get(
          `/opportunities/candidate-matches/?${param}`
        )

        setCandidates(response.data || [])
      } catch (error) {
        console.error('Failed to load candidate matches:', error)
        setCandidates([])
      } finally {
        setFetching(false)
      }
    }

    loadCandidates()
  }, [selection])

  if (loading) {
    return <LoadingState label="Loading candidate matches..." />
  }

  const allOptions = [
    ...internships.map((internship) => ({
      value: `internship:${internship.id}`,
      label: `${internship.title} (Internship)`,
    })),
    ...jobs.map((job) => ({
      value: `job:${job.id}`,
      label: `${job.title} (Job)`,
    })),
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 font-sans text-slate-900">
      {/* Header Bar & Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full mb-2">
              <Users className="w-3 h-3 text-indigo-600" />
              <span>Talent Intelligence</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Candidate Matching
            </h1>

            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Ranked and explainable student matches calculated from core skill matrices and academic parameters.
            </p>
          </div>
        </div>

        {allOptions.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
            Post an internship or job opening first to evaluate matched candidate profiles.
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 max-w-xl">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
              Select Opportunity Target
            </label>

            <div className="relative">
              <select
                value={selection}
                onChange={(e) => setSelection(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-10 text-xs font-medium text-slate-800 outline-none transition hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {allOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="w-4 h-4 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* Candidate Evaluation Feed */}
      {fetching ? (
        <LoadingState label="Ranking candidate matches..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Candidate Matches Found"
          description="There are currently no student profiles meeting the criteria for this opportunity."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-500 px-1">
            <span>Ranked Results ({candidates.length})</span>
            <span>Sorted by Match Vector</span>
          </div>

          {candidates.map((candidate, index) => (
            <div
              key={candidate.student_id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition space-y-4"
            >
              {/* Candidate Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {candidate.name}
                      </h3>

                      {!candidate.cgpa_eligible && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>CGPA Below Cutoff</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {candidate.college}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">
                        CGPA {candidate.cgpa}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <MatchBadge percent={candidate.match_percent} />
                </div>
              </div>

              {/* Professional Profiles */}
              {(candidate.github_url ||
                candidate.linkedin_url ||
                candidate.portfolio_url) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                    Verified Profiles
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {candidate.github_url && (
                      <a
                        href={candidate.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                      >
                        <Link className="w-3 h-3 text-slate-400" />
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}

                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 font-mono text-xs text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        <Link className="w-3 h-3 text-indigo-500" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-indigo-500" />
                      </a>
                    )}

                    {candidate.portfolio_url && (
                      <a
                        href={candidate.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                      >
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>Portfolio</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Match Vector & Skill Gaps */}
              <div className="grid md:grid-cols-2 gap-4 pt-1">
                {/* Matched Skills */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">
                      Matched Skills
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(!candidate.matched_skills ||
                      candidate.matched_skills.length === 0) && (
                      <span className="font-mono text-xs text-slate-400">
                        No direct skill overlap identified
                      </span>
                    )}

                    {candidate.matched_skills?.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-md shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-semibold">
                      Skill Gaps
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(!candidate.skill_gaps ||
                      candidate.skill_gaps.length === 0) && (
                      <span className="font-mono text-xs text-slate-500 italic">
                        None — 100% skill alignment
                      </span>
                    )}

                    {candidate.skill_gaps?.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center font-mono text-[11px] text-amber-800 bg-white border border-amber-200 px-2 py-0.5 rounded-md shadow-xs"
                      >
                        {skill}
                      </span>
                    ))}
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