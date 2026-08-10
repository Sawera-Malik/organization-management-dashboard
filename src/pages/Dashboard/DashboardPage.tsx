import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { RoleBadge } from '../../components/ui/RoleBadge'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useOrganization } from '../../hooks/useOrganization'
import { getProjects, getTasks, getUsers } from '../../services/dbService'
import { StatCard } from '../../components/analytics/StatCard'
import { RevenueChart } from '../../components/analytics/RevenueChart'
import { ProjectDistribution } from '../../components/analytics/ProjectDistribution'
import { ActivityChart } from '../../components/analytics/ActivityChart'
import { RecentActivity } from '../../components/analytics/RecentActivity'
import { getAnalytics } from '../../services/analyticsService'
import type { AnalyticsData } from '../../types/analytics'

interface WidgetConfig {
  id: string
  title: string
  visible: boolean
  colSpan: 1 | 2 | 3
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'kpis', title: 'KPI Stat Cards', visible: true, colSpan: 3 },
  { id: 'revenue', title: 'Revenue Chart', visible: true, colSpan: 2 },
  { id: 'donut', title: 'Project Status Donut', visible: true, colSpan: 1 },
  { id: 'users', title: 'Active Users Bar Chart', visible: true, colSpan: 2 },
  { id: 'activity', title: 'Recent Activity Feed', visible: true, colSpan: 1 },
]

export function DashboardPage() {
  const { session } = useAuth()
  const { hasPermission } = usePermissions()
  const { activeOrganization, isSwitching } = useOrganization()
  const user = session?.user

  const orgId = activeOrganization?.id || 'org-1'

  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  const [liveMetrics, setLiveMetrics] = useState({
    projectsCount: 0,
    tasksCompleted: 0,
    teamSize: 0,
  })

  useEffect(() => {
    const key = `dashboard_layout_${orgId}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setWidgets(JSON.parse(saved))
      } catch {
        setWidgets(DEFAULT_WIDGETS)
      }
    } else {
      setWidgets(DEFAULT_WIDGETS)
    }
  }, [orgId])

  useEffect(() => {
    const allProjects = getProjects()
    const allTasks = getTasks()
    const allUsers = getUsers()

    const orgProjects = allProjects.filter((p) => p.organizationId === orgId)
    const orgTasks = allTasks.filter((t) => t.organizationId === orgId)
    const completedTasks = orgTasks.filter((t) => t.status === 'Done')
    const orgMembers = allUsers.filter((u) => u.organizationIds.includes(orgId))

    setLiveMetrics({
      projectsCount: orgProjects.length,
      tasksCompleted: completedTasks.length,
      teamSize: orgMembers.length,
    })
  }, [orgId])

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoadingAnalytics(true)
      try {
        const data = await getAnalytics({ organizationId: orgId, dateRange: '30d' })
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to load dashboard analytics data', err)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }
    loadAnalytics()
  }, [orgId])

  const saveLayout = (updated: WidgetConfig[]) => {
    setWidgets(updated)
    localStorage.setItem(`dashboard_layout_${orgId}`, JSON.stringify(updated))
  }

  const toggleVisibility = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    saveLayout(updated)
  }

  const changeColSpan = (id: string, colSpan: 1 | 2 | 3) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, colSpan } : w))
    saveLayout(updated)
  }

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= widgets.length) return

    const updated = [...widgets]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    saveLayout(updated)
  }

  const handleResetLayout = () => {
    saveLayout(DEFAULT_WIDGETS)
  }

  const statCardsData = [
    { label: 'Total Revenue', value: orgId === 'org-1' ? '$143,000' : orgId === 'org-2' ? '$98,500' : '$45,200', change: '+12.4%', positive: true },
    { label: 'Active Users', value: orgId === 'org-1' ? '2,180' : orgId === 'org-2' ? '1,420' : '820', change: '+8.7%', positive: true },
    { label: 'Conversion Rate', value: orgId === 'org-1' ? '3.24%' : orgId === 'org-2' ? '2.85%' : '1.92%', change: '+0.3%', positive: true },
    { label: 'Active Projects', value: liveMetrics.projectsCount, change: 'active', positive: true },
    { label: 'Tasks Completed', value: liveMetrics.tasksCompleted, change: 'completed', positive: true },
    { label: 'Team Size', value: liveMetrics.teamSize, change: 'members', positive: true },
  ]

  return (
    <DashboardLayout pageTitle="Overview">
      <div className="relative space-y-6">

        {isSwitching && (
          <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-slate-950/70 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col items-center gap-3">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-200">Switching Workspace...</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
              </h1>
              {user?.role && <RoleBadge role={user.role} size="md" />}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Email: <span className="text-slate-300 font-medium">{user?.email}</span> | Workspace:{' '}
              <span className="text-indigo-400 font-semibold">{activeOrganization?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomizer(true)}
              id="customize-btn"
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Customize View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {widgets.map((widget, _index) => {
            if (!widget.visible) return null

            let colClass = 'md:col-span-1'
            if (widget.colSpan === 2) colClass = 'md:col-span-2'
            if (widget.colSpan === 3) colClass = 'md:col-span-3'

            return (
              <div key={widget.id} className={`${colClass} transition-all duration-300`}>
                {widget.id === 'kpis' && (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                    {statCardsData.map((s) => (
                      <StatCard key={s.label} {...s} isLoading={isLoadingAnalytics} />
                    ))}
                  </div>
                )}

                {widget.id === 'revenue' && (
                  <RevenueChart data={analytics?.revenueTrend || []} isLoading={isLoadingAnalytics} />
                )}

                {widget.id === 'donut' && (
                  <ProjectDistribution data={analytics?.projectDistribution || []} isLoading={isLoadingAnalytics} />
                )}

                {widget.id === 'users' && (
                  <ActivityChart data={analytics?.userActivity || []} isLoading={isLoadingAnalytics} />
                )}

                {widget.id === 'activity' && (
                  <RecentActivity activities={analytics?.recentActivity || []} isLoading={isLoadingAnalytics} />
                )}
              </div>
            )
          })}
        </div>

        {showCustomizer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setShowCustomizer(false)} />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Customize Layout</h2>
                      <p className="text-xs text-slate-400 mt-1">Configure layout options for {activeOrganization?.name}.</p>
                    </div>
                    <button
                      onClick={() => setShowCustomizer(false)}
                      className="rounded-lg p-1 text-slate-500 hover:text-white hover:bg-slate-800"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {widgets.map((widget, idx) => (
                      <div key={widget.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 hover:border-slate-700 transition">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{widget.title}</span>
                          <input
                            type="checkbox"
                            checked={widget.visible}
                            onChange={() => toggleVisibility(widget.id)}
                            className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>

                        {widget.visible && (
                          <div className="flex items-center justify-between text-xs gap-3">
                            <div className="space-y-1">
                              <span className="text-slate-400">Widget Width</span>
                              <div className="flex items-center gap-1">
                                {([1, 2, 3] as const).map((width) => (
                                  <button
                                    key={width}
                                    type="button"
                                    onClick={() => changeColSpan(widget.id, width)}
                                    className={`px-2 py-1 rounded border ${widget.colSpan === width
                                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                                      }`}
                                  >
                                    {width === 1 ? '1/3' : width === 2 ? '2/3' : 'Full'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1 text-right">
                              <span className="text-slate-400 block mb-1">Reorder</span>
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveWidget(idx, 'up')}
                                  className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === widgets.length - 1}
                                  onClick={() => moveWidget(idx, 'down')}
                                  className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <button
                      onClick={handleResetLayout}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 transition"
                    >
                      Reset Layout
                    </button>
                    <button
                      onClick={() => setShowCustomizer(false)}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/15"
                    >
                      Close Customizer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}