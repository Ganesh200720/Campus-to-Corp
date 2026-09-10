import { useEffect, useMemo, useState } from 'react'
import {
  BriefcaseBusiness,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  Mail,
  UserCircle2,
  ExternalLink,
  Search,
  ArrowUpDown,
  MessageSquareText,
  AlertCircle,
  Inbox,
  Sparkles,
} from 'lucide-react'
import { collaborationApi } from '../../services/api'

const typeLabels = {
  faculty_internship: 'Faculty Internship',
  industrial_training: 'Industrial Training',
  fdp: 'Faculty Development Program',
  consultancy: 'Consultancy',
  research_project: 'Research Project',
  mentorship: 'Mentorship',
  workshop: 'Workshop',
  guest_lecture: 'Guest Lecture',
  innovation_challenge: 'Innovation Challenge',
  live_project: 'Live Project',
}

const REQUESTS_PER_PAGE = 5

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
]

export default function MyCollaborations() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [requests, setRequests] = useState([])
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Modal UI State
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)

  const loadCollaborations = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await collaborationApi.getMyOpportunities()
      setOpportunities(response.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load your collaborations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollaborations()
  }, [])

  const viewRequests = async (opportunity) => {
    try {
      setSelectedOpportunity(opportunity)
      setLoadingRequests(true)
      setRequests([])

      setFilter('all')
      setSearch('')
      setSortAsc(false)
      setPage(1)

      const response = await collaborationApi.getIndustryRequests()

      const opportunityRequests = response.data.filter(
        (request) => request.opportunity === opportunity.id
      )

      setRequests(opportunityRequests)
    } catch (err) {
      console.error(err)
      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }

  const closeModal = () => {
    setSelectedOpportunity(null)
    setRequests([])
    setFilter('all')
    setSearch('')
    setSortAsc(false)
    setPage(1)
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setActionLoadingId(requestId)

      await collaborationApi.updateRequestStatus(requestId, newStatus)

      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestId ? { ...item, status: newStatus } : item
        )
      )

      await loadCollaborations()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  /* Derived data calculations */
  const filteredRequests = useMemo(() => {
    let list = [...requests]

    if (filter !== 'all') {
      list = list.filter((r) => r.status === filter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((r) => {
        const name = (r.applicant_name || '').toLowerCase()
        const email = (r.applicant_email || '').toLowerCase()
        const msg = (r.message || '').toLowerCase()
        return name.includes(q) || email.includes(q) || msg.includes(q)
      })
    }

    list.sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id))

    return list
  }, [requests, filter, search, sortAsc])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE)
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * REQUESTS_PER_PAGE
    return filteredRequests.slice(start, start + REQUESTS_PER_PAGE)
  }, [filteredRequests, page])

  const statusCounts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }
  }, [requests])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading your collaborations...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Collaborations
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
              {opportunities.length} Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage collaborations you have posted and process incoming applicant requests.
          </p>
        </div>

        <button
          onClick={loadCollaborations}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50/80 text-red-700 border border-red-200/80 rounded-xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && opportunities.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-2xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            <BriefcaseBusiness className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            No collaborations posted yet
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5">
            Post your first collaboration opportunity to start receiving requests from partners and applicants.
          </p>
        </div>
      )}

      {/* Collaboration cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="group bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  {typeLabels[opportunity.collaboration_type] || opportunity.collaboration_type}
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    opportunity.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : opportunity.status === 'closed'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      opportunity.status === 'published'
                        ? 'bg-emerald-500'
                        : opportunity.status === 'closed'
                        ? 'bg-rose-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  {opportunity.status}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                {opportunity.title}
              </h2>

              <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {opportunity.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                {opportunity.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{opportunity.location}</span>
                  </div>
                )}

                {opportunity.start_date && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span>{opportunity.start_date}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="grid grid-cols-4 gap-2 mt-6 p-2 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="p-2 text-center rounded-lg bg-white shadow-2xs border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Total</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {opportunity.total_requests || 0}
                  </p>
                </div>

                <div className="p-2 text-center rounded-lg bg-white shadow-2xs border border-slate-100">
                  <p className="text-xs font-medium text-amber-600 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </p>
                  <p className="text-base font-extrabold text-amber-700 mt-0.5">
                    {opportunity.pending_requests || 0}
                  </p>
                </div>

                <div className="p-2 text-center rounded-lg bg-white shadow-2xs border border-slate-100">
                  <p className="text-xs font-medium text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Accepted
                  </p>
                  <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                    {opportunity.accepted_requests || 0}
                  </p>
                </div>

                <div className="p-2 text-center rounded-lg bg-white shadow-2xs border border-slate-100">
                  <p className="text-xs font-medium text-rose-600 flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Rejected
                  </p>
                  <p className="text-base font-extrabold text-rose-700 mt-0.5">
                    {opportunity.rejected_requests || 0}
                  </p>
                </div>
              </div>

              <button
                className="w-full mt-4 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-sm text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-200 inline-flex items-center justify-center gap-2 group/btn shadow-2xs active:scale-[0.99]"
                onClick={() => viewRequests(opportunity)}
              >
                <Users className="w-4 h-4 text-slate-500 group-hover/btn:text-white transition-colors" />
                <span>View Requests</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Requests Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-10">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
                  Collaboration Requests
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedOpportunity.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {requests.length} total request{requests.length !== 1 ? 's' : ''} •{' '}
                  <span className="font-semibold text-amber-700">{statusCounts.pending} pending</span>
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar */}
            {!loadingRequests && requests.length > 0 && (
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {FILTERS.map(({ key, label }) => {
                      const active = filter === key
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setFilter(key)
                            setPage(1)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                            active
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <span>{label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                              active
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {statusCounts[key]}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative flex-1 md:w-52">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value)
                          setPage(1)
                        }}
                        placeholder="Search applicants..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    {/* Sort */}
                    <button
                      onClick={() => setSortAsc((v) => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition shadow-2xs shrink-0"
                      title={sortAsc ? 'Oldest first' : 'Newest first'}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sortAsc ? 'Oldest' : 'Newest'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {loadingRequests ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <RefreshCw className="w-7 h-7 animate-spin text-indigo-600 mb-2" />
                  <p className="text-xs font-medium">Fetching applications...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    {requests.length === 0
                      ? 'No faculty or institution has requested this collaboration yet.'
                      : 'Try clearing your search query or switching active status filters.'}
                  </p>
                </div>
              ) : (
                paginatedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-slate-200/90 rounded-xl p-4 bg-white hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 overflow-hidden">
                          {request.applicant_avatar ? (
                            <img
                              src={request.applicant_avatar}
                              alt={request.applicant_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserCircle2 className="w-6 h-6" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {request.applicant_name || 'Applicant'}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
                            <span>Request #{request.id}</span>
                            {request.applicant_email && (
                              <a
                                href={`mailto:${request.applicant_email}`}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
                              >
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate">{request.applicant_email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${
                          request.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : request.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {request.message && (
                      <div className="mt-3 bg-slate-50/80 rounded-lg p-3 border border-slate-100/80">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                          <MessageSquareText className="w-3.5 h-3.5 text-slate-400" />
                          Message
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {request.message}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      {request.applicant_profile_url && (
                        <a
                          href={request.applicant_profile_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          View Profile
                        </a>
                      )}

                      {request.status === 'pending' && (
                        <>
                          <button
                            disabled={actionLoadingId === request.id}
                            onClick={() => handleStatusUpdate(request.id, 'accepted')}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-2xs inline-flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {actionLoadingId === request.id ? 'Updating...' : 'Accept'}
                          </button>

                          <button
                            disabled={actionLoadingId === request.id}
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-rose-600 text-xs font-semibold hover:bg-rose-50 hover:border-rose-200 disabled:opacity-60 transition shadow-2xs inline-flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Footer */}
            {!loadingRequests && filteredRequests.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
                <p>
                  Showing{' '}
                  <span className="font-bold text-slate-700">
                    {(page - 1) * REQUESTS_PER_PAGE + 1}
                  </span>
                  –
                  <span className="font-bold text-slate-700">
                    {Math.min(page * REQUESTS_PER_PAGE, filteredRequests.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-bold text-slate-700">
                    {filteredRequests.length}
                  </span>
                </p>

                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    if (
                      totalPages > 5 &&
                      Math.abs(pageNum - page) > 2 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages
                    ) {
                      return null
                    }
                    const active = page === pageNum
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-7 h-7 px-2 rounded-lg text-xs font-semibold transition ${
                          active
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}