import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Users, ClipboardCheck, TrendingUp, Briefcase, Award, Sparkles, ArrowRight } from 'lucide-react'

const DEPARTMENTS = ['', 'Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering']
const YEARS = ['', '1', '2', '3', '4']

export default function InstitutionDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (department) params.set('department', department)
    if (year) params.set('year', year)
    const res = await api.get(`/analytics/overview/?${params.toString()}`)
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [department, year])

  if (loading || !data) return <LoadingState label="Crunching institution analytics..." />

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-800">Institution Analytics</h1>
        <p className="text-sm text-slate-500 mb-4">{user.profile?.institution_name} — how industry-ready are our students?</p>
        <div className="flex flex-wrap gap-3">
          <select value={department} onChange={(e) => setDepartment(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d || 'All Departments'}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200">
            {YEARS.map((y) => <option key={y} value={y}>{y ? `Year ${y}` : 'All Years'}</option>)}
          </select>
        </div>
      </div>

      <Link to="/institution/students" className="card p-5 flex items-center justify-between hover:border-brand-300 border border-transparent transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Student Directory</p>
            <p className="text-xs text-slate-500">Browse every student's profile, skills, internships and placement progress</p>
          </div>
        </div>
        <ArrowRight size={18} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
      </Link>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={data.total_students} color="bg-brand-50 text-brand-600" />
        <StatCard icon={ClipboardCheck} label="Students Assessed" value={data.students_assessed} color="bg-sky-50 text-sky-600" />
        <StatCard icon={TrendingUp} label="Avg. Placement Readiness" value={`${data.average_placement_readiness}%`} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Briefcase} label="Internship Participation" value={`${data.internship_participation_rate}%`} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <StatCard icon={Award} label="Average Skill Score" value={`${data.average_skill_score}%`} color="bg-violet-50 text-violet-600" />
        <StatCard icon={TrendingUp} label="Placement Rate" value={`${data.placement_rate}%`} color="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Top Student Skills</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.top_skills} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="skill" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg_score" fill="#4f46e5" radius={[0, 6, 6, 0]} name="Avg Score %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Department-wise Placement Readiness</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.department_wise_readiness}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg_readiness" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Avg Readiness %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><Sparkles size={18} className="text-brand-600" /><h3 className="font-semibold text-slate-800">Industry Demand vs Student Skill Level — Priority Gaps</h3></div>
        <p className="text-sm text-slate-500 mb-4">Skills where industry demand most exceeds current student proficiency — direct input for curriculum planning.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.skill_gaps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="skill" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="industry_demand" fill="#f59e0b" name="Industry Demand %" radius={[6, 6, 0, 0]} />
            <Bar dataKey="student_average" fill="#4f46e5" name="Student Average %" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
