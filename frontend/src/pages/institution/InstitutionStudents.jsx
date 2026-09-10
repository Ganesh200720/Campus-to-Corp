import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import { Search, ArrowRight, FileCheck2, Briefcase, Award, CheckCircle2 } from 'lucide-react'

const DEPARTMENTS = ['', 'Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering']
const YEARS = ['', '1', '2', '3', '4']

export default function InstitutionStudents() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [placementStatus, setPlacementStatus] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (department) params.set('department', department)
    if (year) params.set('year', year)
    if (placementStatus) params.set('placement_status', placementStatus)
    if (search) params.set('search', search)
    const res = await api.get(`/analytics/students/?${params.toString()}`)
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, year, placementStatus, search])

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-800">Student Directory</h1>
        <p className="text-sm text-slate-500 mb-4">
          {data?.institution_name ? `${data.institution_name} — ` : ''}
          monitor skill development, internship participation and placement progress across your students.
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 w-64"
            />
          </div>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d || 'All Departments'}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
            {YEARS.map((y) => <option key={y} value={y}>{y ? `Year ${y}` : 'All Years'}</option>)}
          </select>
          <select value={placementStatus} onChange={(e) => setPlacementStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
            <option value="">All Students</option>
            <option value="placed">Placed</option>
            <option value="not_placed">Not Placed</option>
          </select>
        </div>
      </div>

      {loading || !data ? (
        <LoadingState label="Loading student roster..." />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{data.count} student{data.count === 1 ? '' : 's'}</p>
          </div>
          {data.count === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No students match these filters.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.students.map((s) => (
                <Link
                  key={s.id}
                  to={`/institution/students/${s.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                    style={{ backgroundColor: s.avatar_color }}
                  >
                    {s.full_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {s.branch || 'Unspecified'} · Year {s.year} · CGPA {s.cgpa}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 shrink-0">
                    <div className="flex items-center gap-1.5 w-28">
                      <Award size={14} className="text-violet-500" />
                      Skill {s.average_skill_score}%
                    </div>
                    <div className="flex items-center gap-1.5 w-28">
                      <Briefcase size={14} className="text-amber-500" />
                      {s.internship_applications} internship{s.internship_applications === 1 ? '' : 's'}
                    </div>
                    <div className="flex items-center gap-1.5 w-32">
                      <FileCheck2 size={14} className="text-sky-500" />
                      Readiness {s.placement_readiness}%
                    </div>
                    {s.is_placed && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 size={14} /> Placed
                      </div>
                    )}
                  </div>

                  <ArrowRight size={16} className="text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
