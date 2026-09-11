import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import { Users, Briefcase, Award, ExternalLink } from 'lucide-react'

export default function InstitutionStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/analytics/students/')
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <LoadingState label="Loading student profiles..." />
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <Users className="text-brand-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Institution Students
            </h1>
            <p className="text-sm text-slate-500">
              View student profiles, skills, internships and placement progress.
            </p>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          No students found for this institution.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {students.map((student) => (
            <div key={student.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">
                    {student.full_name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {student.email}
                  </p>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
                  Year {student.year}
                </span>
              </div>

              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p>{student.degree}</p>
                <p>{student.branch || 'Branch not specified'}</p>
                <p>CGPA: {student.cgpa}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    {student.skills.length}
                  </p>
                  <p className="text-xs text-slate-500">
                    Skills
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    {student.internship_count}
                  </p>
                  <p className="text-xs text-slate-500">
                    Internships
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    {student.placement_count}
                  </p>
                  <p className="text-xs text-slate-500">
                    Placements
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelected(student)}
                className="btn-primary w-full mt-5"
              >
                View Full Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selected.full_name}
                </h2>
                <p className="text-sm text-slate-500">
                  {selected.email}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs text-slate-400">Degree</p>
                <p className="font-medium">
                  {selected.degree}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Branch</p>
                <p className="font-medium">
                  {selected.branch || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Year</p>
                <p className="font-medium">
                  {selected.year}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">CGPA</p>
                <p className="font-medium">
                  {selected.cgpa}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Placement Readiness
                </p>
                <p className="font-medium">
                  {selected.placement_readiness}%
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Profile Completion
                </p>
                <p className="font-medium">
                  {selected.profile_completion}%
                </p>
              </div>
            </div>

            {selected.bio && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-2">
                  About
                </h3>
                <p className="text-sm text-slate-600">
                  {selected.bio}
                </p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-3">
                Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {selected.skills.length > 0 ? (
                  selected.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm"
                    >
                      {skill.name} · {skill.score}%
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No skills recorded.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              {selected.github_url && (
                <a
                  href={selected.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  GitHub
                </a>
              )}

              {selected.linkedin_url && (
                <a
                  href={selected.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  LinkedIn
                </a>
              )}

              {selected.portfolio_url && (
                <a
                  href={selected.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2 col-span-2"
                >
                  <ExternalLink size={16} />
                  Portfolio
                </a>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="card p-4 text-center">
                <Briefcase
                  size={18}
                  className="mx-auto mb-2 text-amber-500"
                />
                <p className="font-bold">
                  {selected.internship_count}
                </p>
                <p className="text-xs text-slate-500">
                  Internships
                </p>
              </div>

              <div className="card p-4 text-center">
                <Award
                  size={18}
                  className="mx-auto mb-2 text-emerald-500"
                />
                <p className="font-bold">
                  {selected.placement_count}
                </p>
                <p className="text-xs text-slate-500">
                  Placements
                </p>
              </div>

              <div className="card p-4 text-center">
                <Users
                  size={18}
                  className="mx-auto mb-2 text-brand-500"
                />
                <p className="font-bold">
                  {selected.placement_readiness}%
                </p>
                <p className="text-xs text-slate-500">
                  Readiness
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}