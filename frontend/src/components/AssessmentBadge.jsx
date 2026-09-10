import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export default function AssessmentBadge({ detail, status }) {
  if (!detail) return null
  const s = status?.status || 'not_attempted'
  const map = {
    passed: { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700', text: 'Assessment Passed' },
    failed: { icon: XCircle, cls: 'bg-rose-100 text-rose-700', text: 'Assessment Not Passed' },
    not_attempted: { icon: AlertCircle, cls: 'bg-amber-100 text-amber-700', text: 'Assessment Required' },
  }
  const cfg = map[s] || map.not_attempted
  const Icon = cfg.icon
  return (
    <span className={`badge ${cfg.cls} flex items-center gap-1 w-fit`}>
      <Icon size={12} /> {cfg.text}
    </span>
  )
}
