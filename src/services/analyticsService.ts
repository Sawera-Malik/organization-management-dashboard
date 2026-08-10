import rawAnalyticsData from '../data/analytics.json'
import type { AnalyticsData, AnalyticsActivity, DistributionPoint } from '../types/analytics'
import { getProjects, getTasks, getUsers } from './dbService'

const analyticsDb = rawAnalyticsData as Record<string, Record<string, AnalyticsData>>

export interface GetAnalyticsParams {
  organizationId: string
  dateRange: string
  shouldFail?: boolean
}

export async function getAnalytics({
  organizationId,
  dateRange,
  shouldFail = false,
}: GetAnalyticsParams): Promise<AnalyticsData> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (shouldFail || organizationId === 'org-fail') {
    throw new Error('Server connection lost. Unable to fetch dashboard analytics.')
  }

  const orgProjects = getProjects().filter((p) => p.organizationId === organizationId)
  const orgTasks = getTasks().filter((t) => t.organizationId === organizationId)
  const orgUsers = getUsers().filter((u) => u.organizationIds.includes(organizationId))

  const statusCounts = orgProjects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalProjects = orgProjects.length || 1 
  const projectDistribution: DistributionPoint[] = Object.entries(statusCounts).map(([status, count]) => {
    let color = '#94a3b8'
    if (status === 'Active') color = '#6366f1' 
    if (status === 'Completed') color = '#22c55e' 
    if (status === 'On Hold') color = '#f59e0b' 
    
    return {
      status,
      count,
      percentage: Math.round((count / totalProjects) * 100),
      color
    }
  })

  const recentActivity: AnalyticsActivity[] = []
  
  orgProjects.slice(-3).forEach((p, i) => {
    const user = orgUsers.find(u => u.id === p.ownerId)
    recentActivity.push({
      id: `act-p-${p.id}`,
      user: user?.name || 'System',
      avatar: user?.avatar || 'SYS',
      action: 'created a new project',
      target: p.name,
      time: i === 0 ? 'Just now' : `${i + 1} hours ago`,
      avatarColor: user?.avatar ? '#3b82f6' : '#94a3b8'
    })
  })

  orgTasks.slice(-3).forEach((t, i) => {
    const user = orgUsers.find(u => u.id === t.assigneeId)
    recentActivity.push({
      id: `act-t-${t.id}`,
      user: user?.name || 'System',
      avatar: user?.avatar || 'SYS',
      action: 'created a new task',
      target: t.title,
      time: i === 0 ? '1 hour ago' : `${i * 2} hours ago`,
      avatarColor: user?.avatar ? '#10b981' : '#94a3b8'
    })
  })

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayIndex = new Date().getDay()
  const todayLabel = daysOfWeek[todayIndex]
  
  const orgUniqueActivityScore = orgProjects.length + orgTasks.length + (organizationId.charCodeAt(organizationId.length - 1) || 0)

  const userActivity = daysOfWeek.map(day => ({
    label: day,
    value: day === todayLabel ? (orgUniqueActivityScore > 0 ? (orgUniqueActivityScore % 80) + 15 : 0) : 0 
  }))

  const orgData = analyticsDb[organizationId]
  if (!orgData) {
    return {
      revenue: 0,
      activeUsers: orgUsers.length,
      conversionRate: 0,
      projects: orgProjects.length,
      tasksCompleted: orgTasks.filter(t => t.status === 'Done').length,
      monthlyGrowth: 0,
      revenueTrend: [
        { date: 'Mon', value: 0 },
        { date: 'Tue', value: 0 },
        { date: 'Wed', value: 0 },
        { date: 'Thu', value: 0 },
        { date: 'Fri', value: 0 },
        { date: 'Sat', value: 0 },
        { date: 'Sun', value: 0 },
      ],
      userActivity,
      projectDistribution,
      recentActivity,
    }
  }

  const rangeData = orgData[dateRange]
  if (!rangeData) {
    return {
      revenue: 0,
      activeUsers: 0,
      conversionRate: 0,
      projects: 0,
      tasksCompleted: 0,
      monthlyGrowth: 0,
      revenueTrend: [],
      userActivity: [],
      projectDistribution: [],
      recentActivity: [],
    }
  }

  const data = JSON.parse(JSON.stringify(rangeData)) as AnalyticsData
  
  data.projectDistribution = projectDistribution.length > 0 ? projectDistribution : data.projectDistribution
  if (recentActivity.length > 0) {
    data.recentActivity = recentActivity
    data.userActivity = userActivity
  }

  return data
}
