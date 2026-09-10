import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import LoadingState from '../../components/LoadingState'
import {
  Save,
  CheckCircle2,
  Link,
  Globe,
  User,
} from 'lucide-react'

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
    const loadProfile = async () => {
      try {
        const res = await api.get('/auth/profile/student/')
        setProfile(res.data)
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (key, value) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    setSaving(true)
    setSaved(false)

    try {
      const res = await api.patch(
        '/auth/profile/student/',
        profile
      )

      setProfile(res.data)

      await refreshUser()

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 2500)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingState label="Loading your profile..." />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-center gap-4">

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{
              backgroundColor:
                profile.avatar_color || '#6366f1',
            }}
          >
            {profile.full_name?.charAt(0)?.toUpperCase() || 'S'}
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {profile.full_name}
            </h1>

            <p className="text-sm text-slate-500">
              {profile.username} · {profile.email}
            </p>

            {profile.career_interest && (
              <span className="inline-flex mt-2 text-xs font-medium text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                {profile.career_interest}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSave}
        className="card p-6 space-y-7"
      >

        {/* Academic Information */}
        <section>
          <div className="flex items-center gap-2 mb-4">

            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
              <User
                size={17}
                className="text-brand-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Employability Profile
              </h2>

              <p className="text-xs text-slate-500">
                Keep your academic and career information updated.
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {FIELDS.map((field) => (
              <div key={field.key}>

                <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                  {field.label}
                </label>

                <input
                  type={field.type || 'text'}
                  step={field.step}
                  value={profile[field.key] ?? ''}
                  onChange={(e) =>
                    handleChange(
                      field.key,
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition"
                />

              </div>
            ))}

          </div>
        </section>

        {/* Bio */}
        <section>

          <label className="text-sm font-medium text-slate-600 mb-1.5 block">
            Bio
          </label>

          <textarea
            value={profile.bio ?? ''}
            onChange={(e) =>
              handleChange('bio', e.target.value)
            }
            rows={4}
            placeholder="Tell recruiters about yourself, your interests and career goals..."
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition resize-none"
          />

        </section>

        {/* Professional Links */}
        <section className="border-t border-slate-100 pt-6">

          <div className="flex items-center gap-2 mb-4">

            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
              <Link
                size={17}
                className="text-brand-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Professional Links
              </h2>

              <p className="text-xs text-slate-500">
                Add links recruiters can use to explore your work.
              </p>
            </div>

          </div>

          <div className="space-y-4">

            {/* GitHub */}
            <div>

              <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                GitHub Profile
              </label>

              <div className="relative">

                <Link
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  value={profile.github_url ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'github_url',
                      e.target.value
                    )
                  }
                  placeholder="https://github.com/yourusername"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition"
                />

              </div>
            </div>

            {/* LinkedIn */}
            <div>

              <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                LinkedIn Profile
              </label>

              <div className="relative">

                <Link
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  value={profile.linkedin_url ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'linkedin_url',
                      e.target.value
                    )
                  }
                  placeholder="https://linkedin.com/in/yourusername"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition"
                />

              </div>
            </div>

            {/* Portfolio */}
            <div>

              <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                Personal Portfolio
              </label>

              <div className="relative">

                <Globe
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  value={profile.portfolio_url ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'portfolio_url',
                      e.target.value
                    )
                  }
                  placeholder="https://yourportfolio.com"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition"
                />

              </div>
            </div>

          </div>

        </section>

        {/* Save */}
        <div className="border-t border-slate-100 pt-5 flex items-center gap-3">

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={16} />

            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {saved && (
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={16} />
              Profile saved successfully
            </span>
          )}

        </div>

      </form>

    </div>
  )
}