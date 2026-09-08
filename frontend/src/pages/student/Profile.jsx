import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import LoadingState from '../../components/LoadingState'
import { Save, CheckCircle2 } from 'lucide-react'

const FIELDS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'college', label: 'College' },
  { key: 'degree', label: 'Degree' },
  { key: 'branch', label: 'Branch' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'cgpa', label: 'CGPA', type: 'number', step: '0.01' },
  { key: 'location', label: 'Location' },
  { key: 'career_interest', label: 'Career Interest' },
]

export default function Profile() {
  const { refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/auth/profile/student/').then((res) => {
      setProfile(res.data)
      setLoading(false)
    })
  }, [])

  const handleChange = (key, value) => setProfile((p) => ({ ...p, [key]: value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await api.patch('/auth/profile/student/', profile)
      setProfile(res.data)
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Loading your profile..." />

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card p-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
          style={{ backgroundColor: profile.avatar_color }}
        >
          {profile.full_name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{profile.full_name}</h1>
          <p className="text-sm text-slate-500">{profile.username} · {profile.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Employability Profile</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-sm font-medium text-slate-600 mb-1 block">{f.label}</label>
              <input
                type={f.type || 'text'}
                step={f.step}
                value={profile[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Bio</label>
          <textarea
            value={profile.bio ?? ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={16} /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
