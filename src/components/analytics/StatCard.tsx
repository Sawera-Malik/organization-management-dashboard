interface StatCardProps {
  label: string
  value: string | number
  change: string | number
  positive: boolean
  subText?: string
  isLoading?: boolean
}

export function StatCard({
  label,
  value,
  change,
  positive,
  subText = 'vs previous period',
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 animate-pulse">
        <div className="h-3 w-1/3 rounded bg-slate-800" />
        <div className="h-7 w-2/3 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800" />
      </div>
    )
  }

  const changeText = typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700/60 transition-colors">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center gap-0.5 font-semibold rounded-full px-1.5 py-0.5 ${
            positive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {positive ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {changeText}
        </span>
        <span className="text-slate-500">{subText}</span>
      </div>
    </div>
  )
}
