import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  Clock,
  Send
} from 'lucide-react'

const STATUS_STEPS = [
  'applied',
  'under_review',
  'shortlisted',
  'interview',
  'selected'
]

const STATUS_LABEL = {
  invited: 'Invitation',
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  accepted: 'Accepted',
  selected: 'Selected',
  rejected: 'Rejected'
}

const STATUS_COLOR = {
  invited: 'bg-violet-100 text-violet-700',
  applied: 'bg-slate-100 text-slate-600',
  under_review: 'bg-sky-100 text-sky-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-violet-100 text-violet-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  selected: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

export default function MyApplications() {
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState([])
  const [respondingId, setRespondingId] = useState(null)

  const loadApplications = async () => {
    try {
      const res = await api.get('/opportunities/my-applications/')
      setApps(res.data)
    } catch (e) {
      console.error('Failed to load applications:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const respondToInvitation = async (applicationId, response) => {
    setRespondingId(applicationId)

    try {
      const res = await api.patch(
        `/opportunities/my-applications/${applicationId}/respond/`,
        { response }
      )

      setApps((current) =>
        current.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: res.data.status,
              }
            : app
        )
      )
    } catch (e) {
      console.error('Failed to respond to invitation:', e)

      const message =
        e.response?.data?.detail ||
        'Failed to respond to invitation.'

      window.alert(message)
    } finally {
      setRespondingId(null)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <ListChecks size={20} className="text-brand-600" />

          <h1 className="text-xl font-bold text-slate-800">
            My Applications
          </h1>
        </div>

        <p className="text-sm text-slate-500">
          Track the status of every internship and job you've applied to,
          and respond to invitations from industry.
        </p>
      </div>

      {apps.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No applications yet"
          description="Browse Internships or Jobs to apply."
        />
      ) : (
        <div className="space-y-4">
          {apps.map((a) => {
            const invited = a.status === 'invited'
            const rejected = a.status === 'rejected'
            const accepted = a.status === 'accepted'

            const activeStepIdx = STATUS_STEPS.indexOf(a.status)

            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {a.internship_title || a.job_title}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {a.company_name} · {a.internship ? 'Internship' : 'Job'}
                    </p>
                  </div>

                  <span
                    className={`badge ${
                      STATUS_COLOR[a.status] ||
                      'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {STATUS_LABEL[a.status] || a.status}
                  </span>
                </div>

                {invited ? (
                  <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                        <Send size={17} />
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-800">
                          You've been invited!
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          This company has invited you to be considered for
                          this opportunity.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() =>
                              respondToInvitation(a.id, 'accept')
                            }
                            disabled={respondingId === a.id}
                            className="btn-primary flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 size={15} />

                            {respondingId === a.id
                              ? 'Processing...'
                              : 'Accept Invitation'}
                          </button>

                          <button
                            onClick={() =>
                              respondToInvitation(a.id, 'reject')
                            }
                            disabled={respondingId === a.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-white text-rose-600 text-sm font-medium hover:bg-rose-50 disabled:opacity-50"
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!rejected && !accepted && (
                      <div className="flex items-center gap-1">
                        {STATUS_STEPS.map((s, idx) => (
                          <div
                            key={s}
                            className="flex items-center gap-1 flex-1"
                          >
                            <div
                              className={`h-1.5 flex-1 rounded-full ${
                                idx <= activeStepIdx
                                  ? 'bg-brand-600'
                                  : 'bg-slate-100'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {accepted && (
                      <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3">
                        <CheckCircle2
                          size={20}
                          className="text-emerald-600"
                        />

                        <div>
                          <p className="font-semibold text-sm text-emerald-800">
                            Invitation accepted
                          </p>

                          <p className="text-xs text-emerald-700 mt-0.5">
                            The company can now continue with the hiring
                            process.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between text-xs text-slate-400 mt-4">
                  <span className="flex items-center gap-1">
                    {invited && <Clock size={12} />}
                    {invited ? 'Invited' : 'Applied'}{' '}
                    {new Date(a.applied_at).toLocaleDateString()}
                  </span>

                  <span>
                    Match score: {Math.round(a.match_score)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}