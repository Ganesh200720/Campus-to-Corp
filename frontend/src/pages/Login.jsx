import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { GraduationCap, User, Building2, Presentation, ShieldCheck, Loader2 } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { role: 'student', username: 'student', label: 'Student Demo', desc: 'Rahul Sharma · B.Tech CSE', icon: User },
  { role: 'industry', username: 'industry', label: 'Industry Demo', desc: 'TechNova Solutions', icon: Building2 },
  { role: 'faculty', username: 'faculty', label: 'Faculty Demo', desc: 'Dr. Anita Verma', icon: Presentation },
  { role: 'admin', username: 'admin', label: 'Admin Demo', desc: 'Institution Analytics', icon: ShieldCheck },
]
const DEMO_PASSWORD = 'SkillBridge@2026'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

  const handleLogin = (e) => {
    e.preventDefault()
    doLogin(username, password)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/signup/', {
        username,
        email,
        full_name: fullName,
        password,
        confirm_password: confirmPassword,
      })
      const data = await login(username, password)
      navigate(`/${data.role}`)
    } catch (e) {
      const data = e?.response?.data
      setError(
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.confirm_password?.[0] ||
        data?.detail ||
        'Unable to create account.'
      )
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setUsername('')
    setEmail('')
    setFullName('')
    setPassword('')
    setConfirmPassword('')
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

          <h1 className="text-xl font-bold text-slate-800 mb-1">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {isSignup ? 'Sign up to start your journey.' : 'Sign in to continue your journey.'}
          </p>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="e.g. student"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="••••••••"
                required
              />
            </div>

            {isSignup && (
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-5">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {!isSignup && (
            <p className="text-xs text-slate-400 mt-4">
              Demo password for all demo accounts:{' '}
              <span className="font-mono font-semibold text-slate-600">{DEMO_PASSWORD}</span>
            </p>
          )}
        </div>

        <div className="card p-8 bg-slate-900 text-white">
          <h2 className="font-bold text-lg mb-1">Quick Demo Access</h2>
          <p className="text-sm text-slate-400 mb-6">Jump straight into any role — one click.</p>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map(({ role, username: u, label, desc, icon: Icon }) => (
              <button
                key={role}
                onClick={() => doLogin(u, DEMO_PASSWORD)}
                disabled={loading || isSignup}
                className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl px-4 py-3 text-left disabled:opacity-50"
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