import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { collaborationApi } from '../../services/api'
import LoadingState from '../../components/LoadingState'
import {
  Presentation,
  Users,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  CalendarDays,
  MapPin,
  Building2,
  Clock3,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

const TYPE_LABELS = {
  workshop: 'Workshop',
  fdp: 'Faculty Development Program',
  mentorship: 'Industry Mentorship',
  faculty_internship: 'Faculty Internship',
  industrial_training: 'Industrial Training',
  consultancy: 'Consultancy',
  research_project: 'Research Project',
}

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  withdrawn: 'bg-slate-100 text-slate-500 border-slate-200',
}

const getFirstName = (user) => {
  const name =
    user?.profile?.full_name ||
    user?.full_name ||
    user?.first_name ||
    user?.username ||
    'Faculty'

  return name.split(' ')[0]
}

const formatDate = (date) => {
  if (!date) return 'Date not specified'

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function FacultyDashboard() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [requests, setRequests] = useState([])
  const [demand, setDemand] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          opportunitiesRes,
          requestsRes,
          demandRes,
        ] = await Promise.all([
          collaborationApi.getOpportunities({ target: 'faculty' }),
          collaborationApi.getMyRequests(),
          api.get('/skills/demand/'),
        ])

        setOpportunities(opportunitiesRes.data || [])
        setRequests(requestsRes.data || [])
        setDemand((demandRes.data || []).slice(0, 5))
      } catch (error) {
        console.error('Failed to load faculty dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return <LoadingState />
  }

  /*
   * Faculty dashboard focuses on:
   * - Workshops
   * - FDPs
   * - Industry Mentorship
   *
   * Other collaboration types remain under
   * Faculty → Industry Collaborations.
   */
  const facultyDevelopment = opportunities.filter((item) =>
    ['workshop', 'fdp', 'mentorship'].includes(item.collaboration_type)
  )

  const workshopsAndFdps = opportunities.filter((item) =>
    ['workshop', 'fdp'].includes(item.collaboration_type)
  )

  const mentorships = opportunities.filter(
    (item) => item.collaboration_type === 'mentorship'
  )

  const acceptedRequests = requests.filter(
    (item) => item.status === 'accepted'
  )

  const pendingRequests = requests.filter(
    (item) => item.status === 'pending'
  )

  const latestOpportunities = facultyDevelopment.slice(0, 4)
  const recentRequests = requests.slice(0, 4)

  const profile = user?.profile || {}

  return (
    <div className="space-y-7 pb-8">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-7 py-8 text-white shadow-lg md:px-9 md:py-10">

        {/* Decorative background */}
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-2xl">

            {/* Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Faculty & Industry Hub
            </div>

            {/* Greeting */}
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Good morning, {getFirstName(user)} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 md:text-base">
              Discover industry-led learning opportunities, build meaningful
              connections, and stay aligned with the skills industry needs.
            </p>

            {/* Profile tags */}
            {(profile.designation || profile.department) && (
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-indigo-100">

                {profile.designation && (
                  <span className="rounded-full bg-white/10 px-3 py-1.5">
                    {profile.designation}
                  </span>
                )}

                {profile.department && (
                  <span className="rounded-full bg-white/10 px-3 py-1.5">
                    {profile.department}
                  </span>
                )}

              </div>
            )}

          </div>

          {/* CTA */}
          <Link
            to="/faculty/opportunities"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Explore Opportunities

            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>

        </div>
      </section>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Workshops */}
        <Link
          to="/faculty/opportunities"
          className="block"
        >
          <StatCard
            icon={<Presentation className="h-5 w-5" />}
            label="Workshops & FDPs"
            value={workshopsAndFdps.length}
            description="Available opportunities"
            iconStyle="bg-indigo-50 text-indigo-600"
          />
        </Link>

        {/* Mentorship */}
        <Link
          to="/faculty/opportunities"
          className="block"
        >
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Industry Mentorships"
            value={mentorships.length}
            description="Ways to connect with industry"
            iconStyle="bg-violet-50 text-violet-600"
          />
        </Link>

        {/* Requests */}
        <Link
          to="/faculty/my-collaborations"
          className="block"
        >
          <StatCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="My Requests"
            value={requests.length}
            description={`${pendingRequests.length} awaiting response`}
            iconStyle="bg-amber-50 text-amber-600"
          />
        </Link>

        {/* Accepted */}
        <Link
          to="/faculty/my-collaborations"
          className="block"
        >
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Accepted"
            value={acceptedRequests.length}
            description="Successful collaborations"
            iconStyle="bg-emerald-50 text-emerald-600"
          />
        </Link>

      </section>


      {/* =====================================================
          OPPORTUNITIES + REQUESTS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ===================================================
            OPPORTUNITIES
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

          {/* Header */}
          <div className="mb-5 flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Opportunities for You
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Latest workshops, FDPs and industry mentorship opportunities.
              </p>

            </div>

            <Link
              to="/faculty/opportunities"
              className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:flex"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>

          </div>


          {/* Opportunity cards */}
          {latestOpportunities.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">

              <Presentation className="mx-auto h-9 w-9 text-slate-300" />

              <p className="mt-3 font-medium text-slate-600">
                No opportunities available yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Check back later for new industry opportunities.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {latestOpportunities.map((item) => (
                <OpportunityCard
                  key={item.id}
                  opportunity={item}
                />
              ))}

            </div>

          )}


          {/* Mobile button */}
          <Link
            to="/faculty/opportunities"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 sm:hidden"
          >
            Explore all opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>

        </section>


        {/* ===================================================
            RECENT REQUESTS
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Recent Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your collaboration requests.
              </p>

            </div>

            <Link
              to="/faculty/my-collaborations"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>

          </div>


          {recentRequests.length === 0 ? (

            <div className="rounded-xl bg-slate-50 py-10 text-center">

              <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No requests yet
              </p>

              <Link
                to="/faculty/opportunities"
                className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:underline"
              >
                Find an opportunity
              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {recentRequests.map((request) => (

                <Link
                  key={request.id}
                  to="/faculty/my-collaborations"
                  className="block rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {request.opportunity_title ||
                          request.title ||
                          'Collaboration Opportunity'}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {request.provider_name || 'Industry Partner'}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                        STATUS_STYLES[request.status] ||
                        STATUS_STYLES.pending
                      }`}
                    >
                      {request.status}
                    </span>

                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDate(
                      request.created_at ||
                      request.requested_at
                    )}
                  </div>

                </Link>

              ))}

            </div>

          )}


          {requests.length > 4 && (
            <Link
              to="/faculty/my-collaborations"
              className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all requests
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

        </section>

      </div>


      {/* =====================================================
          INDUSTRY SKILL DEMAND
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Industry Skill Demand
              </h2>

              <p className="text-sm text-slate-500">
                Skills currently in demand across industry opportunities.
              </p>

            </div>

          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Live demand insights
          </span>

        </div>


        {demand.length === 0 ? (

          <div className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">
            Skill demand data is not available yet.
          </div>

        ) : (

          <div className="space-y-5">

            {demand.map((skill, index) => {

              const percentage = Math.min(
                100,
                Math.max(
                  0,
                  Number(
                    skill.demand_percent ??
                    skill.percentage ??
                    skill.demand ??
                    0
                  )
                )
              )

              return (
                <div
                  key={
                    skill.id ||
                    skill.skill_name ||
                    index
                  }
                >

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-sm font-semibold text-slate-700">
                      {skill.skill_name ||
                        skill.name ||
                        skill.skill ||
                        'Skill'}
                    </span>

                    <span className="text-sm font-bold text-slate-500">
                      {Math.round(percentage)}%
                    </span>

                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              )
            })}

          </div>

        )}

      </section>


      {/* =====================================================
          ACTION CARDS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* Faculty Opportunities */}
        <Link
          to="/faculty/opportunities"
          className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >

          <div className="relative z-10">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Presentation className="h-5 w-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Explore Faculty Opportunities
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Find workshops, FDPs and industry mentorship programs that can
              strengthen your professional development.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600">
              Browse opportunities
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>

          </div>

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-100/70" />

        </Link>


        {/* Industry Collaborations */}
        <Link
          to="/faculty/collaborations"
          className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >

          <div className="relative z-10">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <Building2 className="h-5 w-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Industry Collaborations
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Explore research, consultancy, internships, industrial training
              and other long-term industry collaboration opportunities.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-600">
              Explore collaborations
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>

          </div>

          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-100/70" />

        </Link>

      </section>

    </div>
  )
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  iconStyle,
}) {
  return (
    <div className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900 transition group-hover:text-indigo-600">
          {value}
        </span>

      </div>

      <div className="mt-4">

        <p className="font-semibold text-slate-800">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </div>
  )
}


/* =========================================================
   OPPORTUNITY CARD
========================================================= */

function OpportunityCard({ opportunity }) {
  const type = opportunity.collaboration_type

  return (
    <Link
      to="/faculty/opportunities"
      className="group block rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
    >

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

          {type === 'mentorship' ? (
            <Users className="h-5 w-5" />
          ) : (
            <Presentation className="h-5 w-5" />
          )}

        </div>

        <span className="max-w-[70%] rounded-full bg-indigo-50 px-2.5 py-1 text-center text-[11px] font-semibold text-indigo-600">
          {TYPE_LABELS[type] || type}
        </span>

      </div>


      {/* Title */}
      <h3 className="mt-4 line-clamp-2 text-base font-bold text-slate-900">
        {opportunity.title || 'Industry Opportunity'}
      </h3>


      {/* Provider */}
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">

        <Building2 className="h-3.5 w-3.5" />

        <span className="truncate">
          {opportunity.provider_name || 'Industry Partner'}
        </span>

      </p>


      {/* Description */}
      {opportunity.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">
          {opportunity.description}
        </p>
      )}


      {/* Metadata */}
      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">

        {opportunity.start_date && (
          <div className="flex items-center gap-2 text-xs text-slate-500">

            <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />

            {formatDate(opportunity.start_date)}

          </div>
        )}

        {opportunity.location && (
          <div className="flex items-center gap-2 text-xs text-slate-500">

            <MapPin className="h-3.5 w-3.5 text-indigo-500" />

            <span className="truncate">
              {opportunity.location}
            </span>

          </div>
        )}

      </div>


      {/* Click indicator */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">

        <span>
          View opportunity
        </span>

        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />

      </div>

    </Link>
  )
}