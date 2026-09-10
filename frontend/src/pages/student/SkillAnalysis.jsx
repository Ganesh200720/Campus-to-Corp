import { useEffect, useMemo, useState } from 'react'

import api from '../../services/api'

import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'

import {
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
} from 'lucide-react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export default function SkillAnalysis() {
  const [myScores, setMyScores] = useState([])
  const [roles, setRoles] = useState([])
  const [role, setRole] = useState('')
  const [gap, setGap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scores, roleList] = await Promise.all([
          api.get('/skills/my-scores/'),
          api.get('/skills/roles/'),
        ])

        const scoresData = scores.data || []
        const rolesData = roleList.data || []

        setMyScores(scoresData)
        setRoles(rolesData)

        const defaultRole = rolesData[0]
        setRole(defaultRole || '')

        if (defaultRole) {
          const response = await api.get(
            `/skills/gap/${encodeURIComponent(defaultRole)}/`
          )
          setGap(response.data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const changeRole = async (selectedRole) => {
    setRole(selectedRole)
    setLoading(true)

    try {
      const response = await api.get(
        `/skills/gap/${encodeURIComponent(selectedRole)}/`
      )

      setGap(response.data)
    } finally {
      setLoading(false)
    }
  }

  const normalizedScores = useMemo(() => {
    return [...myScores]
      .map((skill) => ({
        ...skill,
        score: Math.max(0, Math.min(100, Number(skill.score) || 0)),
      }))
      .sort((a, b) => b.score - a.score)
  }, [myScores])

  const averageScore = useMemo(() => {
    if (!normalizedScores.length) return 0

    const total = normalizedScores.reduce(
      (sum, skill) => sum + skill.score,
      0
    )

    return Math.round(total / normalizedScores.length)
  }, [normalizedScores])

  const strengths = useMemo(() => {
    return normalizedScores
      .filter((skill) => skill.score >= 70)
      .slice(0, 3)
  }, [normalizedScores])

  const weaknesses = useMemo(() => {
    return [...normalizedScores]
      .filter((skill) => skill.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
  }, [normalizedScores])

  const chartData = useMemo(() => {
    return normalizedScores.map((skill) => ({
      name: skill.skill_name,
      score: Math.round(skill.score),
    }))
  }, [normalizedScores])

  if (loading && !gap && myScores.length === 0) {
    return <LoadingState label="Analyzing your skills..." />
  }

  if (myScores.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No skill data yet"
        description="Take the Skill Assessment first to generate your skill profile and gap analysis."
      />
    )
  }

  const statusColor = {
    Strong: 'bg-emerald-500',
    'Minor Gap': 'bg-amber-500',
    'Major Gap': 'bg-rose-500',
  }

  const statusBadge = {
    Strong: 'bg-emerald-100 text-emerald-700',
    'Minor Gap': 'bg-amber-100 text-amber-700',
    'Major Gap': 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <BarChart3 size={21} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Skill Analysis
                </h1>

                <p className="text-sm text-slate-500">
                  Understand your strengths and identify the skills you need to improve.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-5 py-3 rounded-xl bg-brand-50 border border-brand-100">
              <p className="text-xs text-slate-500">
                Overall Score
              </p>

              <p className="text-2xl font-bold text-brand-600">
                {averageScore}%
              </p>
            </div>

            <div className="text-center px-5 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500">
                Skills Assessed
              </p>

              <p className="text-2xl font-bold text-slate-800">
                {normalizedScores.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Role */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-brand-600" />

          <div>
            <h2 className="font-semibold text-slate-800">
              Target Career Role
            </h2>

            <p className="text-xs text-slate-500">
              Compare your skills against industry requirements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => changeRole(r)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                role === r
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Strengths */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Your Strengths
              </h2>

              <p className="text-xs text-slate-500">
                Skills where you are performing strongly.
              </p>
            </div>
          </div>

          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((skill) => (
                <div
                  key={skill.id || skill.skill_name}
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">
                      {skill.skill_name}
                    </span>

                    <span className="font-bold text-emerald-600">
                      {Math.round(skill.score)}%
                    </span>
                  </div>

                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
              Complete more skill assessments to identify your strongest areas.
            </div>
          )}
        </div>

        {/* Weaknesses */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingDown size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Areas to Improve
              </h2>

              <p className="text-xs text-slate-500">
                Skills that need more attention.
              </p>
            </div>
          </div>

          {weaknesses.length > 0 ? (
            <div className="space-y-3">
              {weaknesses.map((skill) => (
                <div
                  key={skill.id || skill.skill_name}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">
                      {skill.skill_name}
                    </span>

                    <span className="font-bold text-rose-600">
                      {Math.round(skill.score)}%
                    </span>
                  </div>

                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-4">
              Great job! You currently have no major weak areas.
            </div>
          )}
        </div>
      </div>

      {/* Skill Percentage Graph */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-slate-800">
              Skill Performance
            </h2>

            <p className="text-sm text-slate-500">
              Your current score for every assessed skill.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            Current %
          </div>
        </div>

        <div className="w-full h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 55,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                interval={0}
                height={70}
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                formatter={(value) => [`${value}%`, 'Score']}
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              />

              <Bar
                dataKey="score"
                radius={[6, 6, 0, 0]}
                fill="#6366f1"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role Gap Analysis */}
      {gap && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-800">
                {gap.role} Skill Gap
              </h2>

              <p className="text-sm text-slate-500">
                Your current level compared with the required level.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {gap.gap_analysis.map((g) => (
              <div key={g.skill}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    {g.skill}
                  </span>

                  <span className={`badge ${statusBadge[g.status]}`}>
                    {g.status}
                  </span>
                </div>

                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-slate-300"
                    style={{ width: `${g.required}%` }}
                  />

                  <div
                    className={`absolute h-full ${statusColor[g.status]}`}
                    style={{ width: `${g.current}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>
                    Current: {g.current}%
                  </span>

                  <span>
                    Required: {g.required}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {gap.gap_analysis.some(
            (g) => g.status === 'Major Gap'
          ) && (
            <div className="mt-5 flex items-start gap-2 bg-amber-50 text-amber-800 text-sm rounded-xl p-3">
              <AlertTriangle
                size={16}
                className="shrink-0 mt-0.5"
              />

              <span>
                Focus on closing your Major Gap skills.
                Check the Learning Hub for recommended programs.
              </span>
            </div>
          )}
        </div>
      )}

      {/* All Skills */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Award size={18} className="text-brand-600" />

          <div>
            <h2 className="font-semibold text-slate-800">
              All Skills
            </h2>

            <p className="text-xs text-slate-500">
              Complete breakdown of your current skill scores.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          {normalizedScores.map((skill) => (
            <div key={skill.id || skill.skill_name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600">
                  {skill.skill_name}

                  <span className="text-xs text-slate-400 ml-1">
                    ({skill.category})
                  </span>
                </span>

                <span className="font-semibold text-slate-800">
                  {Math.round(skill.score)}%
                </span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${skill.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}