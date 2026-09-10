export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
      <div className="w-5 h-5 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin mr-3" />
      {label}
    </div>
  )
}
