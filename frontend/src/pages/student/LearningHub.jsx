import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Target,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react'

const TYPE_ICON = {
  course: BookOpen,
  certification: Award,
  workshop: GraduationCap,
  mentorship: Users,
}

const TYPE_LABEL = {
  course: 'Course',
  certification: 'Certification',
  workshop: 'Workshop',
  mentorship: 'Mentorship',
}

export default function LearningHub() {
  const [loading, setLoading] = useState(true)

  const [personalized, setPersonalized] = useState([])
  const [all, setAll] = useState([])

  const [tab, setTab] = useState('personalized')

  // Job role state
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [roleSkills, setRoleSkills] = useState([])
  const [roleLoading, setRoleLoading] = useState(false)

  // Load learning resources
  useEffect(() => {
    const loadLearningPrograms = async () => {
      try {
        const [p, a] = await Promise.all([
          api.get('/opportunities/learning-programs/?personalized=1'),
          api.get('/opportunities/learning-programs/'),
        ])

        setPersonalized(p.data || [])
        setAll(a.data || [])
      } catch (error) {
        console.error('Failed to load learning programs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLearningPrograms()
  }, [])

  // Load available job roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await api.get('/skills/roles/')

        setRoles(response.data || [])

        if (response.data && response.data.length > 0) {
          setSelectedRole(response.data[0])
        }
      } catch (error) {
        console.error('Failed to load job roles:', error)
      }
    }

    loadRoles()
  }, [])

  // Load required skills whenever job role changes
  useEffect(() => {
    const loadRoleSkills = async (role) => {
      if (!role) {
        setRoleSkills([])
        return
      }

      setRoleLoading(true)

      try {
        const response = await api.get(
          `/skills/gap/${encodeURIComponent(role)}`
        )

        setRoleSkills(response.data?.gap_analysis || [])
      } catch (error) {
        console.error('Failed to load role skills:', error)
        setRoleSkills([])
      } finally {
        setRoleLoading(false)
      }
    }

    loadRoleSkills(selectedRole)
  }, [selectedRole])

  if (loading) {
    return <LoadingState label="Curating your learning path..." />
  }

  const list = tab === 'personalized' ? personalized : all

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 font-sans text-slate-900">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded mb-2">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Personalized Learning</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Learning Hub
          </h1>

          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Choose your target job role to discover core skill gaps and matched learning resources.
          </p>
        </div>
      </div>

      {/* Job Role Selector Section */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-600 shrink-0">
            <Target className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Target Job Role
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Select a role to analyze skill requirements against your current portfolio.
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none rounded border border-slate-300 bg-white px-3.5 py-2 pr-10 text-xs font-medium text-slate-800 outline-none transition hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a job role</option>

              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <ChevronDown className="w-4 h-4 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Required Skills Gap Analysis */}
      {selectedRole && (
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded mb-1.5">
                <Target className="w-3 h-3 text-indigo-600" />
                <span>Skill Gap Analysis</span>
              </div>

              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Skills Required for {selectedRole}
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Compare your present proficiency against target role benchmarks.
              </p>
            </div>

            {!roleLoading && roleSkills.length > 0 && (
              <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded shrink-0">
                {roleSkills.length} skill{roleSkills.length !== 1 ? 's' : ''} mapped
              </span>
            )}
          </div>

          {roleLoading ? (
            <div className="py-12 flex justify-center">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Clock className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Calculating skill gap vector...</span>
              </div>
            </div>
          ) : roleSkills.length === 0 ? (
            <EmptyState
              title="No Skill Requirements Found"
              description="No skills are currently mapped to this target role."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleSkills.map((skill, index) => {
                const skillName =
                  skill.skill_name ||
                  skill.name ||
                  skill.skill ||
                  `Skill ${index + 1}`

                const current = Number(
                  skill.current_score ??
                    skill.current ??
                    skill.score ??
                    0
                )

                const required = Number(
                  skill.required_score ??
                    skill.required ??
                    skill.target ??
                    0
                )

                const safeCurrent = Math.max(0, Math.min(100, current))
                const safeRequired = Math.max(0, Math.min(100, required))
                const ready = safeCurrent >= safeRequired
                const gap = Math.max(0, safeRequired - safeCurrent)

                return (
                  <div
                    key={skill.id || skillName}
                    className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xs font-bold text-slate-900 truncate">
                          {skillName}
                        </h3>

                        {ready ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Ready</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0">
                            <TrendingUp className="w-3 h-3 text-amber-600" />
                            <span>Gap {gap}%</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-slate-50 border border-slate-200 rounded p-2">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                            Your Level
                          </p>

                          <p className="font-mono text-base font-bold text-slate-900 mt-0.5">
                            {safeCurrent}%
                          </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded p-2">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                            Required
                          </p>

                          <p className="font-mono text-base font-bold text-slate-900 mt-0.5">
                            {safeRequired}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                          <span>Current</span>
                          <span>{safeCurrent}%</span>
                        </div>

                        <div className="h-1.5 bg-slate-100 rounded overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded transition-all duration-300 ${
                              ready ? 'bg-emerald-600' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${safeCurrent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                          <span>Target Required</span>
                          <span>{safeRequired}%</span>
                        </div>

                        <div className="h-1.5 bg-slate-100 rounded overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-slate-400 rounded transition-all duration-300"
                            style={{ width: `${safeRequired}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Learning Resources Section */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded mb-1.5">
              <BookOpen className="w-3 h-3 text-indigo-600" />
              <span>Library Catalog</span>
            </div>

            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Learning Resources
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Targeted courses, certifications, and mentorship tracks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTab('personalized')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                tab === 'personalized'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended</span>
            </button>

            <button
              onClick={() => setTab('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                tab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Browse All</span>
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            title="No Resources Listed"
            description="Complete your Skill Assessment to generate personalized recommendations."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((p) => {
              const Icon = TYPE_ICON[p.program_type] || BookOpen

              return (
                <article
                  key={p.id}
                  className="bg-white border border-slate-200 rounded p-4 hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 border border-indigo-200 rounded text-indigo-600 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {p.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                            {p.provider && <span>{p.provider}</span>}
                            {p.provider && p.duration && <span>·</span>}
                            {p.duration && <span>{p.duration}</span>}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded shrink-0">
                        {TYPE_LABEL[p.program_type] || p.program_type}
                      </span>
                    </div>

                    {p.reason && (
                      <div className="text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-200 rounded p-2.5">
                        <div className="flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-600" />
                          <span className="leading-normal">{p.reason}</span>
                        </div>
                      </div>
                    )}

                    {p.description && !p.reason && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}

                    {/* Open Learning Resource */}
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full rounded border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-400"
                      >
                        <span>
                          {p.provider === 'YouTube'
                            ? 'Learn on YouTube'
                            : p.provider === 'Coursera'
                              ? 'View on Coursera'
                              : 'Open Resource'}
                        </span>

                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}