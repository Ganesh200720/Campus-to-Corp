import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collaborationApi } from '../../services/api'
import { PlusCircle, CheckCircle2 } from 'lucide-react'

const FACULTY_TYPES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'fdp', label: 'Faculty Development Program (FDP)' },
  { value: 'mentorship', label: 'Industry Mentorship' },
  { value: 'faculty_internship', label: 'Faculty Internship' },
  { value: 'industrial_training', label: 'Industrial Training' },
  { value: 'consultancy', label: 'Consultancy' },
  { value: 'research_project', label: 'Collaborative Research Project' },
]

const INSTITUTION_TYPES = [
  { value: 'guest_lecture', label: 'Guest Lecture' },
  { value: 'innovation_challenge', label: 'Innovation Challenge' },
  { value: 'live_project', label: 'Live Industry Project' },
]

export default function PostCollaboration() {
  const navigate = useNavigate()

  const [target, setTarget] = useState('faculty')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    collaboration_type: 'faculty_internship',
    target_type: 'faculty',
    eligibility: '',
    location: '',
    mode: 'hybrid',
    start_date: '',
    end_date: '',
    deadline: '',
    skills_topics: '',
    status: 'published',
  })

  const types =
    target === 'faculty'
      ? FACULTY_TYPES
      : INSTITUTION_TYPES

  function changeTarget(value) {
    const firstType =
      value === 'faculty'
        ? FACULTY_TYPES[0].value
        : INSTITUTION_TYPES[0].value

    setTarget(value)

    setForm((current) => ({
      ...current,
      target_type: value,
      collaboration_type: firstType,
    }))
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function submit(e) {
    e.preventDefault()

    try {
      setSubmitting(true)
      setError('')

      await collaborationApi.createOpportunity(form)

      setSuccess(true)

      setTimeout(() => {
        navigate('/industry/collaboration-requests')
      }, 1200)
    } catch (err) {
      const data = err.response?.data

      if (data && typeof data === 'object') {
        setError(
          data.detail ||
          Object.values(data).flat().join(' ') ||
          'Unable to create collaboration opportunity.'
        )
      } else {
        setError('Unable to create collaboration opportunity.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center">
        <CheckCircle2
          size={40}
          className="text-emerald-500 mx-auto mb-4"
        />

        <h2 className="font-bold text-slate-800">
          Collaboration Posted!
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Faculty and institutions can now discover this opportunity.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle
            size={20}
            className="text-brand-600"
          />

          <h1 className="text-xl font-bold text-slate-800">
            Post Collaboration
          </h1>
        </div>

        <p className="text-sm text-slate-500">
          Create an industry collaboration opportunity for faculty or institutions.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="card p-6 space-y-4"
      >

        {/* Target */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-2 block">
            Collaboration With
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => changeTarget('faculty')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                target === 'faculty'
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              Faculty / Academicians
            </button>

            <button
              type="button"
              onClick={() => changeTarget('institution')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                target === 'institution'
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              Institution
            </button>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Collaboration Type
          </label>

          <select
            value={form.collaboration_type}
            onChange={(e) =>
              updateField(
                'collaboration_type',
                e.target.value
              )
            }
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {types.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Title
          </label>

          <input
            required
            value={form.title}
            onChange={(e) =>
              updateField('title', e.target.value)
            }
            placeholder="e.g. AI Research Collaboration"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Description
          </label>

          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) =>
              updateField(
                'description',
                e.target.value
              )
            }
            placeholder="Describe the collaboration opportunity..."
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
          />
        </div>

        {/* Eligibility */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Eligibility
          </label>

          <textarea
            rows={2}
            value={form.eligibility}
            onChange={(e) =>
              updateField(
                'eligibility',
                e.target.value
              )
            }
            placeholder="Who can apply for this collaboration?"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
          />
        </div>

        {/* Location + Mode */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">
              Location
            </label>

            <input
              value={form.location}
              onChange={(e) =>
                updateField(
                  'location',
                  e.target.value
                )
              }
              placeholder="Hyderabad / Online"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">
              Mode
            </label>

            <select
              value={form.mode}
              onChange={(e) =>
                updateField('mode', e.target.value)
              }
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-4">

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">
              Start Date
            </label>

            <input
              type="date"
              value={form.start_date}
              onChange={(e) =>
                updateField(
                  'start_date',
                  e.target.value
                )
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">
              End Date
            </label>

            <input
              type="date"
              value={form.end_date}
              onChange={(e) =>
                updateField(
                  'end_date',
                  e.target.value
                )
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">
              Request Deadline
            </label>

            <input
              type="date"
              value={form.deadline}
              onChange={(e) =>
                updateField(
                  'deadline',
                  e.target.value
                )
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Skills / Topics
          </label>

          <input
            value={form.skills_topics}
            onChange={(e) =>
              updateField(
                'skills_topics',
                e.target.value
              )
            }
            placeholder="AI, Machine Learning, Research"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />

          <p className="text-xs text-slate-400 mt-1">
            Separate multiple skills or topics with commas.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {submitting
            ? 'Posting...'
            : 'Post Collaboration'}
        </button>

      </form>
    </div>
  )
}