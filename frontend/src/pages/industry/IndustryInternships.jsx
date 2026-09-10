import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  AlertCircle,
  ChevronRight,
  Calendar,
  Sparkles,
  XCircle,
} from 'lucide-react'

export default function IndustryInternships() {
  const [loading, setLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/opportunities/industry/internships/')
        setInternships(res.data)
      } catch (err) {
        console.error(err)
        setError('Unable to fetch posted internship records.')
      } finally {
        setLoading(false)
      }
    }

    fetchInternships()
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold
                          text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Industry Programs
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Internships
          </h1>

          <p className="text-slate-500 mt-1.5 max-w-xl">
            Manage active postings, inspect candidate pipelines, and review
            submissions from students.
          </p>

          <div className="inline-flex items-center gap-2 mt-3 text-xs font-medium
                          text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {internships.length} active posting
            {internships.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200
                        text-red-700 rounded-xl p-4">
          <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!error && internships.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300
                        rounded-2xl p-14 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br
                          from-indigo-50 to-indigo-100
                          flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 mt-5">
            No internships posted yet
          </h2>

          <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            Create your first internship listing to start evaluating candidate
            submissions.
          </p>
        </div>
      )}

      {/* Internship cards */}
      {!error && internships.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {internships.map((internship) => (
            <article
              key={internship.id}
              className="group relative bg-white border border-slate-200
                         rounded-2xl shadow-sm
                         hover:shadow-lg hover:border-slate-300
                         transition-all duration-200 overflow-hidden"
            >
              {/* Accent bar */}
              <div className="absolute inset-x-0 top-0 h-0.5
                              bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent" />

              <div className="p-6 flex flex-col h-full">

                {/* Title + mode */}
                <div className="flex items-start justify-between gap-3 pb-3
                                border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug
                                 tracking-tight group-hover:text-indigo-700 transition-colors">
                    {internship.title}
                  </h3>

                  {internship.mode && (
                    <span className="text-[10px] font-bold uppercase tracking-wider
                                     px-2.5 py-1 bg-slate-100 text-slate-700
                                     rounded-full shrink-0">
                      {internship.mode}
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4
                                text-xs text-slate-600">
                  {internship.location && (
                    <div className="inline-flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{internship.location}</span>
                    </div>
                  )}

                  {internship.duration && (
                    <div className="inline-flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{internship.duration}</span>
                    </div>
                  )}

                  {internship.stipend && (
                    <div className="inline-flex items-center gap-1.5 truncate">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{internship.stipend}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {internship.required_skills_detail?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {internship.required_skills_detail.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-xs font-medium text-slate-700
                                   bg-slate-100 hover:bg-slate-200
                                   px-2.5 py-1 rounded-md transition-colors"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-5 mt-6 border-t border-slate-100
                                flex items-center justify-between gap-2">

                  {internship.deadline ? (
                    <div className="inline-flex items-center gap-1.5 text-[11px]
                                    font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline {internship.deadline}</span>
                    </div>
                  ) : (
                    <div />
                  )}

                  <Link
                    to={`/industry/candidate-matching?internship_id=${internship.id}`}
                    className="group/btn inline-flex items-center gap-1.5
                               px-3.5 py-2 text-xs font-semibold
                               text-slate-800 bg-white border border-slate-300
                               rounded-xl
                               shadow-sm hover:bg-slate-50 hover:border-slate-400
                               active:scale-[0.98] transition-all"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Candidates</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400
                                             transition-transform
                                             group-hover/btn:translate-x-0.5" />
                  </Link>

                </div>

              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}