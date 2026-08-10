import type { AnalyticsActivity } from '../../types/analytics'

interface RecentActivityProps {
  activities: AnalyticsActivity[]
  isLoading?: boolean
}

export function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-800" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="h-9 w-9 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded bg-slate-800" />
                <div className="h-2 w-1/4 rounded bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <svg className="h-10 w-10 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">No recent activities found</p>
          <p className="text-xs text-slate-600 mt-1">Activities will appear here once users perform actions in this workspace.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
      <div className="divide-y divide-slate-800">
        {activities.map((act) => {
          let dotColor = 'bg-indigo-500'
          if (act.avatarColor.includes('blue')) dotColor = 'bg-blue-500'
          if (act.avatarColor.includes('amber')) dotColor = 'bg-amber-500'
          if (act.avatarColor.includes('emerald')) dotColor = 'bg-emerald-500'

          return (
            <div key={act.id} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${dotColor}`}>
                {act.avatar}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-white hover:text-indigo-400 transition-colors cursor-pointer">
                    {act.user}
                  </span>{' '}
                  {act.action}{' '}
                  <span className="font-medium text-indigo-400 hover:underline cursor-pointer">
                    "{act.target}"
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {act.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
