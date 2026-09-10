import { useEffect, useState } from 'react'
import { collaborationApi } from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import {
  Presentation,
  Users,
  GraduationCap,
  CalendarDays,
  MapPin,
  Send,
  CheckCircle2,
} from 'lucide-react'

const OPPORTUNITY_TYPES = [
  {
    value: 'workshop',
    label: 'Workshops & FDPs',
  },
  {
    value: 'mentorship',
    label: 'Industry Mentorship',
  },
]

const TYPE_LABELS = {
  workshop: 'Workshop',
  fdp: 'Faculty Development Program',
  mentorship: 'Industry Mentorship',
}

export default function FacultyOpportunities() {
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [requestedIds, setRequestedIds] = useState(new Set())
  const [tab, setTab] = useState('workshop')
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const load = async () => {
    try {
      setLoading(true)

      const [opportunitiesRes, requestsRes] = await Promise.all([
        collaborationApi.getOpportunities({
          target: 'faculty',
        }),
        collaborationApi.getMyRequests(),
      ])

      const collaborationData = opportunitiesRes.data || []
      const requestData = requestsRes.data || []

      const facultyPrograms = collaborationData.filter(
        (item) =>
          item.collaboration_type === 'workshop' ||
          item.collaboration_type === 'fdp' ||
          item.collaboration_type === 'mentorship'
      )

      setOpportunities(facultyPrograms)

      setRequestedIds(
        new Set(requestData.map((request) => request.opportunity))
      )
    } catch (error) {
      console.error('Failed to load faculty opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = opportunities.filter((item) => {
    if (tab === 'workshop') {
      return (
        item.collaboration_type === 'workshop' ||
        item.collaboration_type === 'fdp'
      )
    }

    return item.collaboration_type === 'mentorship'
  })

  const sendRequest = async () => {
    if (!selected) return

    try {
      setSending(true)

      await collaborationApi.sendRequest(
        selected.id,
        message
      )

      setRequestedIds((current) => {
        const next = new Set(current)
        next.add(selected.id)
        return next
      })

      setSelected(null)
      setMessage('')
    } catch (error) {
      alert(
        error.response?.data?.detail ||
        'Unable to send request.'
      )
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="card p-6">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
            <Presentation
              size={22}
              className="text-brand-600"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Faculty Opportunities
            </h1>

            <p className="text-sm text-slate-500">
              Industry-driven opportunities for faculty and academicians.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-5">

          {OPPORTUNITY_TYPES.map((item) => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                tab === item.value
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-brand-300'
              }`}
            >
              {item.value === 'workshop' ? (
                <GraduationCap
                  size={15}
                  className="inline mr-1.5"
                />
              ) : (
                <Users
                  size={15}
                  className="inline mr-1.5"
                />
              )}

              {item.label}
            </button>
          ))}

        </div>
      </div>

      {/* Opportunities */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Presentation}
          title="Nothing here yet"
          description="Check back soon for new industry opportunities."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">

          {filtered.map((item) => {
            const requested = requestedIds.has(item.id)

            return (
              <div
                key={item.id}
                className="card p-5 hover:shadow-md transition-shadow"
              >

                {/* Type */}
                <div className="flex items-center justify-between gap-3">

                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                    {TYPE_LABELS[item.collaboration_type]}
                  </span>

                  {requested && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                      Requested
                    </span>
                  )}

                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-800 mt-4">
                  {item.title}
                </h3>

                {/* Provider */}
                <p className="text-sm text-slate-500 mt-1">
                  {item.provider_name}
                </p>

                {/* Description */}
                <p className="text-sm text-slate-500 mt-3 line-clamp-3">
                  {item.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mt-4">

                  {item.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={14} />
                      {item.location}
                    </div>
                  )}

                  {item.start_date && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      {item.start_date}
                      {item.end_date &&
                        ` → ${item.end_date}`}
                    </div>
                  )}

                </div>

                {/* Skills */}
                {item.skills_topics && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.skills_topics
                      .split(',')
                      .map((skill) => (
                        <span
                          key={skill}
                          className="badge bg-slate-100 text-slate-600"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* Request button */}
                <button
                  disabled={requested}
                  onClick={() => setSelected(item)}
                  className={`w-full mt-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ${
                    requested
                      ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {requested ? (
                    <>
                      <CheckCircle2 size={16} />
                      Requested
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Apply / Request
                    </>
                  )}
                </button>

              </div>
            )
          })}

        </div>
      )}

      {/* Request Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Request Collaboration
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {selected.title}
              </p>
            </div>

            <div className="p-6">

              <label className="text-sm font-medium text-slate-600 block mb-2">
                Message
              </label>

              <textarea
                rows={4}
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Introduce yourself and explain why you are interested..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200"
              />

            </div>

            <div className="p-6 pt-0 flex justify-end gap-2">

              <button
                onClick={() => {
                  setSelected(null)
                  setMessage('')
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600"
              >
                Cancel
              </button>

              <button
                disabled={sending}
                onClick={sendRequest}
                className="btn-primary px-5 py-2 disabled:opacity-50"
              >
                {sending
                  ? 'Sending...'
                  : 'Send Request'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}