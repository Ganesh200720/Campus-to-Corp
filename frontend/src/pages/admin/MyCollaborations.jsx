import { useEffect, useState } from 'react'
import { collaborationApi } from '../../services/api'
import {
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  Building2,
} from 'lucide-react'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock3,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    icon: RotateCcw,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

export default function MyCollaborations() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    try {
      setLoading(true)
      setError('')

      const response = await collaborationApi.getMyRequests()
      setRequests(response.data)
    } catch (err) {
      setError('Unable to load your collaboration requests.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">
          Loading your collaboration requests...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Industry Collaboration
          </p>

          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            My Collaboration Requests
          </h1>

          <p className="text-slate-500 mt-1">
            Track collaboration requests sent by your institution.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
            <Building2 size={22} className="text-slate-500" />
          </div>

          <h2 className="font-semibold text-slate-900 mt-4">
            No collaboration requests yet
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Explore industry collaborations and send a request.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {requests.map((request) => {
            const status =
              STATUS_CONFIG[request.status] ||
              STATUS_CONFIG.pending

            const StatusIcon = status.icon

            return (
              <div
                key={request.id}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {request.opportunity_title}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Request ID: #{request.id}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${status.className}`}
                  >
                    <StatusIcon size={14} />
                    {status.label}
                  </span>

                </div>

                <div className="mt-4 bg-slate-50 rounded-xl p-4">

                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Institution Message
                  </p>

                  <p className="text-sm text-slate-700 mt-2">
                    {request.message}
                  </p>

                </div>

                <div className="flex flex-wrap gap-6 mt-4 text-xs text-slate-500">

                  <span>
                    Submitted:{' '}
                    {new Date(
                      request.created_at
                    ).toLocaleDateString()}
                  </span>

                  <span>
                    Last updated:{' '}
                    {new Date(
                      request.updated_at
                    ).toLocaleDateString()}
                  </span>

                </div>

                {request.status === 'accepted' && (
                  <div className="mt-5 flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 size={17} />
                    Collaboration request accepted.
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="mt-5 flex items-center gap-2 text-sm text-red-700">
                    <XCircle size={17} />
                    Collaboration request rejected.
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="mt-5 flex items-center gap-2 text-sm text-amber-700">
                    <Clock3 size={17} />
                    Waiting for the industry partner to respond.
                  </div>
                )}

              </div>
            )
          })}

        </div>
      )}

    </div>
  )
}