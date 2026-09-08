import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, User, Building2, Presentation, ShieldCheck, Loader2 } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { role: 'student', username: 'student', label: 'Student Demo', desc: 'Rahul Sharma · B.Tech CSE', icon: User, color: 'bg-brand-50 text-brand-600 border-brand-200' },
  { role: 'industry', username: 'industry', label: 'Industry Demo', desc: 'TechNova Solutions', icon: Building2, color: 'bg-sky-50 text-sky-600 border-sky-200' },
  { role: 'faculty', username: 'faculty', label: 'Faculty Demo', desc: 'Dr. Anita Verma', icon: Presentation, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { role: 'admin', username: 'admin', label: 'Admin Demo', desc: 'Institution Analytics', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
]
const DEMO_PASSWORD = 'SkillBridge@2026'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const doLogin = async (u, p) => {
    setError('')
    setLoading(true)
    try {
      const data = await login(u, p)
      navigate(`/${data.role}`)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doLogin(username, password)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">SkillBridge</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-6">Sign in to continue your journey.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Username</label>
              <input
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="e.g. student" required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="••••••••" required
              />
            </div>
            {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-5">
            Demo password for all demo accounts: <span className="font-mono font-semibold text-slate-600">{DEMO_PASSWORD}</span>
          </p>
        </div>

        <div className="card p-8 bg-slate-900 text-white">
          <h2 className="font-bold text-lg mb-1">Quick Demo Access</h2>
          <p className="text-sm text-slate-400 mb-6">Jump straight into any role — one click.</p>
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map(({ role, username: u, label, desc, icon: Icon }) => (
              <button
                key={role}
                onClick={() => doLogin(u, DEMO_PASSWORD)}
                disabled={loading}
                className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl px-4 py-3 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
