export default function MatchBadge({ percent }) {
  if (percent === null || percent === undefined) return null
  const color = percent >= 80 ? 'bg-emerald-100 text-emerald-700'
    : percent >= 55 ? 'bg-amber-100 text-amber-700'
    : 'bg-rose-100 text-rose-700'
  return <span className={`badge ${color}`}>{Math.round(percent)}% Match</span>
}
