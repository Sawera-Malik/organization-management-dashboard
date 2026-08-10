import type { DistributionPoint } from '../../types/analytics'

interface ProjectDistributionProps {
  data: DistributionPoint[]
  isLoading?: boolean
}

export function ProjectDistribution({ data, isLoading = false }: ProjectDistributionProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-800" />
        <div className="flex justify-center py-4">
          <div className="h-28 w-28 rounded-full border-4 border-slate-800" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-800" />
          <div className="h-3 w-2/3 rounded bg-slate-800" />
        </div>
      </div>
    )
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  if (!data || data.length === 0 || totalCount === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between h-72">
        <div>
          <h3 className="font-semibold text-white">Project Distribution</h3>
          <p className="text-xs text-slate-500">Projects by lifecycle status</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <svg className="h-10 w-10 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">No project data available</p>
          <p className="text-xs text-slate-600 mt-1">Add projects to this organization to populate this widget.</p>
        </div>
      </div>
    )
  }

  const radius = 15.915494
  const strokeWidth = 3.5

  let accumulatedPercentage = 0

  const segments = data.map((item) => {
    const percentage = Math.round((item.count / totalCount) * 100)
    const dashArray = `${percentage} ${100 - percentage}`
    const dashOffset = -accumulatedPercentage
    accumulatedPercentage += percentage
    return {
      ...item,
      percentage,
      dashArray,
      dashOffset,
    }
  })

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-semibold text-white">Project Distribution</h3>
        <p className="text-xs text-slate-500">Projects by lifecycle status</p>
      </div>

      <div className="relative mx-auto my-6 flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {segments.map((segment, index) => {
            let strokeColor = '#64748b' // default slate
            if (segment.color.includes('emerald')) strokeColor = '#10b981'
            if (segment.color.includes('indigo')) strokeColor = '#6366f1'
            if (segment.color.includes('amber')) strokeColor = '#f59e0b'
            if (segment.color.includes('slate')) strokeColor = '#64748b'

            return (
              <circle
                key={index}
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white tracking-tight">{totalCount}</span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Projects</span>
        </div>
      </div>

      <ul className="space-y-2">
        {segments.map((item, index) => {
          let dotColor = 'bg-slate-500'
          if (item.color.includes('emerald')) dotColor = 'bg-emerald-500'
          if (item.color.includes('indigo')) dotColor = 'bg-indigo-500'
          if (item.color.includes('amber')) dotColor = 'bg-amber-500'

          return (
            <li key={index} className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2 text-slate-400">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColor} border border-slate-900`} />
                {item.status}
              </span>
              <span className="text-slate-200">
                {item.count} ({item.percentage}%)
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
