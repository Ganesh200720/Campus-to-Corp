import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import {
  Users,
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  under_review: { label: 'Under Review', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  shortlisted: { label: 'Shortlisted', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  interview: { label: 'Interview', color: 'bg-violet-50 text-violet-800 border-violet-200' },
  selected: { label: 'Selected', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-800 border-rose-200' },
}

const STATUSES = [
  'applied',
  'under_review',
  'shortlisted',
  'interview',
  'selected',
  'rejected',
]

export default function Candidates() {
  const [searchParams] = useSearchParams()
  const internshipId = searchParams.get('internship_id')
  const jobId = searchParams.get('job_id')

  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await api.get('/opportunities/industry/applications/')

      const filteredApps = internshipId
        ? res.data.filter(
            (application) =>
              String(application.internship) === String(internshipId)
          )
        : jobId
        ? res.data.filter(
            (application) =>
              String(application.job) === String(jobId)
          )
        : res.data

      setApps(filteredApps)
    } catch (err) {
      console.error(err)
      setError('Unable to load candidate applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [internshipId, jobId])

  const updateStatus = async (id, status) => {
    try {
      setApps((current) =>
        current.map((application) =>
          application.id === id ? { ...application, status } : application
        )
      )

      await api.patch(`/opportunities/applications/${id}/status/`, { status })
    } catch (err) {
      console.error(err)
      load()
    }
  }

  if (loading) return <LoadingState />

  const pageTitle = apps.length > 0
    ? (jobId
        ? apps[0].job_title
        : apps[0].internship_title)
    : (jobId ? 'Job Candidates' : 'Internship Candidates')

  // Back button should return to whichever list the user came from
  const backTo = jobId ? '/industry/jobs' : '/industry/internships'
  const backLabel = jobId ? 'Back to My Jobs' : 'Back to My Internships'

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 font-sans text-slate-900">

      {/* Structural Header with Prominent Back Control */}
      <div className="space-y-4 pb-5 border-b border-slate-200">
        <div>
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition mb-3"
            aria-label={backLabel}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>{backLabel}</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-slate-700 shrink-0" />
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                {pageTitle}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review and update application pipelines for candidates in this posting.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-700 self-start sm:self-auto">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {apps.length} Applicant{apps.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded p-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!error && apps.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded p-12 text-center">
          <EmptyState
            icon={Users}
            title="No Candidates Found"
            description="No student applications have been logged for this opportunity yet."
          />
        </div>
      ) : (
        /* Candidates List / Data Cards */
        <div className="space-y-3">
          {apps.map((application) => {
            const currentStatus =
              STATUS_CONFIG[application.status] || STATUS_CONFIG.applied

            return (
              <div
                key={application.id}
                className="bg-white border border-slate-200 rounded p-4 sm:p-5 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Candidate Overview */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-600 font-semibold text-xs font-mono">
                    {application.student_name
                      ? application.student_name.slice(0, 2).toUpperCase()
                      : 'NA'}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {application.student_name || 'Anonymous Applicant'}
                      </h3>

                      {application.match_score !== undefined && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded">
                          <Sparkles className="w-3 h-3 text-slate-500" />
                          {Math.round(application.match_score)}% Match
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                      {application.student_email && (
                        <a
                          href={`mailto:${application.student_email}`}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{application.student_email}</span>
                        </a>
                      )}

                      {application.applied_at && (
                        <div className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Applied{' '}
                            {new Date(application.applied_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pipeline & Status Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Status Indicator Chip */}
                  <div className="flex items-center gap-1.5">
                    {application.status === 'selected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : application.status === 'rejected' ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400" />
                    )}

                    <span
                      className={`font-mono text-xs px-2.5 py-1 rounded border font-medium ${currentStatus.color}`}
                    >
                      {currentStatus.label}
                    </span>
                  </div>

                  {/* Pipeline Select Dropdown */}
                  <div className="relative">
                    <select
                      aria-label="Update Application Status"
                      value={application.status}
                      onChange={(e) => updateStatus(application.id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-500 transition cursor-pointer"
                    >
                      {STATUSES.map((statusKey) => (
                        <option key={statusKey} value={statusKey}>
                          {STATUS_CONFIG[statusKey]?.label || statusKey}
                        </option>
                      ))}
                    </select>
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