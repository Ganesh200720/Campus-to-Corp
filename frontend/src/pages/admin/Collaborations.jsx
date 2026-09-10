import { useEffect, useState } from 'react'
import { collaborationApi } from '../../services/api'
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Send,
  X,
} from 'lucide-react'

const TYPE_LABELS = {
  mentorship: 'Mentorship',
  workshop: 'Workshop',
  guest_lecture: 'Guest Lecture',
  innovation_challenge: 'Innovation Challenge',
  live_project: 'Live Industry Project',
}

const MODE_LABELS = {
  online: 'Online',
  offline: 'Offline',
  hybrid: 'Hybrid',
}

export default function Collaborations() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadOpportunities()
  }, [])

  async function loadOpportunities() {
    try {
      setLoading(true)
      setError('')

      const response = await collaborationApi.getOpportunities({
        target: 'institution',
      })

      setOpportunities(response.data)
    } catch (err) {
      setError('Unable to load collaboration opportunities.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = opportunities.filter((item) => {
    const text = `${item.title} ${item.description} ${item.skills_topics}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  async function sendRequest() {
    if (!selected || !message.trim()) return

    try {
      setSending(true)
      setError('')

      await collaborationApi.sendRequest(
        selected.id,
        message.trim()
      )

      setSuccess('Collaboration request sent successfully.')
      setMessage('')

      setTimeout(() => {
        setSelected(null)
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to send collaboration request.'
      )
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">
          Loading opportunities...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <div>
        <p className="text-sm font-medium text-brand-600">
          Industry Collaboration
        </p>

        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Industry Collaboration Opportunities
        </h1>

        <p className="text-slate-500 mt-1">
          Connect your institution with industry partners through meaningful collaboration.
        </p>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search opportunities, skills or topics..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
          {success}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-500">
            No institution collaboration opportunities found.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >

              <div className="flex items-start justify-between gap-3">

                <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold">
                  {TYPE_LABELS[item.collaboration_type] ||
                    item.collaboration_type}
                </span>

                <span className="text-xs text-slate-500">
                  {MODE_LABELS[item.mode] || item.mode}
                </span>

              </div>

              <h2 className="font-semibold text-slate-900 text-lg mt-4">
                {item.title}
              </h2>

              <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                {item.description}
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-500">

                {item.provider_name && (
                  <div>
                    <span className="font-medium text-slate-700">
                      Provider:
                    </span>{' '}
                    {item.provider_name}
                  </div>
                )}

                {item.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={15} />
                    {item.location}
                  </div>
                )}

                {item.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={15} />
                    Starts {item.start_date}
                  </div>
                )}

                {item.deadline && (
                  <div className="flex items-center gap-2">
                    <Clock size={15} />
                    Deadline {item.deadline}
                  </div>
                )}

              </div>

              {item.skills_topics && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.skills_topics
                    .split(',')
                    .map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                </div>
              )}

              <button
                onClick={() => {
                  setSelected(item)
                  setMessage('')
                  setError('')
                }}
                className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700"
              >
                <Send size={16} />
                Request Collaboration
              </button>

            </div>
          ))}

        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            <div className="flex items-center justify-between p-5 border-b border-slate-200">

              <div>
                <h2 className="font-semibold text-slate-900">
                  Request Collaboration
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selected.title}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-5">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Introduce your institution and explain why you are interested..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-200 resize-none"
              />

              <button
                onClick={sendRequest}
                disabled={sending || !message.trim()}
                className="w-full mt-4 px-4 py-3 rounded-xl bg-brand-600 text-white font-medium disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}