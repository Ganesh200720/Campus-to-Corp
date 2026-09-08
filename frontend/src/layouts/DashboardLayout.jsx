import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, User, ClipboardCheck, BarChart3, Compass, Briefcase, FileText,
  ListChecks, BookOpen, Mic, FolderKanban, LogOut, Bell, Building2, Users,
  PlusCircle, GraduationCap, Presentation,
} from 'lucide-react'

const NAV = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/assessment', label: 'Skill Assessment', icon: ClipboardCheck },
    { to: '/student/skill-analysis', label: 'Skill Analysis', icon: BarChart3 },
    { to: '/student/career-guidance', label: 'Career Guidance', icon: Compass },
    { to: '/student/internships', label: 'Internships', icon: Briefcase },
    { to: '/student/jobs', label: 'Jobs', icon: FileText },
    { to: '/student/applications', label: 'My Applications', icon: ListChecks },
    { to: '/student/learning-hub', label: 'Learning Hub', icon: BookOpen },
    { to: '/student/mock-interview', label: 'Mock Interview', icon: Mic },
    { to: '/student/portfolio', label: 'My Portfolio', icon: FolderKanban },
  ],
  industry: [
    { to: '/industry', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/industry/post', label: 'Post Opportunity', icon: PlusCircle },
    { to: '/industry/internships', label: 'My Internships', icon: Briefcase },
    { to: '/industry/jobs', label: 'My Jobs', icon: FileText },
    { to: '/industry/applications', label: 'Applications', icon: ListChecks },
    { to: '/industry/candidates', label: 'Candidate Matching', icon: Users },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/faculty/opportunities', label: 'Opportunities', icon: Presentation },
  ],
  admin: [
    { to: '/admin', label: 'Institution Analytics', icon: BarChart3, end: true },
  ],
}

const ROLE_LABEL = {
  student: 'Student', industry: 'Industry Partner', faculty: 'Faculty', admin: 'Institution Admin',
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  const items = NAV[user.role] || []

  const displayName = user.role === 'student' ? user.profile?.full_name
    : user.role === 'industry' ? user.profile?.company_name
    : user.role === 'faculty' ? user.profile?.full_name
    : user.profile?.institution_name || user.username

  const initial = (displayName || user.username || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">SkillBridge</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium">{ROLE_LABEL[user.role]}</p>
            <p className="text-sm font-semibold text-slate-800">Welcome back, {displayName?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-slate-700">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm">
              {initial}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
