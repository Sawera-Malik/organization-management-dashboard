interface BadgeProps {
  label: string
  variant?: 'default' | 'status' | 'priority'
}

const statusColors: Record<string, string> = {
  'Backlog': 'bg-gray-100 text-gray-600',
  'To Do': 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-amber-50 text-amber-700',
  'Review': 'bg-purple-50 text-purple-700',
  'Completed': 'bg-emerald-50 text-emerald-700',
  'Active': 'bg-emerald-50 text-emerald-700',
  'Inactive': 'bg-gray-100 text-gray-500',
}

const priorityColors: Record<string, string> = {
  'Critical': 'bg-red-50 text-red-700',
  'High': 'bg-orange-50 text-orange-700',
  'Medium': 'bg-yellow-50 text-yellow-700',
  'Low': 'bg-gray-100 text-gray-600',
}

const priorityDots: Record<string, string> = {
  'Critical': 'bg-red-500',
  'High': 'bg-orange-500',
  'Medium': 'bg-yellow-500',
  'Low': 'bg-gray-400',
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  let cls = 'bg-gray-100 text-gray-600'
  let dot = ''

  if (variant === 'status') cls = statusColors[label] || cls
  if (variant === 'priority') {
    cls = priorityColors[label] || cls
    dot = priorityDots[label] || ''
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {variant === 'priority' && dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      )}
      {label}
    </span>
  )
}
