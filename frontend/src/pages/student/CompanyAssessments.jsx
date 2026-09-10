import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import { Building2, Clock, Target, RotateCcw, CheckCircle2, XCircle, AlertCircle, ListChecks } from 'lucide-react'

const STATUS_CFG = {
  passed: { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700', label: 'Passed' },
  failed: { icon: XCircle, cls: 'bg-rose-100 text-rose-700', label: 'Not Passed' },
  not_attempted: { icon: AlertCircle, cls: 'bg-amber-100 text-amber-700', label: 'Not Attempted' },
}

export default function CompanyAssessments() {
  const [tab, setTab] = useState('browse') // browse | results
  const [loading, setLoading] = useState(true)
  const [assessments, setAssessments] = useState([])
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      setLoading(true)
      if (tab === 'browse') {
        const res = await api.get('/skills/company-assessments/')
        setAssessments(res.data)
      } else {
        const res = await api.get('/skills/company-assessments/results/')
        setResults(res.data)
      }
      setLoading(false)
    })()
  }, [tab])

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><Building2 size={20} className="text-brand-600" /><h1 className="text-xl font-bold text-slate-800">Company Assessments</h1></div>
        <p className="text-sm text-slate-500 mb-4">
          Assessments created directly by hiring companies. Some internships/jobs require you to pass one before you can apply —
          those are marked <span className="font-medium text-slate-600">Assessment Required</span> in the listings.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setTab('browse')}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${tab === 'browse' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>
            Browse Assessments
          </button>
          <button onClick={() => setTab('results')}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${tab === 'results' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600'}`}>
            My Results
          </button>
        </div>
      </div>

      {loading ? <LoadingState /> : tab === 'browse' ? (
        assessments.length === 0 ? (
          <EmptyState icon={Building2} title="No company assessments yet" description="Check back once companies publish assessments." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {assessments.map((a) => {
              const status = a.student_status?.status || 'not_attempted'
              const cfg = STATUS_CFG[status]
              const Icon = cfg.icon
              const usedUp = a.student_status?.attempts_used >= a.max_attempts
              return (
                <div key={a.id} className="card p-5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-800">{a.title}</h3>
                      <p className="text-sm text-slate-500">{a.company_name}</p>
                    </div>
                    <span className={`badge ${cfg.cls} flex items-center gap-1 shrink-0`}><Icon size={12} /> {cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{a.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-3">
                    <span className="badge bg-slate-100 text-slate-600 capitalize">{a.assessment_type}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{a.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><Target size={12} />Pass at {a.passing_score}%</span>
                    <span className="flex items-center gap-1"><ListChecks size={12} />{a.question_count} questions</span>
                  </div>
                  {a.student_status?.best_percentage !== null && a.student_status?.best_percentage !== undefined && (
                    <p className="text-xs text-slate-500 mt-2">Best score so far: <span className="font-semibold text-slate-700">{a.student_status.best_percentage}%</span></p>
                  )}
                  <button
                    disabled={usedUp && status !== 'passed'}
                    onClick={() => navigate(`/student/company-assessments/take/${a.id}`)}
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                  >
                    {status === 'passed' ? <>View Result</> : status === 'failed' ? (usedUp ? 'No Attempts Left' : <><RotateCcw size={14} /> Retake Assessment</>) : 'Start Assessment'}
                  </button>
                </div>
              )
            })}
          </div>
        )
      ) : (
        results.length === 0 ? (
          <EmptyState icon={ListChecks} title="No attempts yet" description="Take a company assessment to see your results here." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="p-4 font-medium">Assessment</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Result</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="p-4 font-medium text-slate-700">{r.assessment_title}</td>
                    <td className="p-4 text-slate-500">{r.company_name}</td>
                    <td className="p-4 text-slate-700">{r.percentage}% ({r.scored_marks}/{r.total_marks})</td>
                    <td className="p-4">
                      {r.passed
                        ? <span className="badge bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Passed</span>
                        : <span className="badge bg-rose-100 text-rose-700 flex items-center gap-1 w-fit"><XCircle size={12} /> Failed</span>}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{new Date(r.started_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
