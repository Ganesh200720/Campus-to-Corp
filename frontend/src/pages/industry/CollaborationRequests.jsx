import { useEffect, useState } from 'react'
import { collaborationApi } from '../../services/api'
import {
  CheckCircle2,
  XCircle,
  Clock3,
  User,
  Briefcase,
} from 'lucide-react'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
}

export default function CollaborationRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    try {
      setLoading(true)
      setError('')

      const response =
        await collaborationApi.getIndustryRequests()

      setRequests(response.data)
    } catch (err) {
      setError('Unable to load collaboration requests.')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(requestId, status) {
    try {
      setUpdating(requestId)
      setError('')

      const response =
        await collaborationApi.updateRequestStatus(
          requestId,
          status
        )

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? response.data
            : request
        )
      )
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to update request.'
      )
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">
          Loading collaboration requests...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Industry Collaboration
          </p>

          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Collaboration Requests
          </h1>

          <p className="text-slate-500 mt-1">
            Review and respond to requests from faculty and institutions.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Empty */}
      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
            <Briefcase size={22} className="text-slate-500" />
          </div>

          <h2 className="font-semibold text-slate-900 mt-4">
            No collaboration requests
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Incoming faculty and institution requests will appear here.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {requests.map((request) => {

            const status =
              STATUS_CONFIG[request.status] ||
              STATUS_CONFIG.pending

            return (
              <div
                key={request.id}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >

                {/* Top */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {request.opportunity_title}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <User size={15} />
                      <span>
                        From: {request.applicant_name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>

                </div>

                {/* Message */}
                <div className="mt-4 bg-slate-50 rounded-xl p-4">

                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Applicant Message
                  </p>

                  <p className="text-sm text-slate-700 mt-2">
                    {request.message}
                  </p>

                </div>

                {/* Date */}
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

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex gap-3 mt-5">

                    <button
                      disabled={updating === request.id}
                      onClick={() =>
                        updateStatus(
                          request.id,
                          'accepted'
                        )
                      }
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      Accept
                    </button>

                    <button
                      disabled={updating === request.id}
                      onClick={() =>
                        updateStatus(
                          request.id,
                          'rejected'
                        )
                      }
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>

                  </div>
                )}

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

              </div>
            )
          })}

        </div>
      )}

    </div>
  )
}