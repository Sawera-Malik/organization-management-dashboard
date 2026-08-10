import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { usePermissions } from '../../hooks/usePermissions'
import { AccessDenied } from '../../components/auth/AccessDenied'
import { useOrganization } from '../../hooks/useOrganization'
import { getAnalytics } from '../../services/analyticsService'
import { DateRangeSelector, type DateRangeValue } from '../../components/analytics/DateRangeSelector'
import { StatCard } from '../../components/analytics/StatCard'
import { RevenueChart } from '../../components/analytics/RevenueChart'
import { ActivityChart } from '../../components/analytics/ActivityChart'
import { ProjectDistribution } from '../../components/analytics/ProjectDistribution'
import { RecentActivity } from '../../components/analytics/RecentActivity'
import type { AnalyticsData } from '../../types/analytics'

export function AnalyticsPage() {
  const { hasPermission } = usePermissions()
  const { activeOrganization } = useOrganization()
  
  const [dateRange, setDateRange] = useState<DateRangeValue>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [simulateError, setSimulateError] = useState(false)

  const fetchAnalytics = useCallback(async (shouldForceFail = false) => {
    if (!activeOrganization) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getAnalytics({
        organizationId: activeOrganization.id,
        dateRange,
        shouldFail: shouldForceFail,
      })
      setAnalyticsData(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve workspace metrics.')
    } finally {
      setIsLoading(false)
    }
  }, [activeOrganization, dateRange])

  useEffect(() => {
    fetchAnalytics(simulateError)
  }, [fetchAnalytics, simulateError])

  const handleRetry = () => {
    setSimulateError(false)
    fetchAnalytics(false)
  }

  if (!hasPermission('analytics.view')) {
    return (
      <DashboardLayout pageTitle="Analytics">
        <AccessDenied message="You do not have permission to view workspace analytics." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="Analytics">
        <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 max-w-md shadow-2xl flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 mb-4 border border-red-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Unable to load analytics</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">{error}</p>
            <button
              id="retry-analytics-btn"
              type="button"
              onClick={handleRetry}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-red-600/20"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined) return '$0'
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })
  }

  const isEmptyState =
    !isLoading &&
    analyticsData &&
    analyticsData.revenue === 0 &&
    analyticsData.activeUsers === 0 &&
    analyticsData.projects === 0

  return (
    <DashboardLayout pageTitle="Analytics">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Workspace: <span className="text-indigo-400 font-semibold">{activeOrganization?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 select-none hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50"
              />
              Simulate Failure
            </label>

            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              disabled={isLoading}
            />
          </div>
        </div>

        {isEmptyState ? (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 max-w-md shadow-2xl flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400 mb-4 border border-slate-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4a2 2 0 00-2 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2v-1a2 2 0 00-2-2H2" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">No analytics available</h2>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                There isn't enough active data to compile performance reports for this period in this organization.
              </p>
              <p className="text-xs text-slate-500">
                Try selecting a different date range or workspace organization above.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard
                label="Revenue"
                value={formatCurrency(analyticsData?.revenue)}
                change={analyticsData?.monthlyGrowth ?? 0}
                positive={true}
                isLoading={isLoading}
              />
              <StatCard
                label="Active Users"
                value={analyticsData?.activeUsers?.toLocaleString() ?? '0'}
                change="8.2%"
                positive={true}
                isLoading={isLoading}
              />
              <StatCard
                label="Conversion Rate"
                value={`${analyticsData?.conversionRate ?? 0}%`}
                change="2.4%"
                positive={true}
                isLoading={isLoading}
              />
              <StatCard
                label="Projects"
                value={analyticsData?.projects ?? '0'}
                change="+4"
                positive={true}
                isLoading={isLoading}
              />
              <StatCard
                label="Tasks Completed"
                value={analyticsData?.tasksCompleted?.toLocaleString() ?? '0'}
                change="this month"
                positive={true}
                isLoading={isLoading}
              />
              <StatCard
                label="Monthly Growth"
                value={`${analyticsData?.monthlyGrowth ?? 0}%`}
                change="+1.8%"
                positive={true}
                isLoading={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RevenueChart
                  data={analyticsData?.revenueTrend ?? []}
                  isLoading={isLoading}
                />
              </div>

              <div>
                <ProjectDistribution
                  data={analyticsData?.projectDistribution ?? []}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActivityChart
                  data={analyticsData?.userActivity ?? []}
                  isLoading={isLoading}
                />
              </div>

              <div>
                <RecentActivity
                  activities={analyticsData?.recentActivity ?? []}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
