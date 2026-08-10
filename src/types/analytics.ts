export interface TrendPoint {
  date: string
  value: number
}

export interface ActivityPoint {
  label: string
  value: number
}

export interface DistributionPoint {
  status: string
  count: number
  percentage: number
  color: string
}

export interface AnalyticsActivity {
  id: string
  user: string
  avatar: string
  action: string
  target: string
  time: string
  avatarColor: string
}

export interface AnalyticsData {
  revenue: number
  activeUsers: number
  conversionRate: number
  projects: number
  tasksCompleted: number
  monthlyGrowth: number
  revenueTrend: TrendPoint[]
  userActivity: ActivityPoint[]
  projectDistribution: DistributionPoint[]
  recentActivity: AnalyticsActivity[]
}
